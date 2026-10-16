# Production Sitemap SEO Audit — 2026-10-16

Production property: `fundmystudyabroad.com`  
Canonical origin: `https://www.fundmystudyabroad.com`  
Sitemap URL: `https://www.fundmystudyabroad.com/sitemap.xml`

## Executive assessment

The site has a valid, small-site XML sitemap at the domain root and advertises it in `robots.txt`. The preferred `www` HTTPS origin is consistently used in the sitemap, canonical tags, Open Graph metadata, and structured data. Production also permanently redirects the HTTP and non-`www` variants to the preferred origin.

This release tightens the implementation by removing sitemap fields Google ignores, adding truthful `lastmod` values to every indexable URL, exposing the sitemap from the footer of every public page, and adding build-time checks that prevent canonical-host and sitemap drift.

The sitemap supports discovery and crawl monitoring; it does not itself guarantee indexing or higher rankings. Rankings depend primarily on helpful content, relevance, site quality, links, and user experience.

## Audit scope and inventory

Only canonical, public, indexable pages belong in the sitemap.

| Canonical URL | Indexing intent | Included | `lastmod` |
| --- | --- | --- | --- |
| `https://www.fundmystudyabroad.com/` | Index | Yes | `2026-10-16` |
| `https://www.fundmystudyabroad.com/how-it-works` | Index | Yes | `2026-10-16` |
| `https://www.fundmystudyabroad.com/countries` | Index | Yes | `2026-10-16` |

Excluded by design:

- Generated scholarship results and thank-you states are user-specific application states, not stable landing pages. They use `noindex, nofollow` and have no standalone sitemap URLs.
- The custom 404 page uses `noindex, nofollow` and is not listed.
- Static assets, API routes, fragments, tracking parameters, HTTP URLs, non-`www` URLs, and Vercel preview URLs are not listed.

## Production host and canonical audit

Live response checks performed on 2026-10-16 produced this redirect chain:

| Requested variant | Production behavior | Result |
| --- | --- | --- |
| `http://fundmystudyabroad.com/` | `308` to `https://fundmystudyabroad.com/`, then `308` to `https://www.fundmystudyabroad.com/` | Pass; two hops |
| `https://fundmystudyabroad.com/` | `308` to `https://www.fundmystudyabroad.com/` | Pass |
| `http://www.fundmystudyabroad.com/` | `308` to `https://www.fundmystudyabroad.com/` | Pass |
| `https://www.fundmystudyabroad.com/` | `200` HTML | Pass |

The `www` HTTPS URL is therefore the production base. All sitemap locations use that exact origin. The one avoidable issue is the two-hop redirect from the HTTP non-`www` origin; if the hosting dashboard permits it, redirect that variant directly to the final `www` HTTPS URL. This is a minor efficiency improvement, not an indexing blocker.

Google treats permanent redirects and HTML canonical annotations as stronger canonicalization signals than sitemap inclusion. This implementation stacks all three signals consistently.

## Sitemap implementation audit

| Requirement | Status | Evidence or control |
| --- | --- | --- |
| Root-level XML sitemap | Pass | `/sitemap.xml` |
| Standard sitemap namespace | Pass | `http://www.sitemaps.org/schemas/sitemap/0.9` |
| UTF-8 XML declaration | Pass | Present in the first line |
| Absolute URLs | Pass | Every `<loc>` is a full HTTPS URL |
| Single host | Pass | Every URL uses `www.fundmystudyabroad.com` |
| Canonical URLs only | Pass | Sitemap inventory matches the three indexable pages |
| Accurate `lastmod` | Pass for release | Updated when links and sitemap controls changed on 2026-10-16 |
| Ignored fields removed | Pass | No `<priority>` or `<changefreq>` values |
| Advertised in `robots.txt` | Pass | Absolute `www` sitemap URL is present |
| Human discovery | Pass | Sitemap link appears in all public-page footers |
| Build regression checks | Pass | `npm run seo:check` validates URLs, host, dates, canonicals, footer links, and robots discovery |

Google ignores sitemap `priority` and `changefreq`. Accurate `lastmod` values may be used when they consistently represent significant page changes, so dates must not be refreshed automatically on every deployment.

## Search Console release procedure

1. Deploy the frontend production build.
2. Confirm these URLs return `200` without authentication:
   - `https://www.fundmystudyabroad.com/sitemap.xml`
   - `https://www.fundmystudyabroad.com/robots.txt`
3. In Google Search Console, use a **Domain property** for `fundmystudyabroad.com`. DNS verification covers HTTP, HTTPS, `www`, non-`www`, and other subdomains in one property.
4. Open **Indexing → Sitemaps** and submit `https://www.fundmystudyabroad.com/sitemap.xml` (or enter `sitemap.xml` if Search Console pre-fills the property origin).
5. Confirm the sitemap status becomes **Success** and the discovered-page count is `3`.
6. Use URL Inspection on each of the three canonical URLs. Verify that the declared canonical is the matching `www` URL and request indexing after deployment.
7. In the Page Indexing report, filter by the submitted sitemap. Investigate any excluded canonical URL, redirect error, `noindex`, soft 404, or server error.
8. Do not submit HTTP, non-`www`, preview-deployment, or duplicate sitemap URLs.

## Release validation commands

From `frontend`:

```powershell
npm run build
npm run seo:check
```

After deployment:

```powershell
curl.exe -I https://www.fundmystudyabroad.com/sitemap.xml
curl.exe -I https://www.fundmystudyabroad.com/robots.txt
curl.exe -I https://fundmystudyabroad.com/
```

Expected results are `200` for the sitemap and robots file, and a permanent redirect from the non-`www` URL to the `www` HTTPS origin.

## Maintenance policy

- Add a sitemap entry only when a new page is public, indexable, canonical, and returns `200`.
- Remove a URL when it is deleted, permanently redirected, canonicalized elsewhere, or changed to `noindex`.
- Change `lastmod` only after a significant update to main content, structured data, or important links. Do not update dates for routine builds or cosmetic footer dates.
- Keep navigation/footer links and the sitemap inventory aligned so every important page is discoverable without relying on the sitemap alone.
- Use one sitemap until the site approaches 50,000 URLs or 50 MB uncompressed; a sitemap index is unnecessary for the current three-page site.
- Review Search Console monthly for sitemap parsing errors, canonical mismatches, crawl failures, and indexing changes.

## Authoritative references

- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: Canonical URL methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Console: Sitemaps report](https://support.google.com/webmasters/answer/7451001)
- [Sitemaps.org protocol](https://www.sitemaps.org/protocol.html)

