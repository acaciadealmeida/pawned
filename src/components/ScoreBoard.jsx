// ScoreBoard.jsx — Shows current score and remaining lives during the game.
// This is a "presentational" component — it just displays data passed to it.
// It doesn't manage any state of its own.

function ScoreBoard({ score, misses, maxMisses }) {
  // Create an array of hearts: filled for remaining lives, empty for lost ones
  const lives = Array.from({ length: maxMisses }, (_, i) =>
    i < maxMisses - misses ? '❤️' : '🖤'
  )

  return (
    <div className="scoreboard">
      <div className="scoreboard-score">Score: {score}</div>
      <div className="scoreboard-lives">{lives.join(' ')}</div>
    </div>
  )
}

export default ScoreBoard
