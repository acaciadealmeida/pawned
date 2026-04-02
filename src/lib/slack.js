// slack.js — Sends messages to a Slack channel via a webhook.
//
// A webhook is just a URL that accepts data. When we send a POST request
// to this URL with a message, Slack posts that message in a channel.
//
// This is the same pattern your team uses for notifications:
// "when X happens in our app, tell Slack about it."

const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL

// sendSlackMessage — sends a text message to the Slack channel
// connected to the webhook URL.
//
// How it works:
//   1. We use fetch() to send an HTTP POST request to the Slack webhook URL
//   2. The body contains JSON with a "text" field — that's the message
//   3. Slack receives it and posts the message in the channel
export async function sendSlackMessage(text) {
  // If no webhook URL is configured, skip silently.
  // This lets the game work locally even without Slack set up.
  if (!SLACK_WEBHOOK_URL) {
    console.log('No Slack webhook configured. Message:', text)
    return
  }

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}
