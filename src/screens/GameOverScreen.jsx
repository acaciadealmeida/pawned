// GameOverScreen.jsx — Shows after 3 misses.
//
// This screen ties together several concepts:
// 1. Form handling — capturing the player's name
// 2. API call #1 — submitting the score to Supabase (database INSERT)
// 3. API call #2 — checking if this is the highest score (database SELECT)
// 4. Webhook — if it IS a new high score, send a Slack message

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sendSlackMessage } from '../lib/slack'

function GameOverScreen({ score, onPlayAgain }) {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isHighScore, setIsHighScore] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // handleSubmit — saves the score to the database and checks for high score
  async function handleSubmit(e) {
    e.preventDefault()  // Prevent the form from reloading the page (default browser behavior)

    if (!name.trim() || submitting) return
    setSubmitting(true)

    // API CALL #1: Insert the score into the "scores" table
    // This is like adding a new row to a spreadsheet
    const { error: insertError } = await supabase
      .from('scores')
      .insert({ name: name.trim(), score })

    if (insertError) {
      console.error('Failed to save score:', insertError)
      setSubmitting(false)
      return
    }

    // API CALL #2: Check if this is the new highest score
    // We fetch the top score and compare it to ours
    const { data: topScores } = await supabase
      .from('scores')
      .select('score')
      .order('score', { ascending: false })
      .limit(1)

    const isNewHighScore = topScores && topScores[0]?.score <= score

    if (isNewHighScore) {
      setIsHighScore(true)

      // WEBHOOK: Send a Slack message announcing the new high score!
      // This is where the webhook fires — a POST request to the Slack URL
      await sendSlackMessage(
        `🐱 New high score! ${name.trim()} scored ${score} in Pawn-ed! 🏆`
      )
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="screen gameover-screen">
      <h1 className="gameover-title">Game Over</h1>
      <div className="final-score">
        <span className="final-score-number">{score}</span>
        <span className="final-score-label">points</span>
      </div>

      {!submitted ? (
        // The score submission form
        <form onSubmit={handleSubmit} className="score-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            className="submit-button"
            disabled={!name.trim() || submitting}
          >
            {submitting ? 'Saving...' : 'Submit score'}
          </button>
        </form>
      ) : (
        // After submission — show confirmation and maybe high score celebration
        <div className="submitted">
          {isHighScore && (
            <div className="high-score-celebration">
              🏆 NEW HIGH SCORE! 🏆
            </div>
          )}
          <p>Score saved!</p>
        </div>
      )}

      <button className="play-again-button" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}

export default GameOverScreen
