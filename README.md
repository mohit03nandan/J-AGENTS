# J-AGENTS — Job discovery + tailoring agent

Twice-daily agent that finds SDET / QA Automation / SDE-1 jobs matching Mohit's profile, scores them with Claude, drafts a tailored cover letter, and delivers a digest with 1-click apply links.

## Flow

```
GitHub Actions cron (09:00 & 19:00 IST)
        │
        ▼
  1. Discover  →  JSearch API (aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter…)
  2. Score     →  Claude scores fit + writes strengths/gaps + drafts cover letter
  3. Digest    →  digests/YYYY-MM-DD.md committed to repo
                  + optional email via Resend
  4. You       →  Open digest, read 🟢 top matches, copy cover letter, click Apply
```

**Why hybrid?** Full-auto scraping+submitting to LinkedIn triggers bot detection and account bans. Semi-auto (agent finds + drafts, you tap Apply) gets ~90% of the speed benefit with zero account risk and better response rates on tailored applications.

## One-time setup

### 1. Install
```bash
npm install
cp .env.example .env
```

### 2. Get the two required API keys

**Anthropic** — https://console.anthropic.com/settings/keys → paste into `ANTHROPIC_API_KEY`

**JSearch on RapidAPI** — https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Sign up (free)
- Subscribe to the **Basic (Free)** plan — 500 requests/month
- Copy your key from the "X-RapidAPI-Key" header shown on any endpoint page
- Paste into `RAPIDAPI_KEY`

### 3. (Optional) Email digest via Resend

If you skip this, you still get the full digest as a Markdown file in `digests/` — just open it on GitHub after each run.

- Sign up at https://resend.com (free tier = 100 emails/day)
- Create an API key → paste into `RESEND_API_KEY`
- Sender: use `onboarding@resend.dev` for now (works with no domain verification)

### 4. Local test run
```bash
npm run run:agent
```

You should see a new file `digests/<timestamp>.md`. Open it — this is what you'll get twice daily.

### 5. Deploy to GitHub

Push to a GitHub repo, then in Settings → Secrets and variables → Actions:

**Secrets:**
- `ANTHROPIC_API_KEY`
- `RAPIDAPI_KEY`
- `RESEND_API_KEY` (if using email)

**Variables:**
- `DIGEST_TO_EMAIL` = `mohitnandan81825@gmail.com`
- `DIGEST_FROM_EMAIL` = `onboarding@resend.dev`

Cron fires at 09:00 and 19:00 IST. The workflow commits `digests/*.md` and updated `data/applications.json` back to the repo automatically.

## What lives where

| Path | Purpose |
| --- | --- |
| `src/config/profile.ts` | Your resume as structured data |
| `src/config/preferences.ts` | Titles, CTC, keyword filters |
| `src/discovery/jsearch.ts` | JSearch API client |
| `src/matching/score.ts` | Claude scoring + cover letter |
| `src/notifications/digest.ts` | Markdown + email digest |
| `src/storage/db.ts` | JSON state (dedupe seen jobs) |
| `data/applications.json` | Every job ever seen |
| `digests/*.md` | Every run's output — this is your inbox |

## Tuning

- **`preferences.runtime.minFitScoreToApply`** — jobs above this show in the 🎯 top matches section (default 65)
- **`preferences.runtime.minFitScoreToSurface`** — jobs above this appear in the digest at all (default 45)
- **`preferences.targetTitles`** — first 6 are queried each run (JSearch quota-friendly)

## Ongoing

- Each run costs: 1 JSearch API call per keyword (~6) + 1 Claude call per unique job (~10-30). Well within free tiers.
- Adjust `preferences.ts` and push — the next cron picks up the change.
- Applied to a job manually? Set its status in `data/applications.json` to prevent it appearing again (or just ignore — the dedupe by `id` keeps repeats out).
