// StartScreen.jsx — The first screen players see.
// Shows the game title, a silly tagline, Play, then the leaderboard.
//
// "onPlay" is a function passed down from App.jsx.
// When the player clicks Play, it tells App to switch to the Game screen.
// This pattern is called "lifting state up" — the parent (App) controls
// which screen is showing, and the child (StartScreen) just says "I was clicked."

import { useEffect } from 'react'
import Leaderboard from '../components/Leaderboard'
import catImage from '../assets/cat.png'
import openingBg from '../assets/opening-2.png'

function StartScreen({ onPlay }) {
  // Enter / Space start the game (same keys as Play Again on game over for consistency).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      onPlay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onPlay])

  return (
    <div className="start-screen-root">
      {/* Full-viewport background: cover = fill height, center, crop sides (see App.css .screen-bg). */}
      <div
        className="screen-bg screen-bg--start"
        style={{ backgroundImage: `url(${openingBg})` }}
        aria-hidden
      />
      <div className="screen start-screen">
        <img src={catImage} alt="A mischievous ink-wash cat" className="start-cat" />
        <h1 className="game-title">Pawn-ed</h1>
        <p className="tagline">Get off my table</p>

        <button type="button" className="play-button" onClick={onPlay}>
          Play
        </button>

        <Leaderboard />
      </div>
    </div>
  )
}

export default StartScreen
