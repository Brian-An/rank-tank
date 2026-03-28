# Rank Tank

A game-show-style ranking web app. Players drag items into the correct order and score points based on accuracy.

## Features

- **Daily Challenge** — same round for everyone, seeded by date
- **Random Round** — choose a theme and difficulty; AI generates fresh categories via `gpt-4o-mini`
- **Works without an API key** — falls back to 20 curated local datasets
- **AI commentary** — witty game show host reacts to your score

## Setup

```bash
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `OPENAI_API_KEY` in Vercel → Settings → Environment Variables (optional)
4. Deploy

## Cost

With an API key, AI calls use `gpt-4o-mini` (~$0.0002/game). Without a key, all features work using local data and template commentary.

## Tech

- Next.js 16 App Router
- TypeScript, Tailwind CSS v4
- dnd-kit (drag and drop)
- OpenAI API (optional)
