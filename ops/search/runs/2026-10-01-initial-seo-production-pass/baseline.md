# Baseline

Run date: 2026-10-01

## Live Checks

- `https://www.fundmystudyabroad.com/` returned `200 OK`.
- `https://fundmystudyabroad.com/` returned `308 Permanent Redirect` to `https://www.fundmystudyabroad.com/`.
- `https://www.fundmystudyabroad.com/robots.txt` returned `200 OK` as `text/plain`.
- `https://www.fundmystudyabroad.com/definitely-not-real-seo-check` returned `200 OK` and the homepage shell before this change.

## Main Findings

- The live homepage source body did not contain the primary offer, FAQ, form description, or internal page links before JavaScript execution.
- Unknown paths were soft-200 responses.
- Static `/how-it-works`, `/countries`, `/robots.txt`, and `/sitemap.xml` already existed locally.

## Data Not Available

- Search Console impressions/clicks/index coverage.
- Analytics conversion data.
- Field Core Web Vitals.
- Deployment ID and rollback reference.
