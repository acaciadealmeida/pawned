// GameScreen.jsx — The core gameplay screen.
//
// How it works:
// 1. A cat paw swings left-to-right like a pendulum
// 2. A target object (vase) sits on a table
// 3. Player clicks/taps/presses Enter to swat
// 4. We check if the paw is close enough to the target — that's "hit detection"
// 5. Hit → score +1, paw speeds up. Miss → lose a life.
// 6. After 3 misses → game over.
//
// IMPORTANT: The paw position is driven entirely by JavaScript (not CSS animation).
// This means the angle we calculate for hit detection is the SAME angle
// used to visually rotate the pendulum — no sync issues.

import { useState, useRef, useCallback, useEffect } from 'react'
import ScoreBoard from '../components/ScoreBoard'
import catArmImg from '../assets/cat-arm.png'
import catPawImg from '../assets/cat-paw.png'
import vaseImg from '../assets/vase.png'

const MAX_MISSES = 3
const BASE_SPEED = 2000         // Starting swing duration in ms (slower = easier)
const SPEED_DECREASE = 150      // How much faster each round gets (ms removed)
const MIN_SPEED = 600           // Fastest possible swing (so it doesn't become impossible)
const HIT_ZONE = 12             // How close the paw needs to be to the target (in degrees)
const SWING_ANGLE = 40          // Max rotation in degrees (swings -40 to +40)

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
  // This is the SINGLE SOURCE OF TRUTH for where the paw is.
  const [angle, setAngle] = useState(-SWING_ANGLE)

  // Direction flips each round: 1 = starts from left, -1 = starts from right.
  // This keeps the player on their toes — you can't just learn one rhythm.
  const [direction, setDirection] = useState(1)

  // Refs to track animation timing without causing re-renders
  const animationStart = useRef(Date.now())
  const rafId = useRef(null)
  const swattingRef = useRef(false)

  // Keep the ref in sync with state (refs are needed inside requestAnimationFrame)
  useEffect(() => {
    swattingRef.current = swatting
  }, [swatting])

  // Reset animation timer when speed changes (new round)
  useEffect(() => {
    animationStart.current = Date.now()
  }, [speed])

  // The animation loop — runs every frame (~60fps) and updates the pendulum angle.
  // requestAnimationFrame is the standard way to do smooth animations in JS.
  useEffect(() => {
    function animate() {
      if (!swattingRef.current) {
        const elapsed = Date.now() - animationStart.current
        const progress = (elapsed % speed) / speed
        // cos() creates smooth back-and-forth motion: -40 → 0 → +40 → 0 → -40
        // direction flips which side it starts from each round
        const newAngle = -SWING_ANGLE * Math.cos(progress * Math.PI * 2) * direction
        setAngle(newAngle)
      }
      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    // Cleanup: stop the animation loop when the component unmounts
    return () => cancelAnimationFrame(rafId.current)
  }, [speed, direction])

  // handleSwat — called when the player clicks/taps/presses Enter
  const handleSwat = useCallback(() => {
    if (feedback || swatting) return  // Ignore clicks during animations

    setSwatting(true)

    // Hit detection uses the SAME angle that's visually displayed.
    // No more sync issues — what you see is what gets checked.
    const distance = Math.abs(angle)
    const isHit = distance < HIT_ZONE

    if (isHit) {
      setFeedback('hit')
      setTargetVisible(false)
      // Trigger the screen shake — a brief jolt that makes hits feel impactful
      setShaking(true)
      setTimeout(() => setShaking(false), 300)

      // After the hit animation, set up the next round
      setTimeout(() => {
        const newScore = score + 1
        setScore(newScore)
        setFeedback(null)
        setTargetVisible(true)
        setSwatting(false)
        // Speed up! But don't go below the minimum
        setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_DECREASE))
        // Flip the swing direction for the next round
        setDirection((prev) => prev * -1)
      }, 800)
    } else {
      setFeedback('miss')

      setTimeout(() => {
        const newMisses = misses + 1
        setMisses(newMisses)
        setFeedback(null)
        setSwatting(false)

        // 3 misses = game over
        if (newMisses >= MAX_MISSES) {
          onGameOver(score)
        }
      }, 600)
    }
  }, [feedback, swatting, angle, score, misses, onGameOver])

  // Listen for Enter / Space key presses — same as clicking/tapping
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

  return (
    <div className={`screen game-screen ${shaking ? 'shake' : ''}`} onClick={handleSwat}>
      <ScoreBoard score={score} misses={misses} maxMisses={MAX_MISSES} />

      {/* The game arena — table with target and swinging paw */}
      <div className="arena">
        {/* The pendulum — rotated via inline style using the JS-calculated angle.
            No CSS animation — JS drives everything so hit detection is always accurate. */}
        <div
          className={`pendulum ${swatting ? 'pendulum-swat' : ''}`}
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* The arm — the cat's sumi-e ink wash arm (includes paw at the end) */}
          <img src={catArmImg} alt="" className="pendulum-arm" />
        </div>

        {/* The table surface */}
        <div className="table-surface">
          {/* The target object — a vase that gets knocked off on hit */}
          <div className={`target ${!targetVisible ? 'target-hit' : ''} ${feedback === 'miss' ? 'target-miss' : ''}`}>
            <img src={vaseImg} alt="Vase" className="target-img" />
          </div>
        </div>
      </div>

      {/* Feedback text — shows briefly on hit or miss */}
      {feedback === 'hit' && <div className="feedback feedback-hit">Pawned!</div>}
      {feedback === 'miss' && <div className="feedback feedback-miss">Tsk!</div>}

      <p className="tap-hint">Click, tap or press enter to remove intruder</p>
    </div>
  )
}

export default GameScreen
