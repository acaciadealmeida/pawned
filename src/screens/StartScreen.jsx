// StartScreen.jsx — The first screen players see.
// Shows the game title, a silly tagline, the leaderboard, and a play button.
//
// "onPlay" is a function passed down from App.jsx.
// When the player clicks Play, it tells App to switch to the Game screen.
// This pattern is called "lifting state up" — the parent (App) controls
// which screen is showing, and the child (StartScreen) just says "I was clicked."

import Leaderboard from '../components/Leaderboard'
import catImage from '../assets/cat.png'

function StartScreen({ onPlay }) {
  return (
    <div className="screen start-screen">
      <img src={catImage} alt="A mischievous ink-wash cat" className="start-cat" />
      <h1 className="game-title">Pawn-ed</h1>
      <p className="tagline">Get off my table</p>

      <Leaderboard />

      <button className="play-button" onClick={onPlay}>
        Play
      </button>
    </div>
  )
}

export default StartScreen
