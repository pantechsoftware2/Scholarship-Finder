# FundMyStudyAbroad UI/UX Audit

## Audit Scope

This audit is based on the actual product surface available in this codebase and the deployed site signals visible on July 16, 2026:

- Homepage scholarship finder flow
- Results state
- Lead capture / unlock modal
- Thank-you state
- How It Works page
- Countries page
- 404 / unsupported route state
- Shared navigation, form patterns, CTA patterns, metadata, and static HTML

The generic prompt referenced About, Services, Loans, Blogs, Contact, Terms, Privacy, and other pages, but those do not exist in the current product build. Recommendations below are based on observable evidence from the real implementation, not assumed pages.

Desktop, tablet, and mobile observations are based on the current responsive CSS, rendered structure, and interaction logic in the frontend.

## Overall Score

- UI Design: 7.1/10
  Reason: The visual direction is coherent, modern, and consistent enough for an MVP, but it leans heavily on repeated dark cards, pill buttons, and dense text blocks. The hierarchy is decent, yet not persuasive enough for a premium guidance product.
- UX: 6.3/10
  Reason: The main task flow is understandable, but there is too much friction before value is proven, weak guidance around expectations, and several moments where the user is asked to trust the system before seeing proof.
- Accessibility: 5.7/10
  Reason: There is good baseline semantic intent and some ARIA usage, but focus treatment, modal behavior, keyboard flow, motion controls, and announcement patterns are incomplete.
- Trust Building: 5.4/10
  Reason: The product asks for personal data and implies AI quality, but offers limited evidence, no institutional validation, no methodology transparency, and no privacy reassurance at the decision moment.
- Conversion: 6.0/10
  Reason: The top-of-funnel is strong enough to attract interest, but value proof is delayed, the lead capture gate appears before sufficient confidence is earned, and CTA architecture is not optimized for intent stages.
- Mobile Experience: 6.6/10
  Reason: The layout does collapse responsibly, but several sections remain text-heavy, chip-heavy, and visually long for small screens. Scroll effort is high before reaching the core action.
- Performance Perception: 5.9/10
  Reason: The app is not obviously bloated, but it is JavaScript-dependent, has no SSR/streaming fallback, and the only stored Lighthouse report failed with `NO_FCP`, which is a risk signal for perceived loading reliability.

## Executive Summary

### Biggest Strengths

- The product has a clear niche: scholarship matching for study abroad funding.
- The visual system is more polished than a typical early-stage EdTech form tool.
- The form captures genuinely relevant variables: degree, GPA, nationality, targets, intake, tests, and work experience.
- The results card uses personalized framing rather than generic directory language.
- The tone is focused on action and practical outcomes rather than feature dumping.

### Biggest Weaknesses

- The homepage tries to be landing page, SEO article, and product workflow at the same time, which dilutes clarity.
- The product asks for a lead before enough trust, proof, or sample value is established.
- Navigation relies on full-page anchor and hard-link patterns, creating avoidable reload behavior and perceived instability.
- Accessibility and keyboard flow are not production-grade, especially for focus treatment and modal behavior.
- Trust signals are too weak for a product dealing with financial futures, education choices, and personal contact details.

### Top 10 Priorities

1. Rebuild the homepage above-the-fold around one primary promise, one proof block, and one focused CTA path.
2. Redesign the lead capture gate so users preview more genuine value before being asked for contact details.
3. Add trust infrastructure: methodology, privacy reassurance, who it is for, data freshness, and proof markers.
4. Replace hard reload navigation with client-side routing or route-preserving transitions.
5. Improve focus-visible states, modal focus trapping, keyboard escape paths, and reduced-motion handling.
6. Reduce homepage copy density and convert SEO-heavy blocks into clearer scannable sections.
7. Add quality-of-match explanations and confidence disclaimers that feel credible rather than promotional.
8. Refine mobile spacing and shorten the distance from landing to form completion.
9. Introduce richer empty, error, retry, and success states across results and lead capture.
10. Establish a proper design system with tokenized spacing, CTA hierarchy, and component behavior rules.

### Estimated Overall Design Maturity

Early growth-stage product with solid aesthetic instincts, good subject-matter framing, and incomplete conversion architecture. Design maturity feels around 6/10: strong enough to ship, not yet strong enough to maximize trust or enterprise-readiness.

## Hero Section

### Score

6.8/10

### What is working

- The headline is specific to scholarships and study abroad funding.
- The emerald-on-zinc palette feels professional and appropriately serious.
- The hero immediately communicates that matching is profile-based.
- The form is visible on desktop without requiring a route change.

### Current Issues

- The hero competes with a dense nav bar, badge pill, feature list, three SEO cards, and the form. There is too much simultaneous information.
- The headline is descriptive but not sharply differentiated. It explains the product category without strongly stating the unique advantage.
- The hero relies almost entirely on text and lacks a visual proof mechanism such as sample results, data credibility, or process snapshot.
- The left column becomes editorial content very quickly, which weakens momentum toward form completion.
- On mobile, the copy stack becomes long before the user reaches the primary form controls.

### Why It Hurts Conversions

- Users evaluating education tools need immediate proof that the system is trustworthy and useful. Long explanatory copy without proof slows commitment.
- The interface makes users read too much before they understand what happens next.
- The current hero does not reduce uncertainty around output quality, data freshness, or privacy.

### Recommended Redesign

- Collapse the hero into three layers:
  - Promise: one sharp headline and one outcome-based subheadline
  - Proof: a compact strip with data freshness, profile-based logic, and student-fit examples
  - Action: a single dominant CTA leading into the form
- Replace one or more text blocks with a visual scholarship preview card showing:
  - sample scholarship title
  - match score explanation
  - typical funding amount
  - why this match appears
- Tighten the headline toward outcome and differentiation.
  - Example direction: "Find the study abroad scholarships your profile can realistically win."
- Move lower-intent SEO content below the first conversion moment.

### Priority

Critical

### Estimated Impact

High

### Development Effort

Medium

## Navigation

### Score

5.9/10

### Current Issues

- The homepage and info pages use plain `<a href>` links for core navigation paths, creating full page reloads and flash behavior during transitions.
- The nav structure is simple but not truly strategic. It lists destinations without grouping by intent stage.
- There is no sticky navigation, no current-location reinforcement on the homepage, and no "Start Matching" persistent CTA.
- No search, no jump nav, and no mobile-specific simplification beyond wrapping pills.

### Why It Is Wrong

- Hard reloads increase perceived instability and reduce polish.
- On a conversion-focused product, the nav should orient users around "learn", "evaluate", and "start", not just scatter route links.

### User, Trust, Accessibility, Performance Impact

- Users perceive flashes and context resets as fragility.
- Trust drops because the product feels less app-like and less deliberate.
- Keyboard users get less predictable transition behavior.
- Full reload navigation hurts perceived performance.

### Recommended Redesign

- Move to a client-side router for internal transitions.
- Use a compact sticky header with:
  - logo / home
  - How it works
  - Country guide
  - FAQ
  - primary CTA: Start Matching
- On mobile, convert the pill nav into a lighter two-state structure: menu + CTA.
- Add section jump links only where they shorten time to value.

### Priority

High

## Typography

### Score

6.7/10

### Current Issues

- The type scale is decent but not disciplined across hero, cards, labels, badges, and helper text.
- Some support text is too muted and small for long reading on dark backgrounds.
- The form help text and secondary copy often sit close to the threshold of comfortable readability.
- Headline styles on info pages and home pages are similar enough that page differentiation is limited.

### Recommendations

- Define a formal scale:
  - Display
  - H1
  - H2
  - H3
  - body-lg
  - body
  - caption
- Increase helper and muted copy contrast slightly.
- Standardize heading spacing and paragraph widths.
- Use stronger paragraph width constraints in long explanatory sections.

## Color System

### Score

7.4/10

### Current Issues

- The palette is consistent, but too much of the UI relies on the same zinc card + emerald accent pattern.
- Success green is doing too much work: brand accent, active state, trust cue, and progress cue.
- Error styling is functional but visually disconnected from the main brand system.

### Recommendations

- Keep emerald as the brand accent, but introduce one restrained support accent for informational states.
- Differentiate brand, success, and active states slightly.
- Raise contrast on muted text and some border states.
- Create semantic tokens for:
  - brand action
  - success
  - warning
  - error
  - info
  - surfaces 1 to 4

## White Space

### Score

6.5/10

### Current Issues

- Vertical rhythm is uneven between hero blocks, form blocks, and SEO sections.
- The homepage left column feels crowded because multiple cards and lists stack without enough hierarchy separation.
- The right-side form is well-contained, but the page surrounding it is still too busy.

### Recommendations

- Add more deliberate separation between persuasion zones.
- Reduce the number of stacked card sections before the footer.
- Create section rhythm rules such as 24, 40, 64, 96 spacing tiers.

## Visual Hierarchy

### Score

6.2/10

### Current Issues

- The eye flow is fragmented between nav pills, badge pill, headline, feature list, SEO cards, and form.
- Important trust and proof signals are not visually elevated because they are mixed into similar card styles.
- The results page surfaces the top match well, but locked results visually compete with the real value card.

### Recommendations

- Make the hierarchy intentional:
  - promise
  - proof
  - action
  - explanation
- Use scale, spacing, and contrast to distinguish "decision-critical" from "supporting" content.
- De-emphasize locked cards until users understand what they gain.

## Cards

### Score

7.0/10

### Current Issues

- Card styling is mostly consistent but overused.
- Too many different card purposes share similar visual treatment: content cards, proof cards, info cards, and conversion cards all feel related when they should not.
- Locked cards are visually polished but may over-prioritize the paywall moment.

### Recommendations

- Reduce card count on the homepage.
- Create 4 card families:
  - content
  - proof
  - action
  - gated / premium
- Use more contrast between the top match and locked previews.

## Buttons

### Score

6.4/10

### Current Issues

- Button hierarchy is inconsistent across pages. Some primary actions are emerald, some are white, some are outlined, and some are pills with comparable weight.
- Hover states exist, but focus-visible behavior is underdeveloped.
- Disabled states reduce opacity but do not always communicate why action is unavailable.

### Recommendations

- Standardize CTA tiers:
  - Primary: emerald filled
  - Secondary: subtle bordered
  - Tertiary: text or ghost
- Add `:focus-visible` styles with clear contrast.
- Add inline reason text for disabled submission states where applicable.

## Forms

### Score

7.0/10

### What is good

- Form fields are relevant and sensibly grouped.
- Labels are present.
- The country multi-select and intake selection align to the task.
- Validation exists before submission.

### Current Issues

- Validation is mostly reactive toast-based, not field-level and not persistent enough.
- Error messaging does not always tell users exactly which field to fix next.
- The form is long and asks for many inputs before giving any preview of value.
- Some optional fields still demand cognitive effort that may not be necessary for first-pass matching.
- There is no progress indicator for the form itself, only for the loading state after submit.

### Accessibility Impact

- Top toast errors may be missed if the user is focused deep in the form.
- Focus is not moved to the first invalid field.
- There is no summary of errors with field linking.

### Recommended Redesign

- Split the form into phased steps:
  - Basics
  - Targets
  - Academic details
  - Optional boosters
- Add inline validation and move focus to the first failing control.
- Consider default-collapsing optional sections like tests and profile highlights.
- Add a small completion meter or stepper.

### Priority

High

## Trust Signals

### Score

4.9/10

### Current Issues

- There are no testimonials, partner indicators, student outcomes, or recognizable credibility markers.
- There is no clear statement about where scholarship data comes from or how often it is refreshed.
- There is no visible privacy reassurance near the lead form.
- The product uses phrases like "AI-powered" and "winning strategies" without enough evidence or framing.

### Why It Hurts Trust and Conversion

- Students sharing personal information for high-stakes financial decisions need reassurance.
- Without proof, the lead gate can feel extractive rather than helpful.

### Recommended Redesign

- Add trust modules near the form and unlock modal:
  - "How matches are generated"
  - "What we do and do not guarantee"
  - "We do not spam or sell your data"
  - "Updated scholarship logic / reviewed on date"
- Add believable proof:
  - student use metrics
  - counselor review quote
  - institution categories
  - sample match explanation

### Priority

Critical

## Content

### Score

6.0/10

### Current Issues

- The copy is earnest and SEO-aware, but often verbose.
- Several sections restate similar ideas about scholarships, profile fit, and study abroad planning.
- There is too much explanatory copy before the user experiences the product.

### Recommendations

- Rewrite for scannability:
  - one point per block
  - fewer repeated keyword phrases
  - stronger subheads
- Separate SEO support content from conversion-critical content.
- Replace some text blocks with examples, checklists, and visual proof panels.

## Accessibility

### Score

5.7/10

### Evidence-Based Issues

- Inputs and modal inputs remove the default outline and replace it with subtle border/box-shadow states, but there is no broader `:focus-visible` system for buttons, links, pills, and modal controls.
- Modal dialogs use `role="dialog"` and `aria-modal="true"`, which is good, but there is no evidence of focus trapping or returning focus to the trigger after close.
- Unlock behavior depends on scroll, click, wheel, and touch gestures, which can be confusing for assistive technology and keyboard users.
- The app lacks a skip link.
- Reduced motion handling is absent despite multiple animations and smooth scrolling.
- Error treatment is centralized in toast form rather than bound to fields.

### WCAG 2.2 Focus Areas

- Keyboard navigation: partially supported, not production-ready
- Screen reader support: fair structure, weak interactive state management
- ARIA: present in some areas, incomplete in modal and validation flow
- Focus indicators: inconsistent
- Touch targets: mostly acceptable
- Semantic HTML: generally solid

### Recommended Redesign

- Add a global `:focus-visible` system for all interactive controls.
- Trap focus inside modals and restore focus to the opener on close.
- Add a skip link at the top of the page.
- Respect `prefers-reduced-motion`.
- Bind validation errors to fields with `aria-describedby` and `aria-invalid`.

### Priority

Critical

## Mobile Experience

### Score

6.6/10

### Current Issues

- The hero remains text-heavy before users reach the form.
- Pill nav and chip selections create wrapping density on small screens.
- The long single-page homepage creates fatigue before submission.
- The footer link cluster is still useful, but not especially optimized for thumb scanning.

### Recommended Redesign

- Shorten the hero drastically on mobile.
- Move the form higher and collapse secondary content behind expandable sections.
- Use larger tap affordances for country chips or convert them to a searchable multi-select drawer.
- Add sticky mobile CTA: "Start Matching".

## Animations

### Score

6.1/10

### Current Issues

- Animations are subtle and mostly appropriate, but not governed by a motion strategy.
- Spinner and progress states rely on animation without reduced-motion fallback.
- Smooth scrolling and fade-ins are decorative, not always additive.

### Recommendations

- Keep motion purposeful:
  - route transition
  - form step completion
  - success confirmation
- Reduce ambient animation load.
- Add `prefers-reduced-motion` handling.

## Micro Interactions

### Score

6.4/10

### Current Issues

- The progress log is one of the better interaction moments, but it may imply accuracy or deterministic processing beyond what is actually happening.
- Unlock-on-scroll is novel but can feel manipulative if value is hidden too early.
- Error and success states are serviceable, not premium.

### Recommendations

- Make the progress state more honest and informative.
- Replace scroll-trigger gating with a preview-and-expand model.
- Improve form success and failure microcopy with next-step clarity.

## Performance Perception

### Score

5.9/10

### Evidence

- The stored Lighthouse file failed with `runtimeError.code = "NO_FCP"` for the tested deployment, so it cannot be used as a valid performance benchmark.
- The product is JavaScript-dependent and the deployed homepage exposes a no-JS message externally.
- Internal navigation currently uses hard links in multiple places, which worsens perceived performance.

### Current Issues

- No reliable performance baseline is currently documented.
- The app has no SSR or static-rendered interactive fallback for core value proof.
- Perceived performance depends heavily on JS boot and fetch completion.

### Recommendations

- Run a valid Lighthouse pass on the production domain and store separate desktop/mobile reports.
- Pre-render more meaningful above-the-fold content.
- Move internal navigation to client-side routing.
- Add lightweight skeleton states for results and modal submission.

## SEO + UX

### Score

6.6/10

### What is good

- Canonical, OG, Twitter, and robot tags are handled thoughtfully.
- Structured data exists for homepage and route-specific states.
- Separate static HTML pages exist for the info pages.

### Current Issues

- The homepage is doing too much SEO heavy lifting through visible body copy, which harms UX.
- The product has limited crawlable page depth in its current experience.
- There is no visible breadcrumbing or content hierarchy beyond top-level routes.
- Social preview assets are SVG-based; some platforms still behave better with raster OG images.

### Recommendations

- Keep SEO support content, but collapse or move parts of it below conversion sections.
- Add richer, differentiated static content pages only where they truly help users.
- Consider PNG/JPG OG assets in addition to SVG.

## Student Psychology

### Score

5.8/10

### Current Issues

- The site understands what students want, but not fully what they fear.
- It talks about matches and funding, but does not adequately reduce anxiety around:
  - wasting time
  - applying to the wrong scholarships
  - giving contact details too early
  - being sold services after form completion

### Recommendations

- Add copy that reduces risk:
  - "See likely-fit scholarships before you commit to a longer process."
  - "Your details are used to send your report, not to pressure you into calls."
- Add expectation-setting around realism, deadlines, and data freshness.

## Conversion Funnel

### Score

6.0/10

### Funnel Review

- Homepage: clear intent, overloaded delivery
- Lead generation: too early relative to proof
- Inquiry form: good data relevance, long for first contact
- Scholarship flow: useful concept, but gated before enough payoff
- Contact / support: WhatsApp CTA exists only after success

### Main Drop-Off Risks

- Above-the-fold overload
- Long form before evident value
- Gated results after only one fully visible scholarship
- Lack of trust reassurance before asking for name, email, and WhatsApp

### Recommended Funnel Changes

- Show top 3 real matches before lead capture.
- Gate deeper strategy, export, or personalized action plan instead of basic value.
- Add a soft CTA path for skeptical users:
  - sample report
  - how matching works
  - privacy note

## Design System

### Score

6.8/10

### Current Issues

- Visual consistency exists, but component logic is not formalized.
- Button tiers drift.
- Surface hierarchy is shallow.
- Focus, validation, and modal behaviors are not systematized.

### Recommendations

- Define:
  - tokens
  - component states
  - spacing scale
  - icon sizing rules
  - elevation rules
  - modal standards
  - form validation patterns

## Professional Design References

Use these as directional references, not copy targets.

- Stripe
  - Superior for information hierarchy and trust packaging. Use Stripe-like proof framing for complex, high-stakes messaging.
- Linear
  - Superior for density control and sharp interaction clarity. Useful for results cards and premium-feeling control styling.
- Vercel
  - Superior for restrained dark theme composition and typography-driven hierarchy.
- Notion
  - Superior for simple progressive disclosure. Useful for FAQs, methodology, and expandable secondary content.
- Framer
  - Superior for polished landing-page pacing and modular proof sections.
- Airbnb
  - Superior for trust building before commitment and transparent decision support.
- Wise
  - Superior for financial trust language and expectation-setting.
- Webflow
  - Superior for conversion-focused content sequencing and visual CTA rhythm.
- Intercom
  - Superior for contextual nudges and support reassurance.
- Dropbox
  - Superior for reducing cognitive load in feature explanation.
- Apple
  - Superior for disciplined whitespace and visual calm.
- Google Material
  - Superior for accessible states, motion rules, and systematic interaction behavior.

## Missing Features

- Form progress indicator
  - Users need to know effort remaining.
- Save progress
  - Useful for long or interrupted education research sessions.
- Sample result preview
  - Lowers skepticism before lead capture.
- Data freshness indicator
  - Critical for scholarship relevance trust.
- Compare countries panel
  - Helps users evaluate realistic destination mixes.
- Save shortlist
  - Encourages return visits and deeper engagement.
- Deadline tracker export
  - High practical utility after match generation.
- Counselor / support access at decision moments
  - Reduces anxiety when users are unsure about submitting details.
- Personalized explanation panel
  - Should explain why each scholarship appears.
- Privacy reassurance module
  - Necessary before collecting WhatsApp and email.
- Reduced-motion support
  - Required for accessibility maturity.
- Sticky mobile CTA
  - Improves mobile completion.

## Security & Trust

### Score

6.2/10

### What is working

- HTTPS is used on the live site.
- There is a honeypot field in the lead form.

### Current Issues

- No visible privacy statement near data submission.
- No explanation of why WhatsApp is required.
- No visible data retention or consent explanation at point of collection.
- No visible trust copy around form security or communication expectations.

### Recommendations

- Add microcopy below submit:
  - what is sent
  - when follow-up happens
  - whether WhatsApp contact is optional
  - privacy policy link
- Make phone optional unless it is genuinely required operationally.

## Phase-wise Roadmap

## Phase 1 (Critical)

- Rebuild hero architecture around promise, proof, and one primary CTA
- Add trust and privacy reassurance near form and unlock modal
- Replace hard reload navigation with client-side routing
- Improve accessibility fundamentals: focus-visible, modal focus trap, reduced motion, field errors
- Redesign lead gate to reveal more genuine value before asking for contact details
- Establish valid performance measurement and rerun Lighthouse

Estimated effort: Medium to Large  
Expected impact: Very high  
Priority: Critical

## Phase 2

- Break the form into steps
- Create richer results explanations and match methodology panels
- Simplify homepage SEO copy layout
- Introduce mobile sticky CTA and mobile-first content reduction
- Add shortlist save/share/export features

## Phase 3

- Formalize design system tokens and component states
- Add polished motion system
- Expand trust ecosystem with testimonials, advisor quotes, and proof modules
- Add country comparison and timeline planning utilities

## Final Report

## Top 50 Improvements Ranked by Impact

1. Current problem: Hero is overloaded with too many simultaneous messages.  
Why it matters: Users do not immediately see the single best next action.  
Recommended solution: Rebuild above-the-fold into promise, proof, and action.  
Priority: Critical  
Estimated implementation effort: Medium  
Expected business impact: Higher form-start rate  
UX impact: Lower cognitive load  
Conversion impact: High

2. Current problem: Lead capture appears before enough value is visible.  
Why it matters: Users feel gated before they trust the product.  
Recommended solution: Show 2 to 3 real results before gating advanced strategy.  
Priority: Critical  
Estimated implementation effort: Medium  
Expected business impact: Better lead quality and completion  
UX impact: Better fairness perception  
Conversion impact: High

3. Current problem: Internal navigation uses hard reloads.  
Why it matters: Causes flashing and weaker perceived quality.  
Recommended solution: Use client-side routing for all internal links.  
Priority: Critical  
Estimated implementation effort: Medium  
Expected business impact: Better session continuity  
UX impact: Smoother transitions  
Conversion impact: High

4. Current problem: Trust signals are too sparse.  
Why it matters: Education funding decisions require reassurance.  
Recommended solution: Add methodology, privacy, proof, and freshness modules.  
Priority: Critical  
Estimated implementation effort: Medium  
Expected business impact: Higher trust and lead completion  
UX impact: Lower anxiety  
Conversion impact: High

5. Current problem: Accessibility is incomplete in modals and focus states.  
Why it matters: Excludes users and weakens enterprise readiness.  
Recommended solution: Add focus trap, restore focus, `:focus-visible`, field error mapping, reduced motion.  
Priority: Critical  
Estimated implementation effort: Medium  
Expected business impact: Broader usability and lower risk  
UX impact: Major  
Conversion impact: Medium

6. Current problem: Form validation relies on global toast messaging.  
Why it matters: Users may not know which field to fix.  
Recommended solution: Add inline field-level validation and auto-focus to first invalid field.  
Priority: High  
Estimated implementation effort: Medium  
Expected business impact: Lower abandonment  
UX impact: High  
Conversion impact: High

7. Current problem: Homepage copy is too SEO-heavy above the fold.  
Why it matters: Slows decision-making.  
Recommended solution: Push secondary copy lower and convert sections into expandable content.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Better engagement  
UX impact: High  
Conversion impact: High

8. Current problem: Results page over-emphasizes locked previews.  
Why it matters: Users may feel manipulated.  
Recommended solution: Reframe premium value around deeper insights, not basic access.  
Priority: High  
Estimated implementation effort: Medium  
Expected business impact: Better brand perception  
UX impact: High  
Conversion impact: High

9. Current problem: No privacy reassurance at lead form.  
Why it matters: Users hesitate before sharing WhatsApp and email.  
Recommended solution: Add concise privacy microcopy and policy link.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Higher submit rate  
UX impact: High  
Conversion impact: High

10. Current problem: The app lacks a valid performance benchmark.  
Why it matters: Optimization cannot be prioritized confidently.  
Recommended solution: Re-run Lighthouse and Web Vitals on production.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Better prioritization  
UX impact: Medium  
Conversion impact: Medium

11. Current problem: No sample report preview on the homepage.  
Why it matters: Abstract value feels weaker than concrete value.  
Recommended solution: Add one example scholarship match card.  
Priority: High  
Estimated implementation effort: Medium  
Expected business impact: Better credibility  
UX impact: High  
Conversion impact: High

12. Current problem: Mobile users scroll too far before the main action.  
Why it matters: Mobile intent decays quickly.  
Recommended solution: Move form higher and shorten mobile hero copy.  
Priority: High  
Estimated implementation effort: Medium  
Expected business impact: More mobile completions  
UX impact: High  
Conversion impact: High

13. Current problem: No sticky CTA on mobile.  
Why it matters: The core action disappears during long reading.  
Recommended solution: Add a sticky "Start Matching" CTA.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: More form starts  
UX impact: Medium  
Conversion impact: High

14. Current problem: Form is long for first-time users.  
Why it matters: Long forms reduce starts and completions.  
Recommended solution: Break into steps with optional advanced inputs.  
Priority: High  
Estimated implementation effort: Medium  
Expected business impact: Better completion rate  
UX impact: High  
Conversion impact: High

15. Current problem: Focus styles are subtle and inconsistent.  
Why it matters: Keyboard users can lose context.  
Recommended solution: Create strong, consistent focus-visible rings.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Accessibility improvement  
UX impact: Medium  
Conversion impact: Medium

16. Current problem: No skip link exists.  
Why it matters: Keyboard and screen reader users must traverse repeated nav each time.  
Recommended solution: Add a skip-to-form or skip-to-main link.  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Accessibility maturity  
UX impact: Medium  
Conversion impact: Low

17. Current problem: Success probability framing may overstate certainty.  
Why it matters: Overclaiming can reduce trust if results feel subjective.  
Recommended solution: Reframe as "fit score" or "estimated alignment score".  
Priority: High  
Estimated implementation effort: Small  
Expected business impact: Better credibility  
UX impact: Medium  
Conversion impact: Medium

18. Current problem: "Why you'll win" language may feel too absolute.  
Why it matters: Education tools must sound credible, not hype-heavy.  
Recommended solution: Use "Why this is a strong fit" or "Why this may suit your profile".  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Better trust  
UX impact: Medium  
Conversion impact: Medium

19. Current problem: Info pages feel supportive but not strategically differentiated.  
Why it matters: Extra pages should deepen trust or intent.  
Recommended solution: Add practical proof, examples, and route-specific CTAs.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better assisted conversion  
UX impact: Medium  
Conversion impact: Medium

20. Current problem: Card styles are too uniform across content types.  
Why it matters: Hierarchy flattens.  
Recommended solution: Create distinct card archetypes.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Stronger visual clarity  
UX impact: Medium  
Conversion impact: Medium

21. Current problem: Helper text contrast is too low in some areas.  
Why it matters: Important guidance becomes easy to miss.  
Recommended solution: Raise helper text contrast and slightly increase size.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Fewer mistakes  
UX impact: Medium  
Conversion impact: Medium

22. Current problem: The homepage feature list is generic.  
Why it matters: It repeats benefits without proof.  
Recommended solution: Replace with proof-backed claims or real examples.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Stronger persuasion  
UX impact: Medium  
Conversion impact: Medium

23. Current problem: No indication of data source quality.  
Why it matters: Scholarship freshness and legitimacy are central trust concerns.  
Recommended solution: Add "How data is reviewed" disclosure.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Better trust  
UX impact: Medium  
Conversion impact: Medium

24. Current problem: Unlock modal lacks a clear privacy assurance line.  
Why it matters: This is the exact trust threshold moment.  
Recommended solution: Add one reassurance sentence directly below submit.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Better submit rate  
UX impact: Medium  
Conversion impact: Medium

25. Current problem: No field autofill optimization is visible.  
Why it matters: Repetitive manual input slows completion.  
Recommended solution: Add appropriate autocomplete attributes where safe.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Faster completion  
UX impact: Medium  
Conversion impact: Medium

26. Current problem: Country selection via chips may not scale.  
Why it matters: More destination choices will become unwieldy.  
Recommended solution: Add searchable multi-select for countries.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better scalability  
UX impact: Medium  
Conversion impact: Medium

27. Current problem: No form completion indicator exists.  
Why it matters: Users cannot estimate remaining effort.  
Recommended solution: Add stepper or completion percentage.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: More completions  
UX impact: Medium  
Conversion impact: Medium

28. Current problem: Smooth scrolling is always enabled.  
Why it matters: Some users prefer reduced motion.  
Recommended solution: Respect `prefers-reduced-motion`.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Accessibility compliance  
UX impact: Medium  
Conversion impact: Low

29. Current problem: Result refresh state is blunt.  
Why it matters: "Data unavailable" needs more graceful fallback.  
Recommended solution: Offer cached examples, retry context, and status explanation.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better recovery  
UX impact: Medium  
Conversion impact: Medium

30. Current problem: Thank-you page is friendly but under-leverages next steps.  
Why it matters: This is a post-conversion opportunity.  
Recommended solution: Add "what to do while waiting", resend email, and save calendar actions.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better downstream engagement  
UX impact: Medium  
Conversion impact: Medium

31. Current problem: WhatsApp support appears too late.  
Why it matters: Some users need reassurance before submitting.  
Recommended solution: Add a softer support CTA earlier in the funnel.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Less hesitation  
UX impact: Medium  
Conversion impact: Medium

32. Current problem: No social proof exists on the homepage.  
Why it matters: First-time visitors lack confidence cues.  
Recommended solution: Add ethical, real usage proof or advisor endorsements.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Trust growth  
UX impact: Medium  
Conversion impact: Medium

33. Current problem: No progress save / return option exists.  
Why it matters: Scholarship research is often interrupted.  
Recommended solution: Add save-for-later or email-my-progress.  
Priority: Medium  
Estimated implementation effort: Large  
Expected business impact: Return sessions  
UX impact: High  
Conversion impact: Medium

34. Current problem: Results lack export or shortlist saving.  
Why it matters: Users want actionable output, not just a one-time view.  
Recommended solution: Add PDF/email/save shortlist options.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better perceived utility  
UX impact: High  
Conversion impact: Medium

35. Current problem: No breadcrumb or route orientation on info pages.  
Why it matters: Secondary pages feel detached.  
Recommended solution: Add lightweight route context and clearer return paths.  
Priority: Low  
Estimated implementation effort: Small  
Expected business impact: Better navigation clarity  
UX impact: Low  
Conversion impact: Low

36. Current problem: Repeated pill styling makes interfaces blur together.  
Why it matters: Important actions do not stand out enough.  
Recommended solution: Reserve pill style for filters and nav, not every action.  
Priority: Low  
Estimated implementation effort: Medium  
Expected business impact: Cleaner hierarchy  
UX impact: Low  
Conversion impact: Low

37. Current problem: Footer links are functional but low-value.  
Why it matters: Footer space could reinforce trust and utility.  
Recommended solution: Add privacy, methodology, support, and student resources.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better trust  
UX impact: Low  
Conversion impact: Low

38. Current problem: No route transition strategy exists.  
Why it matters: Navigation feels abrupt or reload-heavy.  
Recommended solution: Add subtle client-side page transitions.  
Priority: Low  
Estimated implementation effort: Medium  
Expected business impact: Better polish  
UX impact: Medium  
Conversion impact: Low

39. Current problem: The 404 state is clear but not conversion-minded enough.  
Why it matters: Error pages can still recover sessions.  
Recommended solution: Add a direct start CTA and quick route suggestions.  
Priority: Low  
Estimated implementation effort: Small  
Expected business impact: Better recovery  
UX impact: Low  
Conversion impact: Low

40. Current problem: Success states rely on celebratory copy but not operational reassurance.  
Why it matters: Users want certainty their report is actually sent.  
Recommended solution: Add resend, change email, or "didn't receive?" support path.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better post-submit confidence  
UX impact: Medium  
Conversion impact: Low

41. Current problem: No dedicated "how scoring works" explanation exists in results.  
Why it matters: Scores without explanation can feel arbitrary.  
Recommended solution: Add a fit-score explainer tooltip or panel.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Better trust  
UX impact: Medium  
Conversion impact: Medium

42. Current problem: Input helper copy sometimes competes with labels.  
Why it matters: Too much microcopy can slow scanning.  
Recommended solution: Trim helper text to only high-value instructions.  
Priority: Low  
Estimated implementation effort: Small  
Expected business impact: Better readability  
UX impact: Low  
Conversion impact: Low

43. Current problem: Modal close affordance is visually minimal.  
Why it matters: Users need easy exit control in gated flows.  
Recommended solution: Increase close visibility and add explicit "Not now".  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Better perceived control  
UX impact: Medium  
Conversion impact: Low

44. Current problem: Results top card lacks direct next-step actions.  
Why it matters: Users need momentum after insight.  
Recommended solution: Add actions like "save", "view deadline advice", "see full strategy".  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better engagement depth  
UX impact: Medium  
Conversion impact: Medium

45. Current problem: Progress log is polished but generic.  
Why it matters: Generic loading can feel fake.  
Recommended solution: Show more truthful status messages tied to the actual request lifecycle.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Better credibility  
UX impact: Medium  
Conversion impact: Low

46. Current problem: No direct comparison utility exists for country planning.  
Why it matters: Country selection is a major decision variable.  
Recommended solution: Add compare-country matrix or recommendation hints.  
Priority: Medium  
Estimated implementation effort: Large  
Expected business impact: Higher perceived expertise  
UX impact: High  
Conversion impact: Medium

47. Current problem: SVG-only OG image strategy may be brittle on some platforms.  
Why it matters: Shared links may preview inconsistently.  
Recommended solution: Add raster social cards.  
Priority: Low  
Estimated implementation effort: Small  
Expected business impact: Better share quality  
UX impact: Low  
Conversion impact: Low

48. Current problem: No persistent support or FAQ aid exists during form fill.  
Why it matters: Users may stall on uncertainty.  
Recommended solution: Add inline help drawer or contextual FAQ.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Lower abandonment  
UX impact: Medium  
Conversion impact: Medium

49. Current problem: No design system documentation exists in-product.  
Why it matters: UI consistency may drift as features grow.  
Recommended solution: Create component inventory and token rules.  
Priority: Medium  
Estimated implementation effort: Medium  
Expected business impact: Faster future delivery  
UX impact: Indirect  
Conversion impact: Indirect

50. Current problem: The homepage currently asks users to trust AI more than it explains AI.  
Why it matters: AI skepticism is real in education decision flows.  
Recommended solution: Add a plain-language "How the AI helps, and where human judgment still matters" section.  
Priority: Medium  
Estimated implementation effort: Small  
Expected business impact: Stronger trust  
UX impact: Medium  
Conversion impact: Medium

