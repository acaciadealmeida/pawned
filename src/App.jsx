// App.jsx — The "traffic controller" of our game.
// It tracks which screen to show and passes data between screens.
// Think of it like a Figma prototype's flow between frames.

import { useState } from 'react'
import StartScreen from './screens/StartScreen'
import GameScreen from './screens/GameScreen'
import GameOverScreen from './screens/GameOverScreen'
import './App.css'

function App() {
  // "screen" controls which screen is visible. It can be: "start", "game", or "gameover"
  const [screen, setScreen] = useState('start')

  // "score" holds the player's current score, shared between Game and GameOver screens
  const [score, setScore] = useState(0)

  return (
    <div className="app">
      {/* Conditional rendering: show a different screen based on the "screen" state */}
      {screen === 'start' && (
        <StartScreen onPlay={() => setScreen('game')} />
      )}

      {screen === 'game' && (
        <GameScreen
          onGameOver={(finalScore) => {
            setScore(finalScore)
            setScreen('gameover')
          }}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          score={score}
          onPlayAgain={() => {
            setScore(0)
            setScreen('start')
          }}
        />
      )}
    </div>
  )
}

export default App
