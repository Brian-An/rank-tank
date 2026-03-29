# Live Data Categories Design

**Date:** 2026-03-28
**Status:** Approved

## Goal

Replace three hardcoded JSON categories with live API-fetched data so that rankings reflect real-world numbers that shift over time. Meets the "non-trivial dataset" and "dynamic behavior" criteria without adding a database or new dependencies.

## Live Categories

| Category ID | API | What changes |
|---|---|---|
| `github-stars` | `https://api.github.com/repos/{owner}/{repo}` | Star counts update as repos grow |
| `npm-weekly-downloads` | `https://api.npmjs.org/downloads/point/last-week/{pkg}` | Downloads shift week to week |
| `wikipedia-pageviews` | `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{article}/monthly/{YYYYMMDD}/{YYYYMMDD}` | Monthly pageviews change with current events |

All three APIs are free, require no authentication, and return JSON. The items being ranked (which repos, packages, articles) are fixed; only the numeric values are live.

**Fixed items per category:**
- `github-stars`: freeCodeCamp, free-programming-books, awesome, coding-interview-university, developer-roadmap (matches existing static category)
- `npm-weekly-downloads`: tslib, lodash, react, axios, express (matches existing static category)
- `wikipedia-pageviews`: United States, India, YouTube, United Kingdom, Barack Obama (consistently high-traffic articles with meaningful variation)

The `source` field is updated to e.g. `"GitHub API, live"` so players can see the data is fresh.

## Architecture

### New file: `lib/liveCategories.ts`

- Exports `fetchLiveCategories(): Promise<Category[]>` — fetches all three APIs in parallel
- Owns an in-memory cache: `Map<string, { data: Category[]; fetchedAt: number }>`
- Cache key: `"live"`, TTL: 24 hours (`Date.now() - fetchedAt < 86_400_000`)
- On cache hit: returns cached categories immediately
- On cache miss: fetches all three in parallel, stores result, returns categories
- Per-fetch error handling: if any single API call fails (network error, non-200, invalid JSON), that category is silently dropped — the others still return

### Modified: `app/api/round/route.ts`

In the `mode === 'daily'` branch, try live categories first:

```
getLiveDailyRound(date):
  1. Call fetchLiveCategories()
  2. If result has ≥ 1 category, pick one using existing pickIndex(pool.length, date) seed logic
  3. If result is empty (all fetches failed), fall back to getLocalRound(date)
```

No changes to the random round path, game UI, scoring, or commentary.

## Error Handling

- Any fetch that throws or returns non-200 is caught and skipped silently
- If all three fetches fail, the daily round falls back to the existing static local pool
- No error surfaces to the player — the game always has a round

## Caching

- In-memory Map with timestamp, same pattern as existing `roundCache.ts`
- 24-hour TTL means data refreshes at most once per server process lifetime per day
- On Vercel, cold starts will re-fetch — acceptable since fetches are fast (<200ms)
- No persistent cache layer needed; stale-on-restart is fine for a daily game

## Data Staleness

- GitHub stars update in real time; our 24hr cache means values are at most 1 day old
- npm downloads are weekly aggregates; fetching daily is fine
- Wikipedia pageviews uses the prior full month as the window, so values are stable within a month

## What Is Not Changing

- Game UI, scoring, drag-and-drop — untouched
- Random round path — untouched
- Static JSON fallback datasets — unchanged, still used for random rounds and as fallback
- Commentary system — untouched
- No new npm dependencies
- No database
