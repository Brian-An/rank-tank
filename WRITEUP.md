# Rank Tank

## Overview

Rank Tank is a drag-and-drop trivia game where players rank five items by a real-world metric before revealing the correct order and a score. The game runs on Next.js 16 with three modes: a rotating Daily Challenge, a Random mode with theme and difficulty selection, and an AI-powered Custom mode where players describe or randomize their own challenge.

---

## How AI Is Used

AI sits at the center of the experience in four places, all using GPT-4o-mini via the OpenAI API:

1. **Custom Category Generation** — Players type any natural language prompt ("rank planets by diameter") or hit *Surprise me* to get a randomly themed challenge. The model returns structured JSON matching the game's `Category` schema: five items in correct rank order with real-world values and formatted display strings. A curated set of 12 surprise prompts covers domains outside the seven static themes (ancient history, extreme weather, sea life, etc.) to maximize variety.
2. **Per-Item Explanations** — After submitting, all five item explanations are fetched in a single GPT call. Each card then shows a one-sentence fact explaining *why* that item ranks where it does ("Tungsten leads at 3,422°C because it has the strongest metallic bond of any element"). This turns a pure guessing game into a learning moment. Cards show a skeleton shimmer while the request is in flight and degrade silently if the API is unavailable.
3. **In-Game Hints** — A one-use *Need a hint?* link appears during gameplay. The model sees the player's current arrangement and the correct order, then names the single most out-of-position item with a directional nudge ("Move Svelte higher"). Values are never revealed. A static fallback string is returned on API failure so the button always functions.
4. **Post-Game Commentary** — A game-show-host persona generates 2–3 sentences of tailored commentary based on score, challenge title, and player ordering.

---

## How Data Is Used

Data flows through three layers with automatic fallback:

- **Live APIs** (highest priority for Daily): GitHub REST API for repository star counts, npm Downloads API for weekly package downloads, and Wikimedia Pageviews API for monthly article views. Results are cached server-side for 24 hours to avoid hammering rate limits.
- **Static local data**: 44 questions across seven themes - tech, music, geography, sports, business, science, and movies stored as JSON files. Values are sourced from authoritative references with years noted.
- **AI-generated data**: Custom and surprise categories are generated on demand, stored in `sessionStorage` under a UUID key, and read back by the game page on load. No server state is required.

---

## Key Design & Architectural Decisions

- **React Server Components for data fetching**: The game page is a server component (`GameLoader`) that fetches the round at request time. This keeps round selection logic (cache lookup → AI generation → local fallback) entirely server-side with no client waterfalls.
- **Seed-based determinism**: A string seed (date for daily, `Date.now()` for Play Again) runs through a Mulberry32 PRNG to shuffle items and pick from the local pool. The same seed always produces the same shuffle, useful for daily challenges where everyone sees the same items in the same initial order.
- **Server-side round cache bypass on re-play**: An in-memory `Map` caches AI-generated rounds per `theme:difficulty` to avoid redundant API calls on first load. This cache is skipped when an explicit seed param is present in the URL, so the seed controls selection from the local pool instead.

---

## Tools & Stack


| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Framework   | Next.js 16.2 (App Router, Turbopack)                        |
| Language    | TypeScript                                                  |
| Styling     | Tailwind CSS v4                                             |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable                           |
| AI          | OpenAI API — GPT-4o-mini                                    |
| Live Data   | GitHub REST API, npm Downloads API, Wikimedia Pageviews API |
| Icons       | lucide-react                                                |
| Deployment  | Vercel                                                      |


