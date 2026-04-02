// Leaderboard.jsx — Displays the top 5 scores from the database.
//
// This component makes an API call to Supabase when it first appears on screen.
// "API call" just means: our app asks Supabase "give me the top 5 scores"
// and Supabase sends back the data.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Leaderboard() {
  // State: the list of scores we've fetched from the database
  const [scores, setScores] = useState([])
  // State: whether we're still waiting for the data
  const [loading, setLoading] = useState(true)

  // useEffect runs code when the component first appears on screen.
  // This is where we fetch the leaderboard data.
  useEffect(() => {
    async function fetchScores() {
      // This is the API call! We're asking Supabase:
      // "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
      // (that's SQL — the language databases speak)
      const { data, error } = await supabase
        .from('scores')           // from the "scores" table
        .select('name, score')    // get the name and score columns
        .order('score', { ascending: false })  // highest scores first
        .limit(5)                 // only the top 5

      if (error) {
        console.error('Failed to fetch scores:', error)
      } else {
        setScores(data)
      }
      setLoading(false)
    }

    fetchScores()
  }, [])  // the empty [] means "run this once when the component loads"

  if (loading) return <div className="leaderboard">Loading scores...</div>
  if (scores.length === 0) return <div className="leaderboard">No scores yet. Be the first!</div>

  return (
    <div className="leaderboard">
      <h2>Top Scores</h2>
      <ol>
        {scores.map((entry, index) => (
          <li key={index} className="leaderboard-entry">
            <span className="leaderboard-name">{entry.name}</span>
            <span className="leaderboard-score">{entry.score}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Leaderboard
