---
name: producthunt-scraper
description: Scrape Product Hunt leaderboard and export top products as JSON. Use when the user wants to scrape Product Hunt, export product rankings, or get a list of top products from today, this week, or this month. Also trigger if the user wants trending products analysis, startup leaderboard data, or wants to compare products across time periods on Product Hunt.
---

# Product Hunt Scraper

Scrapes top products from the Product Hunt leaderboard via the official GraphQL API. No browser automation needed — makes direct HTTP calls to the GraphQL endpoint.

## Prerequisites

- **API Token**: Get one at https://www.producthunt.com/v2/oauth/applications
- Set the token via:
  - `.env` file in the project root: `PH_API_TOKEN=your_token_here`
  - Environment variable: `PH_API_TOKEN=your_token_here`
  - CLI flag: `--token your_token_here`

## Usage

Run from the project directory (`/Users/zhangfeng/.openclaw/skills/producthunt-scraper/app`):

```bash
pnpm start today              # Today's top 10 (default)
pnpm start week               # This week's top 10
pnpm start month -n 25        # This month's top 25
pnpm start today -n 50        # Today's top 50
pnpm start week --token TOKEN # Override token via flag
```

### CLI Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `period` | Time period: `today`, `week`, or `month` | Config default |
| `-n, --top <number>` | Number of products to scrape | Config default |

## Output Format

**You must report to the user using the exact format in the example below.**


```
──────────────────────────────────────────────────────────────────────
  Product Hunt Leaderboard — This Week  (3 products)
──────────────────────────────────────────────────────────────────────

  # 1  Influcio (462 votes)
        AI marketing Agent for result-driven influencer campaign
        https://www.producthunt.com/products/influcio-2?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+get+ranking+%28ID%3A+280772%29

  # 2  Panorama (288 votes)
        AI that finds your team's workflows and hidden structures
        https://www.producthunt.com/products/panorama?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+get+ranking+%28ID%3A+280772%29

  # 3  Tiny Aya (192 votes)
        Local, open-weight AI designed for real-world languages
        https://www.producthunt.com/products/cohere-2?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+get+ranking+%28ID%3A+280772%29

──────────────────────────────────────────────────────────────────────
```

## Project Structure

```
config.ts      - Default settings (root)
src/
├── index.ts   - CLI entry (commander)
├── scraper.ts - GraphQL API client (https, no browser)
├── output.ts  - Console printing & JSON save
└── types.ts   - TypeScript types
.env           - API token (do not commit)
```

## Technical Notes

1. **No browser needed** — Uses raw `https` requests to `api.producthunt.com/v2/api/graphql`
2. **Auto-retry** — Connection errors are retried up to 3 times
3. **Zero token persistence** — Token is never hard-coded, always read from env/env file/flags
