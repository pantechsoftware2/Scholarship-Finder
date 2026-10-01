# SEO Measurement Contract

Created: 2026-10-01

## Primary Conversion

`scholarship_match_request`: a visitor submits the scholarship profile form and receives/generated scholarship results.

## Required Data Sources

- Google Search Console property for `https://www.fundmystudyabroad.com/`
- Web analytics for landing pages, form starts, successful match requests, lead capture, and referral source
- Vercel deployment IDs and production domain assignments
- Optional AI visibility samples from ChatGPT, Claude, Perplexity, Gemini, Copilot, or other approved tools

## Baseline Rules

- Compare complete 28-day windows in the configured timezone.
- Keep brand, non-brand, country, device, page, and query/page datasets separate.
- Do not join query totals to page totals unless a joint query/page export is available.
- Treat missing analytics access as unknown, not zero.
- Treat implementation verification, search observations, AI observations, and business outcomes as separate statuses.

## Current Access Limits

Search Console, analytics, deployment ID, and scheduler access were not available in this workspace during the 2026-10-01 implementation run.
