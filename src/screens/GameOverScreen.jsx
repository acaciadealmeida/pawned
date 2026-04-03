// GameOverScreen.jsx — Shows after 3 misses.
//
// This screen ties together several concepts:
// 1. Form handling — capturing the player's name
// 2. API call #1 — submitting the score to Supabase (database INSERT)
// 3. API call #2 — checking if this is the highest score (database SELECT)
// 4. Webhook — if it IS a new high score, send a Slack message

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendSlackMessage } from '../lib/slack'

// Key for localStorage — remembers the last name you submitted on this browser.
// That way "Play Again" and future visits pre-fill the field (same device + same site).
const PLAYER_NAME_STORAGE_KEY = 'pawned-player-name'

function readStoredPlayerName() {
  try {
    const stored = localStorage.getItem(PLAYER_NAME_STORAGE_KEY)
    return stored ? stored.trim() : ''
  } catch {
    return ''
  }
}

function GameOverScreen({ score, onPlayAgain }) {
  // Initial state comes from localStorage so returning players see their name already filled in.
  const [name, setName] = useState(readStoredPlayerName)
  const [submitted, setSubmitted] = useState(false)
  const [isHighScore, setIsHighScore] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // handleSubmit — saves the score to the database and checks for high score
  async function handleSubmit(e) {
    e.preventDefault()  // Prevent the form from reloading the page (default browser behavior)

    if (!name.trim() || submitting) return

    // Without Supabase env vars we never created a client — can't save (see ../lib/supabase.js).
    if (!supabase) {
      console.warn('Supabase is not configured; copy .env.example to .env and add your keys.')
      return
    }

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

    // Remember this name locally — only after a successful save, not on every keystroke.
    try {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name.trim())
    } catch {
      /* ignore quota / private mode */
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

  // Enter / Space activate Play Again — unless focus is on the name field (then Enter submits, Space types).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return

      const tag = e.target?.tagName
      const typingInName = (tag === 'INPUT' || tag === 'TEXTAREA') && !submitted && supabase

      if (typingInName) {
        return
      }

      if (e.key === ' ') e.preventDefault()
      onPlayAgain()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // supabase is a stable module import — only submitted changes when the form path toggles.
  }, [submitted, onPlayAgain])

  return (
    <div className="screen gameover-screen">
      <h1 className="gameover-title">Game Over</h1>
      <div className="final-score">
        <span className="final-score-number">{score}</span>
        <span className="final-score-label">points</span>
      </div>

      {!submitted ? (
        supabase ? (
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
          <p className="score-form">
            Scores can&apos;t be saved until Supabase is configured — copy <code>.env.example</code> to{' '}
            <code>.env</code> and add your project URL and anon key.
          </p>
        )
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

      <button type="button" className="play-again-button" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}

export default GameOverScreen
