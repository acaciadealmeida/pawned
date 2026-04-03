# Pawn-ed

**Pawn-ed. Cozy cat-astrophe** — a small browser game where you swing a cat paw like a pendulum, tap to knock a vase off the table, and chase a high score. Built as a learning project: React on the front end, Supabase for scores, optional Slack when someone sets a new top score.

## Stack

- **React** + **Vite** — UI and dev/build tooling  
- **Supabase** — leaderboard (`scores` table)  
- **Vercel** (or any static host) — deploy the Vite production build  
- Optional **Slack incoming webhook** — celebrate new high scores  

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env: add your Supabase URL and anon key (and optional Slack / site URL).
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Environment variables

Copy [`.env.example`](.env.example) to `.env`. All public app variables use the `VITE_` prefix so Vite exposes them to the browser.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_SLACK_WEBHOOK_URL` | No | Slack webhook for new high-score messages |
| `VITE_SITE_URL` | No* | Production origin with **no** trailing slash, e.g. `https://your-app.vercel.app` — used at **build time** for Open Graph / Twitter preview image URLs |

\*Link previews in chat apps work best with a real `VITE_SITE_URL` on production builds. If unset, the build falls back to a root-relative image path (`/og-image.png`).

## Build

```bash
npm run build
npm run preview   # optional: serve dist/ locally
```

Set `VITE_SITE_URL` in Vercel (or your CI) before building so shared links show the cat image in previews.

## Deploy (Vercel)

1. Connect the repo and use the default Vite settings (build: `npm run build`, output: `dist`).  
2. Add the same environment variables as in `.env.example` in the Vercel project settings.  
3. Redeploy after changing env vars so `index.html` picks up `VITE_SITE_URL`.

## License

See the repository license file if one is present; otherwise all rights reserved by the project author.
