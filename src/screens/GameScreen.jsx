// GameScreen.jsx — The core gameplay screen.
//
// How it works:
// 1. A cat paw swings left-to-right like a pendulum
// 2. A target object (vase) sits on a table
// 3. Player clicks/taps/presses Enter to swat
// 4. Hit detection uses SAT.js — real 2D overlap of paw vs vase regions (see pawVaseCollision.js)
// 5. Hit → score +1, paw speeds up. Miss → lose a life.
// 6. After 3 misses → game over.
//
// IMPORTANT: The paw position is driven entirely by JavaScript (not CSS animation).
// The angle we calculate for hit detection is the SAME angle used to rotate the pendulum.

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import ScoreBoard from '../components/ScoreBoard'
import catArmImg from '../assets/cat-arm.png'
import gameBackgroundImg from '../assets/desktop-background.png'
import mobileBackgroundImg from '../assets/mobile background.png'
import vaseImg from '../assets/vase.png'
import { isPawHittingVase } from '../lib/pawVaseCollision'

const MAX_MISSES = 3
const BASE_SPEED = 2000         // Starting swing duration in ms (slower = easier)
const SPEED_DECREASE = 150      // How much faster each round gets (ms removed)
const MIN_SPEED = 600           // Fastest possible swing (so it doesn't become impossible)
const SWING_ANGLE = 40          // Max rotation in degrees (swings -40 to +40)


/** SAT paw/vase hit regions: visible in dev, or add ?debugHit=1 to the URL (production). */
function shouldShowHitDebug() {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debugHit') === '1'
}

function GameScreen({ onGameOver }) {
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [speed, setSpeed] = useState(BASE_SPEED)
  const [feedback, setFeedback] = useState(null)  // 'hit', 'miss', or null
  const [targetVisible, setTargetVisible] = useState(true)
  const [swatting, setSwatting] = useState(false)

  // Triggers the screen shake CSS animation on hit
  const [shaking, setShaking] = useState(false)

  // The current angle of the pendulum — updated every frame by requestAnimationFrame.
  const [angle, setAngle] = useState(-SWING_ANGLE)

  // Direction flips each round: 1 = starts from left, -1 = starts from right.
  const [direction, setDirection] = useState(1)

  // Refs for SAT collision: invisible regions aligned with art (see App.css).
  const pawHitRef = useRef(null)
  const vaseHitRef = useRef(null)

  // Refs to track animation timing without causing re-renders (initialized in useLayoutEffect — no Date.now in render).
  const animationStart = useRef(0)
  const rafId = useRef(null)
  const swattingRef = useRef(false)
  const speedRef = useRef(speed)
  const directionRef = useRef(direction)

  // Keep refs in sync with state (refs are needed inside requestAnimationFrame and handleSwat)
  useEffect(() => { swattingRef.current = swatting }, [swatting])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { directionRef.current = direction }, [direction])

  // Reset swing phase when speed changes; sync clock before paint so frame 0 matches the pendulum.
  useLayoutEffect(() => {
    animationStart.current = Date.now()
  }, [speed])

  // The animation loop — runs every frame (~60fps) and updates the pendulum angle.
  useEffect(() => {
    function animate() {
      if (!swattingRef.current) {
        const elapsed = Date.now() - animationStart.current
        const progress = (elapsed % speed) / speed
        const newAngle = -SWING_ANGLE * Math.cos(progress * Math.PI * 2) * direction
        setAngle(newAngle)
      }
      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId.current)
  }, [speed, direction])

  // handleSwat — called when the player clicks/taps/presses Enter
  const handleSwat = useCallback(() => {
    if (feedback || swatting) return  // Ignore clicks during animations

    setSwatting(true)

    // Same angle formula as the animation loop (matches the frame on screen).
    const elapsed = Date.now() - animationStart.current
    const progress = (elapsed % speedRef.current) / speedRef.current
    const currentAngle = -SWING_ANGLE * Math.cos(progress * Math.PI * 2) * directionRef.current

    // SAT overlap between oriented paw box and vase box (viewport coordinates).
    const isHit = isPawHittingVase(pawHitRef.current, vaseHitRef.current, currentAngle)

    if (isHit) {
      setFeedback('hit')
      setTargetVisible(false)
      setShaking(true)
      setTimeout(() => setShaking(false), 300)

      setTimeout(() => {
        const newScore = score + 1
        setScore(newScore)
        setFeedback(null)
        setTargetVisible(true)
        setSwatting(false)
        setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_DECREASE))
        setDirection((prev) => prev * -1)
      }, 800)
    } else {
      setFeedback('miss')

      setTimeout(() => {
        const newMisses = misses + 1
        setMisses(newMisses)
        setFeedback(null)
        setSwatting(false)

        if (newMisses >= MAX_MISSES) {
          onGameOver(score)
        }
      }, 600)
    }
  }, [feedback, swatting, score, misses, onGameOver])

  // Pointer events (not click) — on mobile, taps often don’t become click reliably when scroll/pan wins; touch-action: none on .game-screen helps too.
  const onGamePointerDown = useCallback(
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      handleSwat()
    },
    [handleSwat],
  )

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSwat()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwat])

  const hitDebug = shouldShowHitDebug()

  return (
    <div className="game-screen-root">
      <div
        className="screen-bg screen-bg--game screen-bg--desktop"
        style={{ backgroundImage: `url(${gameBackgroundImg})` }}
        aria-hidden
      />
      <div
        className="screen-bg screen-bg--game screen-bg--mobile"
        style={{ backgroundImage: `url(${mobileBackgroundImg})` }}
        aria-hidden
      />
      <div
        className={`screen game-screen ${shaking ? 'shake' : ''}${hitDebug ? ' game-screen--debug-hits' : ''}`}
        onPointerDown={onGamePointerDown}
      >
      <ScoreBoard score={score} misses={misses} maxMisses={MAX_MISSES} />

      <div className="arena">
        <div
          className={`pendulum ${swatting ? 'pendulum-swat' : ''}`}
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        >
          <img src={catArmImg} alt="" className="pendulum-arm" />
          {/* Strike zone for SAT — same transform as arm; size/position tuned in CSS */}
          <div ref={pawHitRef} className="paw-hit" aria-hidden />
        </div>

        <div className="table-surface">
          {targetVisible ? (
            <div className={`target ${feedback === 'miss' ? 'target-miss' : ''}`}>
              <img src={vaseImg} alt="Vase" className="target-img" />
              {/* After img so debug outline paints on top; pointer-events: none always */}
              <div ref={vaseHitRef} className="vase-hit" aria-hidden />
            </div>
          ) : (
            <div className="shatter">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`shard shard-${i}`}>
                  <img src={vaseImg} alt="" className="target-img" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {feedback === 'hit' && <div className="feedback feedback-hit">Pawn-ed!</div>}
      {feedback === 'miss' && <div className="feedback feedback-miss">Tsk!</div>}

      <p className="tap-hint">Enter, click or tap the vase</p>
      </div>
    </div>
  )
}

export default GameScreen
