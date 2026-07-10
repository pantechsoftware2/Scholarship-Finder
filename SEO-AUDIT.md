# Scholarship Finder Technical SEO Audit

Audit date: 2026-07-10

Target site: `https://scholarship-finder-frontend.vercel.app/`

Scope:
- Live deployment audit
- Local frontend architecture review
- Read-only verification of existing commands

## Current Architecture

- Frontend framework: Create React App via `react-scripts@5.0.1` in [frontend/package.json](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/package.json)
- Rendering model: Client-side rendering only
- Routing model: No URL router detected. The app uses React state in [frontend/src/App.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/App.js) to switch between `input`, `results`, and `thankyou` stages.
- Initial HTML delivery: Static shell only. The server returns [frontend/public/index.html](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/public/index.html) with `<div id="root"></div>` and no meaningful page body content.
- Deployment behavior: The Vercel deployment is serving the SPA shell for arbitrary paths and utility files with HTTP `200`.

Observed server HTML at `/`:
- Title present
- Basic meta description present
- Basic Open Graph tags present
- No canonical tag
- No Twitter tags
- No structured data
- No crawlable body copy in initial HTML

## Public Route Inventory

Because there is no router, there is only one real public URL route in the frontend application. The rest of the user journey is state-driven inside the SPA.

| Route / pattern | Classification | Notes |
|---|---|---|
| `/` | Public and nominally indexable | Only route with intentional public entrypoint, but initial HTML is nearly empty and relies on JS for visible content. |
| `/results` | Not a real route; soft-200 shell | Returns the homepage shell with the same metadata and `200`. Could be indexed accidentally as duplicate content. |
| `/thank-you` | Not a real route; soft-200 shell | Same shell and metadata, same duplicate-content risk. |
| `/login` or any arbitrary path | Error/utility failure; soft-200 shell | Invalid URLs currently return the SPA shell instead of a true `404`. |
| `/?utm_source=test` and other parameterized URLs | Search/filter duplication risk | Same content and metadata are returned with no canonical normalization. |

Route classification by app state:
- Public and indexable: `/`
- Private or user-specific: Results stage and Thank You stage are user-specific experiences, but they are not exposed as unique URLs.
- Authentication routes: None detected
- Search/filter result routes: None as URL routes. Results are POST-driven state, not crawlable URLs.
- Error or utility routes: None implemented correctly. Invalid URLs, `robots.txt`, `sitemap.xml`, `favicon.ico`, and `manifest.json` all return the homepage shell.

## Metadata and Crawl Audit

### Page titles

- Home title exists: `Scholarship Finder - Find Your Perfect Scholarship`
- No dynamic title management detected for results or thank-you states
- Same title is returned for arbitrary URLs such as `/results`, `/thank-you`, and invalid paths

### Meta descriptions

- One global description exists in [frontend/public/index.html](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/public/index.html)
- No route-specific or state-specific descriptions
- Same description is duplicated on arbitrary URLs

### Canonical URLs

- No canonical tag found
- This is a high-risk issue because arbitrary paths and query parameter URLs all return `200` with the same content shell

### Open Graph metadata

- Present: `og:title`, `og:description`, `og:type`
- Missing: `og:url`, `og:image`, `og:site_name`
- Open Graph is static and not tailored to any state or route

### Twitter metadata

- No Twitter card tags found

### Heading hierarchy

- Home/input state uses one `h1` and then jumps to `h3`
- Results state uses one `h1`, then scholarship name as `h3`, and modal headings as `h2`
- Thank-you state uses `h1` then `h3`
- This is usable but inconsistent and semantically weak

Relevant files:
- [frontend/src/components/InputForm.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/InputForm.js)
- [frontend/src/components/ResultsDisplay.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/ResultsDisplay.js)
- [frontend/src/pages/ThankYou.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/pages/ThankYou.js)

### Internal links

- No meaningful internal crawlable links detected
- The user journey is driven by buttons and local state, not links
- Only one anchor element was found, and it is an external WhatsApp link in [frontend/src/pages/ThankYou.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/pages/ThankYou.js)

SEO impact:
- Search engines cannot discover deeper experiences through crawlable links
- There is no internal linking structure to distribute authority or help route discovery

### Image alt attributes

- No `<img>` tags detected in `frontend/src`
- SVG icon components from `lucide-react` are used instead
- No current image-alt issue, but also no share preview image metadata

### robots.txt

- No valid `robots.txt`
- Requesting `/robots.txt` returns the homepage HTML shell with HTTP `200` and `text/html`

### sitemap.xml

- No valid `sitemap.xml`
- Requesting `/sitemap.xml` returns the homepage HTML shell with HTTP `200` and `text/html`

### Favicon and web manifest

- No favicon or manifest assets are present in [frontend/public](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/public)
- Requests to `/favicon.ico` and `/manifest.json` return the homepage HTML shell with HTTP `200`

### Structured data

- No JSON-LD or other structured data detected

### URL structure

- URL structure is minimal because there is no real route system
- Current deployment behavior allows arbitrary paths to resolve with identical metadata and HTML shell
- Query parameters are not normalized by canonical tags

### 404 handling

- Broken
- Invalid URLs return the homepage shell with HTTP `200` instead of a proper `404`
- This is a soft-404 issue and one of the most serious technical SEO problems on the site

### Loading performance

- Production build completed successfully
- Built asset sizes are modest:
  - JS: `56.71 kB` gzip
  - CSS: `5.69 kB` gzip
- However, raw server HTML contains no meaningful body content, so the page depends heavily on JavaScript before users and crawlers see substantive copy
- A Lighthouse run on 2026-07-10 failed with `NO_FCP`, so I do not have a reliable scored performance snapshot from automation

### Accessibility issues affecting SEO

- No landmark structure such as semantic `main`, `header`, `nav`, or `footer` detected in the principal views
- Heading hierarchy is inconsistent
- Modal close buttons do not have explicit accessible labels in [frontend/src/components/LeadCaptureModal.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/LeadCaptureModal.js) and [frontend/src/components/ResultsDisplay.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/ResultsDisplay.js)
- The back button in results relies on `title` rather than a stronger accessible label in [frontend/src/components/ResultsDisplay.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/ResultsDisplay.js)
- The progress indicator lacks full progressbar semantics in [frontend/src/components/ProgressLog.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/ProgressLog.js)

These are not the top SEO blockers, but they do reduce semantic clarity and machine interpretability.

## Initial HTML vs JavaScript-Rendered Content

Meaningful page content is not included in the initial server HTML.

Evidence:
- Raw server response at `/` contains only the static head tags, a `noscript` message, and `<div id="root"></div>`
- All visible scholarship-finder copy, headings, form content, results content, and thank-you content are rendered after JavaScript executes
- The same empty shell is returned for `/results`, `/thank-you`, `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, and invalid URLs

Conclusion:
- This is a CSR-only SPA from a crawler perspective
- SEO-critical body content is JavaScript-dependent
- The site is at risk of weak rendering, soft duplication, and low-quality indexed pages even if some modern crawlers execute JS

## Duplicate, Thin, and Crawl-Control Risks

### Duplicate metadata

- Same title and description are reused across all tested URLs
- Arbitrary paths return identical metadata

### Empty pages

- Every server-rendered page is effectively empty in the body before JS

### Thin content

- The only indexable URL, `/`, is thin in raw HTML terms
- Invalid and utility URLs are also thin because they serve the same shell

### Duplicate scholarship URLs

- No scholarship detail pages exist in the frontend, so there are no crawlable scholarship URLs to audit on the site itself
- In backend data, there is at least one duplicate outbound scholarship URL: `https://erasmus-plus.ec.europa.eu/` appears more than once in [backend/app/data/scholarships.json](C:/Users/User/Pictures/New folder/Scholarship-Finder/backend/app/data/scholarships.json)
- The frontend currently does not expose those scholarship URLs as crawlable destination links

### URL parameters that could create crawl duplication

- Confirmed risk
- `/?utm_source=test` returns HTTP `200` with the same HTML shell and no canonical tag

### Private pages accidentally indexable

- There are no distinct private URLs today
- However, because all arbitrary paths return `200` with `index, follow`, any future state-like paths or mistyped links could become duplicate indexable soft pages

### API data exposed as pages without useful content

- Not currently exposed as separate crawlable frontend pages
- Results are fetched via API and displayed client-side after form submission

### Broken internal links

- No internal crawlable links were found, so there is no internal link graph to validate
- This is itself an SEO limitation

### Non-crawlable buttons used instead of links

- Confirmed
- Key user flows are button-driven and state-driven rather than link-driven
- This prevents route discovery and makes the experience opaque to crawlers

## Critical SEO Blockers

1. Meaningful content is absent from initial server HTML.
2. Invalid URLs return soft `200` pages instead of true `404` responses.
3. `robots.txt`, `sitemap.xml`, `favicon.ico`, and `manifest.json` are missing and incorrectly resolve to the homepage shell.
4. No canonical tags exist, while arbitrary paths and query-parameter URLs return duplicate shells.
5. No internal crawlable link architecture exists beyond the homepage shell.

## High-Priority Improvements

1. Add proper crawl-control assets in `frontend/public`:
   - `robots.txt`
   - `sitemap.xml`
   - `favicon.ico`
   - `manifest.json`

2. Prevent utility and invalid routes from resolving as indexable `200` HTML pages.
   - At minimum, configure correct static asset handling and a true `404` response for invalid resource paths.

3. Add a canonical URL to the homepage shell.

4. Improve homepage server-delivered HTML so the initial response contains meaningful descriptive content for the main use case.
   - Without migrating frameworks, this likely means expanding the static shell content and/or carefully restructuring the app so essential copy exists in HTML before runtime.

5. Decide which URLs should actually be indexable and ensure non-indexable or duplicate states are not exposed as crawlable pages.

## Medium-Priority Improvements

1. Add complete social metadata:
   - `og:url`
   - `og:image`
   - `og:site_name`
   - Twitter card tags

2. Improve semantic structure:
   - Add `main`
   - Use clearer heading levels
   - Introduce stronger landmark regions

3. Add structured data appropriate to the homepage.
   - Likely `WebSite` and `Organization`

4. Introduce crawlable, descriptive links where real public destinations exist.

5. Review whether scholarship results should ever become stable URLs.
   - If not, keep them intentionally non-indexable
   - If yes, they need unique metadata, canonicals, and real content

## Low-Priority Improvements

1. Refine metadata copy for CTR
2. Add richer share imagery
3. Improve progress indicator semantics
4. Add explicit accessible labels to icon-only or symbol-heavy controls
5. De-duplicate outbound scholarship source URLs in backend data if they will later be surfaced

## Files Likely To Require Modification

| File | Why it likely changes | Main risk |
|---|---|---|
| [frontend/public/index.html](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/public/index.html) | Canonical, social tags, base metadata, possibly more meaningful static content | Changing the shell can affect hydration assumptions, preview rendering, and global metadata across the app |
| `frontend/public/robots.txt` | Missing and required | Misconfiguration can block desired crawling |
| `frontend/public/sitemap.xml` | Missing and required | Incorrect URLs or stale entries can mislead crawlers |
| `frontend/public/manifest.json` | Missing | Low SEO risk, but incorrect references can create browser asset errors |
| `frontend/public/favicon.ico` and related icons | Missing | Low application risk; mainly branding and browser-preview impact |
| [frontend/src/App.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/App.js) | If state visibility, route handling, or noindex logic changes | Could affect the user flow between input, results, and thank-you stages |
| [frontend/src/components/InputForm.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/InputForm.js) | Homepage semantic structure and crawlable descriptive content | Could accidentally change conversion behavior if layout or form logic is touched carelessly |
| [frontend/src/components/ResultsDisplay.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/components/ResultsDisplay.js) | Accessibility fixes, labeling, and any noindex/state handling | Could impact lead-capture gating and interaction flow |
| [frontend/src/pages/ThankYou.js](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/src/pages/ThankYou.js) | Semantic and accessibility cleanup | Low functional risk |
| Hosting or deployment config for the frontend | Needed to fix soft-404 and static asset behavior | Misconfiguration can break SPA fallback or asset delivery |

## Risks Associated With Each Modification

- Metadata changes in the shared shell affect every path immediately.
- Incorrect canonical configuration can collapse URLs you still need.
- Introducing hard 404 handling without care can break SPA client routing if real client routes are added later.
- Adding public crawlable routes for results or scholarships without unique metadata will create large-scale duplication.
- Editing conversion-critical components like the form or unlock flow can unintentionally hurt lead generation.

## Recommended Implementation Order

1. Fix deployment behavior for utility files and invalid paths.
   - `robots.txt`, `sitemap.xml`, `favicon.ico`, and `manifest.json` should resolve as their real assets.
   - Invalid URLs should stop returning indexable soft `200` pages.

2. Add canonical and complete baseline metadata in `frontend/public/index.html`.

3. Add missing public assets in `frontend/public`.

4. Improve initial HTML usefulness for the homepage without changing business logic.

5. Improve semantic structure and accessibility in homepage, results, and thank-you views.

6. Decide whether any deeper URLs should ever be indexable.
   - If no, keep the app intentionally single-entry and controlled.
   - If yes, only proceed once each indexable URL can have unique content and metadata.

## Command Verification

Executed on 2026-07-10 in `frontend`:

- `npm run build`
  - Passed

- `npm test -- --watchAll=false`
  - Failed because no tests exist

- `npm run lint`
  - Failed because no `lint` script exists in [frontend/package.json](C:/Users/User/Pictures/New folder/Scholarship-Finder/frontend/package.json)

## Summary

The site is currently a Create React App SPA with client-side-only content rendering and no true route system. The biggest SEO issues are not cosmetic metadata gaps but architecture-level crawl problems: empty initial HTML body content, missing canonical control, missing crawl assets, and soft-200 behavior for invalid and utility URLs.
