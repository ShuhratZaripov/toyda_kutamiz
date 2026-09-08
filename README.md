# Wedding invitation engineering guide

This repository contains a multilingual, personalized wedding invitation that is exported as a fully static website.
This README is the primary engineering handoff for humans and coding agents.
It is intentionally implementation-focused, model-agnostic, and dense enough to support continued work without relying on prior conversation history.

## Current product

The invitation is for Shuxrat and Muhayyo.
The configured venue is Orzu wedding hall in Beruniy District, Republic of Karakalpakstan.
All configured events currently start at 18:00 in the `Asia/Tashkent` time zone.

The product supports four languages:

- Uzbek Latin, identified as `uz`.
- Uzbek Cyrillic, identified as `uz-cyrl`.
- Russian, identified as `ru`.
- English, identified as `en`.

The product supports three invitation types:

- `wedding` is the September 29, 2026 wedding invitation and presents Shuxrat and Muhayyo.
- `qizlar-bazmi` is the September 28, 2026 qizlar bazmi invitation and presents Muhayyo alone.
- `both` invites the recipient to both celebrations and presents two dated event cards plus the shared venue.

Every invitation can use a singular or plural form of address.
The address form is always an explicit generator choice and is never inferred from the recipient name.

## Non-negotiable implementation principles

Preserve these principles unless the product requirements explicitly change.

1. Keep the deployed site static.
   There is no backend, database, API route, serverless function, or server-side personalization.
2. Keep personalization in the URL fragment.
   The fragment is decoded in the browser and is not part of the normal HTTP request.
3. Preserve every published token meaning.
   Existing links are a public compatibility surface even though there is no formal API server.
4. Keep event content and translations centralized.
   Product copy, dates, names, venue data, and event variants belong in `config/wedding.ts`.
5. Treat motion as progressive enhancement.
   Content, navigation, and comprehension must not depend on animation, haptics, or parallax.
6. Optimize for slow mobile networks.
   Reuse a very small set of local, compressed, content-hashed image assets and rely on immutable HTTP caching.
7. Prefer native browser behavior over custom infrastructure.
   The implementation uses a native dialog, IntersectionObserver, the HTTP cache, and static hosting instead of custom modal, animation, image-cache, or service-worker frameworks.
8. Test behavior as users experience it.
   The Playwright suite is the executable specification for links, copy, layout, accessibility, motion, caching, and browser compatibility.
9. Keep dependencies minimal.
   Do not add a package when the platform, React, Next.js, or a few direct lines already solve the problem.

## Technology and tools

Runtime and build dependencies are pinned in `package-lock.json`.

| Tool | Current role |
| --- | --- |
| Node.js 20.9 or newer | Local development, static builds, scripts, and test orchestration. |
| Next.js 16 | App Router, static export, metadata, fonts, routing, and build output. |
| React 19 | Client state for token decoding, the generator, the opening gate, and motion enhancement. |
| TypeScript 5.9 | Domain types, token contracts, component props, and configuration validation. |
| ESLint 9 with `eslint-config-next` | Static code-quality validation. |
| Playwright 1.62 | End-to-end, cross-browser, responsive, accessibility, caching, and performance checks. |
| Cormorant Garamond | Display typography loaded through `next/font` and self-hosted in the export. |
| Manrope | Body typography loaded through `next/font` and self-hosted in the export. |
| AI raster image generation | The two original watercolor botanical assets were created during design work and committed locally as WebP files. |
| Browser-driven visual inspection | Used during visual development to evaluate real desktop and mobile layouts in addition to automated assertions. |

No image-generation service, font CDN, analytics provider, database, or external content API is used at runtime.

## Architecture at a glance

```text
/invite/
  -> InviteGenerator holds event, language, address form, and recipient name
  -> encodePersonalization creates a versioned binary token
  -> the token is appended after "#"
  -> the generator copies or opens the completed URL

/
  -> static HTML and assets load
  -> InvitationExperience reads window.location.hash
  -> decodePersonalization validates and decodes the token
  -> getInvitationContent resolves localized copy for one event mode
  -> getInvitationSchedule resolves one or two dated event cards
  -> OpeningGate presents the invitation entrance
  -> the main page renders the hero, personalized copy, details, map, and closing
  -> ScrollReveals progressively adds reveals, botanical motion, parallax, and milestone haptics
```

The generator and invitation use the same domain types and content resolver.
Do not create a second encoding implementation or duplicate event-specific rendering rules.

## Repository map

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Static root route that renders `InvitationExperience`. |
| `app/invite/page.tsx` | Unlinked, noindex route that renders the invitation-link generator. |
| `app/layout.tsx` | Global metadata, robots directives, viewport settings, and self-hosted font configuration. |
| `app/globals.css` | Entire visual system, responsive behavior, motion, accessibility states, and generator styling. |
| `app/not-found.tsx` | Development and framework-level not-found UI, which is intentionally removed from the production export. |
| `app/robots.ts` | Static `robots.txt` rule that disallows `/invite/`. |
| `components/InviteGenerator.tsx` | Generator form, live preview, local token creation, link output, and copy behavior. |
| `components/InvitationExperience.tsx` | Token-driven page composition and event schedule rendering. |
| `components/OpeningGate.tsx` | Native dialog entrance, focus handling, inert background, reduced-motion behavior, and opening haptic. |
| `components/ScrollReveals.tsx` | Intersection-driven reveals, desktop parallax, botanical activation, and milestone haptics. |
| `components/BotanicalOrnament.tsx` | Canonical mapping from botanical variants to local content-hashed WebP assets. |
| `config/wedding.ts` | Canonical wedding data, translations, event overrides, combined-event content, and schedules. |
| `lib/personalization.ts` | Public token protocol, validation, encoder, decoder, and domain identifiers. |
| `lib/haptics.ts` | Optional, reduced-motion-aware vibration helpers with a 12 ms maximum pulse. |
| `e2e/invitation.spec.ts` | Executable product specification across browsers and device profiles. |
| `playwright.config.ts` | Five-project browser matrix and local or deployed test orchestration. |
| `next.config.ts` | Static export and trailing-slash configuration. |
| `public/botanicals/` | Two transparent, content-hashed WebP botanical assets. |
| `public/_headers` | Cloudflare-compatible caching, indexing, referrer, framing, MIME, and permissions headers. |
| `scripts/prune-export.mjs` | Removes generated 404 output after every production build. |
| `scripts/serve-static.mjs` | Minimal production-like local server for `out/`, tests, cache headers, and safe path handling. |
| `scripts/measure-mobile-scroll.mjs` | Throttled Galaxy S24 Ultra-like scroll benchmark and optional performance budget check. |

## Content and event model

`config/wedding.ts` is the source of truth for public event information.
Edit names, dates, times, venue details, map URLs, and localized copy there.

`WeddingLocaleContent` defines the complete baseline content required by a language.
The baseline objects `uz`, `uzCyrl`, `ru`, and `en` describe the wedding.
`qizlarBazmi` contains the fields that differ for qizlar bazmi.
`bothEvents` contains the fields that differ for a combined invitation.

`getInvitationContent(language, invitationEvent)` merges the appropriate baseline and event override.
It also returns `singleName: true` only for qizlar bazmi.

`getInvitationSchedule(language, invitationEvent)` is the canonical rendering schedule.
It returns one item for a single event and two items in chronological order for `both`.
The UI maps this schedule into semantic `time` elements instead of hard-coding event cards.

When changing copy:

- Update singular and plural invitation sentences together.
- Update all four languages in the same change.
- Preserve formal capitalization rules, especially Russian `Вас` for singular and `вас` for plural.
- Keep functional labels concise even when emotional invitation copy is intentionally fuller.
- Verify the longest Cyrillic and English variants on narrow screens.

When changing dates or times:

- Update the machine-readable ISO dates and every localized display form.
- Keep the explicit `+05:00` offset aligned with `Asia/Tashkent`.
- Update `getInvitationSchedule` only if the ordering or event structure changes.
- Update exact E2E expectations.

## Personalized URL protocol

The fragment token is a versioned binary format encoded as unpadded URL-safe Base64.
The token is not JSON because compact links are easier to send through messaging applications.

A generated URL has this form:

```text
https://example.invalid/#<TOKEN>
```

The decoded byte layout is:

| Byte or range | Meaning |
| --- | --- |
| Byte 0 | Format family in the high nibble and format version in the low nibble. |
| Byte 1 | Header length in bytes, starting at byte 2. |
| Byte 2 | Core option bits. |
| Bytes 3 and 4 | Reserved header bytes, currently zero. |
| Byte 5 onward | Recipient display name encoded as UTF-8. |

The current first byte is `0xF1`.
The high nibble `0xF` identifies this format family.
The low nibble `1` identifies the current published version.

The current header length is `3`.
The name therefore starts at byte `2 + headerLength`, which is byte 5.

Byte 2 is arranged as `RR EE LLL A` from the most significant bit to the least significant bit.

| Bits | Meaning | Published values |
| --- | --- | --- |
| Bit 0, `A` | Address form | `0` singular, `1` plural. |
| Bits 1 through 3, `LLL` | Language | `0` Uzbek Latin, `1` Uzbek Cyrillic, `2` Russian, `3` English. |
| Bits 4 and 5, `EE` | Invitation event | `0` wedding, `1` qizlar bazmi, `2` both events, `3` invalid and currently reserved. |
| Bits 6 and 7, `RR` | Reserved | Currently zero and ignored by the decoder. |

For example, a plural Uzbek Latin invitation to both events has core byte `0x21`.
Event code `2` contributes `0x20`, and plural address contributes `0x01`.

### Token validation

The encoder and decoder enforce the following rules:

- The token must use canonical URL-safe Base64 characters without padding.
- The encoded payload is length-limited before decoding.
- The format family must be `0xF`.
- Version zero is rejected.
- Header lengths below 3 or above 32 are rejected.
- Event code 3 is rejected.
- Unknown language codes currently fall back to Uzbek Latin.
- The name must decode as valid UTF-8.
- Leading and trailing whitespace is normalized away by the generator and rejected as part of a decoded canonical value.
- A name must contain at least one character and no more than 120 Unicode code points.
- Control characters, line separators, bidi overrides, and bidi isolation controls are rejected.

### Compatibility contract

Treat `lib/personalization.ts` as a public protocol implementation.
Links already sent to guests must continue to open after future deployments.

Never renumber a published language, address form, event code, format family, or field location.
Do not change the meaning of a published bit.
Use currently reserved bits only after adding literal compatibility vectors and malformed-value coverage.
If a future version adds header fields, increase the header length and place those fields before the name.
Keep the first core options byte backward compatible whenever possible.
If more than four event codes are needed, design an explicit format evolution because the current two-bit event field is full.

The decoder intentionally accepts nonzero future versions in the same `0xF` family when their header length and current core fields remain compatible.
Extra header bytes are ignored so newer links can degrade safely in older builds.
Literal token vectors in the E2E suite protect this behavior.

## Privacy and indexing model

Recipient names are stored only inside generated URLs.
The generator does not upload, persist, log, or index a recipient list.
The project contains no guest database, CSV, analytics SDK, authentication service, or invitation API.

URL fragments are not normally sent to the HTTP server.
This prevents the recipient token from appearing in ordinary origin request paths and query strings.
The recipient name is also excluded from static HTML, metadata, and static asset contents.

This design is privacy-conscious but not confidential.
Base64 is encoding, not encryption.
Anyone who receives a link can open it, forward it, decode the recipient name, or retain it in browser history and messages.
`noindex`, `nofollow`, and the fragment boundary do not provide authentication.

The root metadata applies restrictive robots directives to the site.
`robots.txt` explicitly disallows `/invite/`.
The generator is intentionally unlinked from the invitation.
Knowing the generator URL is sufficient to open it, so it must not be treated as an admin boundary.

## Rendering flow

`InvitationExperience` starts with a pending personalization state because the fragment is available only in the browser.
After hydration, it decodes the current hash and listens for `hashchange`.
It resolves language, event content, and schedule from the decoded value.
It updates `document.documentElement.lang` and `document.title` to match the invitation.

Valid personalization renders the recipient honorific, display name, and singular or plural sentence.
Invalid personalization renders a localized error in the personal section.
Public event information remains visible even when a fragment is invalid.

Without JavaScript, the static wedding shell and public wedding details remain readable.
Fragment-based personalization, the opening gate, and enhanced motion require JavaScript.
The no-JavaScript E2E test protects the public-content fallback.

The opening gate uses a native `dialog` element.
It focuses the opening button, marks the invitation page `inert`, locks document scrolling, and prevents Escape from dismissing the invitation.
Opening the gate does not add or replace browser history, so one browser Back action still leaves the invitation.
Reduced-motion users bypass the 620 ms closing animation.

## Visual design philosophy

The current direction is bright, quiet, botanical, and paper-inspired without pretending the web page is a fixed paper canvas.
The palette uses ivory surfaces, charcoal typography, muted sage foliage, and restrained warm-gold accents.
Cormorant Garamond provides editorial display type, while Manrope keeps functional text legible.

The layout is section-based rather than one full-page background image.
Botanical assets are separate responsive elements so they can remain attached to corners across aspect ratios.
Plants must remain upright, with roots below flowers.
Right-side variants may be mirrored horizontally so their flowers lean inward toward the content.
Do not vertically flip a botanical.
Botanical entrance motion must rise upward rather than descend from the top.

The stylesheet currently contains an earlier structural visual layer followed by the newer bright-theme override layer.
CSS cascade order is therefore significant.
Many selectors appear more than once, and the later definitions in `app/globals.css` produce the current design.
Search for every definition before editing a selector.
Either update the final active rule or deliberately consolidate duplicates with full visual regression coverage.

Responsive breakpoints are centered around `48rem`.
Additional rules handle coarse pointers, short screens, and very short screens.
The combined invitation uses three detail columns on desktop and stacked cards on mobile.

## Motion, haptics, and performance

`ScrollReveals` is a progressive enhancement layer.
It discovers `data-reveal` groups, classifies child items, and reveals each group once through IntersectionObserver.
A MutationObserver allows late content changes to receive the same reveal treatment.

Botanical motion has two layers:

- A subtle CSS breeze keeps selected leaves visibly alive.
- Desktop parallax uses `data-depth`, is clamped to plus or minus 16 pixels, and runs only for intersecting layers.

Continuous parallax is disabled for coarse pointers and viewports below `48rem`.
This preserves mobile scroll performance while retaining lightweight botanical movement.

Haptics are optional.
The opening action uses a short vibration, and recipient, details, and closing milestones can vibrate once after their reveal settles.
Every pulse is capped at 12 ms.
Haptics never block an action and are disabled for reduced-motion users.

`prefers-reduced-motion: reduce` disables nonessential animation, reveal delays, parallax, and vibration.
Essential content must remain immediately visible and usable under this preference.

Do not introduce a React-managed image fade or per-image loading state without reproducing and testing multi-image loading in Chromium, Firefox, and Safari.
The current implementation intentionally relies on native loading, asynchronous decoding, compressed assets, and browser caching.

## Botanical assets and loading

The runtime uses exactly two source images:

- `public/botanicals/botanical-foreground.3b2f1d61.webp`.
- `public/botanicals/botanical-mid.5a66fa18.webp`.

Both are transparent WebP files with intrinsic dimensions of 768 by 1152.
`BotanicalOrnament` is the only canonical source mapping.
The files are reused, repositioned, rotated, and horizontally mirrored through CSS.

Gate and hero botanicals use eager loading because they are immediately visible.
Later section botanicals use native lazy loading.
All images use asynchronous decoding and empty alternative text because they are decorative.
`next/image` is configured with `unoptimized` for these local files because the deployment is a static export with already-compressed source assets.

Filenames include content hashes.
`public/_headers` and the local static server send `Cache-Control: public, max-age=31536000, immutable` for `/botanicals/*` and `/_next/static/*`.
Returning visitors therefore reuse browser-cached assets without an application-managed cache.
There is intentionally no service worker or offline cache.

When replacing an asset:

1. Export a transparent WebP at the smallest resolution that remains sharp at its largest rendered size.
2. Compress it for slow networks.
3. Put a content hash in the filename.
4. Update `components/BotanicalOrnament.tsx`.
5. Remove the obsolete unreferenced file so it cannot consume deployment bandwidth.
6. Verify both unique assets load, decode, and receive immutable cache headers.
7. Inspect every corner placement on desktop and mobile.

The original raster artwork was created with an AI image-generation tool.
That tool is not required to build, test, deploy, or modify the site.

## Static export and deployment behavior

`next.config.ts` sets `output: "export"` and `trailingSlash: true`.
`npm run build` runs `next build` and then `scripts/prune-export.mjs`.
The result is written to `out/`.

The prune step removes `out/404/` and `out/404.html`.
This is intentional because the deployment does not ship a custom 404 page.
`app/not-found.tsx` remains useful during framework development, but its generated production artifact is removed.
The local static server returns an empty 404 response when no generated 404 file exists.

`out/_next/static/` contains the framework runtime, route JavaScript, CSS, and self-hosted fonts required by the exported application.
Do not delete files from `out/_next/` based only on aggregate directory size.
Reduce that output only through source-level dependency, route, font, or bundle changes followed by a production build and browser verification.

The recommended Cloudflare Pages configuration is:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `out` |
| Runtime server | None |

`public/_headers` is copied into the export for Cloudflare-compatible hosting.
It applies immutable caching to hashed static assets and restrictive site-wide headers.
The local server mirrors the relevant safe and cache headers so E2E behavior is production-like.

HTML is intentionally not given an immutable cache lifetime.
Only content-addressed static resources receive the one-year immutable policy.

After deploying, test the actual origin with `PLAYWRIGHT_BASE_URL`.
At minimum, verify one singular wedding link, one plural wedding link, one qizlar bazmi link, one combined link, and one malformed fragment.

## Local development

Install the pinned dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The invitation is available at `http://localhost:3000/`.
The generator is available at `http://localhost:3000/invite/`.

The development route is convenient for iteration, but final behavior must be verified against the static export.

## Build and verification commands

Run lint:

```bash
npm run lint
```

Run TypeScript checking:

```bash
npm run typecheck
```

Build the static export:

```bash
npm run build
```

Serve the existing export locally:

```bash
npm run start
```

Use a custom port:

```bash
npm run start -- --port 4173
```

Install Playwright browsers once per environment:

```bash
npx playwright install chromium webkit firefox
```

Build and run the full production E2E suite:

```bash
npm run test:e2e:production
```

Run E2E tests against the existing `out/` directory:

```bash
npm run test:e2e
```

Run a focused test while iterating:

```bash
npm run test:e2e -- --grep='both celebrations'
```

Run the suite against a deployed origin:

```bash
PLAYWRIGHT_BASE_URL=https://example.pages.dev npm run test:e2e
```

When `PLAYWRIGHT_BASE_URL` is absent, Playwright starts `scripts/serve-static.mjs` on port 4173.
When it is present, Playwright does not start a local server.

## E2E test matrix

`playwright.config.ts` runs every scenario in five projects:

- Desktop Chrome through Chromium.
- Desktop Safari through WebKit.
- Desktop Firefox.
- Galaxy S9+ mobile emulation through Chromium.
- iPhone 15 Pro Max emulation through WebKit.

The suite currently contains 33 scenarios and therefore executes 165 tests across the five projects.
The exact count may grow, so behavior coverage matters more than preserving this number.

Coverage includes:

- Empty generator state, noindex behavior, and safe live previews.
- Exact singular and plural grammar.
- Wedding, qizlar bazmi, and combined-event links.
- All four languages and both writing systems used by Uzbek.
- Literal published-token compatibility and tolerance for future header fields.
- Invalid Base64, invalid UTF-8, unsafe Unicode, oversized names, obsolete formats, and the reserved event code.
- Recipient privacy across paths, queries, metadata, HTML, and static assets.
- Generator copy and open-link behavior.
- Empty production 404 behavior.
- Exact safe map anchors.
- Name alignment across asymmetric names.
- Botanical loading, decoding, caching, orientation, movement, and section containment.
- Desktop and mobile overflow, controls, spacing, and emotional scroll pacing.
- Keyboard focus visibility.
- Back-button behavior.
- Haptic timing and one-shot milestones.
- Reduced-motion behavior.
- No-JavaScript public content.
- Console and network cleanliness.

Failures retain traces, screenshots, and video in `test-results/`.
CI retries once and uses one worker for determinism.
Local runs are fully parallel and do not retry.

## Mobile scroll benchmark

The performance script emulates a Galaxy S24 Ultra-like device at 412 by 915 CSS pixels, a 3.5 device scale factor, touch input, and configurable CPU throttling.
It scrolls the complete page, samples animation-frame cadence, records long tasks, and measures browser performance counters.

The benchmark does not start a server.
Build and serve the export in one terminal:

```bash
npm run build
npm run start -- --port 4173
```

Run the report from a second terminal:

```bash
npm run perf:mobile
```

Enable regression budgets:

```bash
npm run perf:mobile:check
```

Test a deployed build and increase CPU throttling:

```bash
PERF_BASE_URL=https://example.pages.dev PERF_CPU_RATE=8 npm run perf:mobile
```

Useful environment variables are:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PERF_BASE_URL` | `http://127.0.0.1:4173` | Origin to benchmark. |
| `PERF_CPU_RATE` | `4` | Chromium CPU throttling multiplier. |
| `PERF_SCROLL_MS` | `12000` | Full-page scroll duration in milliseconds. |
| `PERF_ASSERT` | Disabled | Enables budget failures when set to `1` or `true`. |

The report is a controlled regression signal, not a substitute for profiling on the actual phones and networks used by guests.

## Common change recipes

### Change wedding facts or translations

1. Edit `config/wedding.ts`.
2. Update all affected languages and display formats.
3. Update exact copy and date assertions in `e2e/invitation.spec.ts`.
4. Run focused language and event tests.
5. Inspect the longest mobile copy.
6. Run the full verification commands before merging.

### Add a language

1. Add the stable identifier to `LANGUAGES` in `lib/personalization.ts`.
2. Assign a new published language code without changing existing codes.
3. Extend `Language`-keyed content in `config/wedding.ts`.
4. Add a generator option and localized placeholder in `InviteGenerator.tsx`.
5. Add token, generator, invitation, typography, and mobile-layout tests.
6. Add literal compatibility vectors after the language is released.

The current three-bit language field supports codes 0 through 7.
Codes 0 through 3 are already published.

### Add or change an invitation event

1. Update `INVITATION_EVENTS`, the event-code map, and validation in `lib/personalization.ts`.
2. Add localized event overrides in `config/wedding.ts`.
3. Update `getInvitationContent` and `getInvitationSchedule`.
4. Add the generator option.
5. Render from the schedule instead of branching in multiple components.
6. Add exact token bytes, copy, schedule, overflow, and all-language tests.

The current two-bit event field has codes 0, 1, and 2 published.
Code 3 is currently reserved and explicitly rejected.
Using code 3 requires a deliberate compatibility change and updated malformed-token coverage.

### Change the visual system

1. Search every definition of the selector in `app/globals.css`.
2. Identify whether the base layer or the later bright-theme override controls the result.
3. Preserve upward plant growth, inward lean, positive vertical scale, and readable content clearance.
4. Check the opening gate, hero, personal section, details, map, closing, and generator.
5. Test desktop, Samsung-sized Chromium, and iPhone-sized WebKit.
6. Verify reduced motion, focus visibility, and overflow.

### Change motion

1. Reproduce the current behavior in a real browser before editing.
2. Keep essential content independent from IntersectionObserver.
3. Keep coarse-pointer parallax disabled unless physical-device profiling proves it safe.
4. Respect live changes to `prefers-reduced-motion`.
5. Keep haptics optional, short, and one-shot.
6. Run reveal, breeze, haptic, reduced-motion, and scroll-performance checks.

### Replace botanical artwork

1. Preserve transparency and a tall portrait aspect ratio unless the component contract changes.
2. Export compressed WebP.
3. Use content-hashed filenames.
4. Update only the canonical source map.
5. Delete obsolete assets.
6. Verify native loading and immutable caching.
7. Inspect all corner crops at multiple aspect ratios.

### Change static hosting behavior

1. Keep `public/_headers`, `scripts/serve-static.mjs`, and deployment configuration aligned.
2. Preserve immutable caching only for content-addressed assets.
3. Preserve empty 404 behavior unless a real 404 product requirement is introduced.
4. Run E2E tests against both the local static server and the deployed origin.

## Known constraints and deliberate decisions

- The invitation is a bearer link and has no authorization layer.
- Recipient personalization requires JavaScript because fragments are not available to the server build.
- The generator UI is written in Uzbek Latin even when it produces another invitation language.
- All current events share one venue and start time.
- The combined mode models two scheduled events and one shared venue.
- The map links are trusted configuration and must remain exact safe external anchors.
- The site intentionally ships no custom production 404 page.
- The site intentionally has no service worker.
- The site intentionally has no custom image-load fade.
- The site intentionally has no runtime image optimizer.
- The CSS file contains layered historical and current rules whose order is behaviorally significant.
- The visual test suite is assertion-based rather than screenshot-baseline-based, so human visual inspection remains valuable after substantial art-direction changes.

## Agent continuation checklist

Before changing code:

1. Read this README completely.
2. Read any current user or repository instructions.
3. Check `git status`, the current branch, and recent commits.
4. Trace the complete user flow and every caller of the code being changed.
5. Reproduce reported UI bugs in an end-user browser when possible.

While changing code:

1. Preserve existing token meanings and literal compatibility vectors.
2. Reuse the content resolver, schedule resolver, components, CSS variables, and existing platform features.
3. Keep changes minimal but complete.
4. Add the smallest E2E assertion that would fail if the new behavior regresses.
5. Preserve unrelated user changes in a dirty worktree.

Before handing off:

1. Run `git diff --check`.
2. Run `npm run lint`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Run focused E2E tests while iterating.
6. Run the complete cross-browser suite for behavior, protocol, layout, or infrastructure changes.
7. Inspect high-risk visual changes on desktop and mobile.
8. Report the branch, verification performed, and any intentional limitation.

## Definition of done

A change is complete only when the static export still builds, existing links remain compatible, all affected languages are correct, mobile and desktop layouts remain readable, reduced-motion behavior remains usable, cached assets retain correct headers, and relevant E2E tests pass.
Do not assume a successful TypeScript build proves browser behavior.
Do not assume one Chromium screenshot proves Safari or mobile behavior.
Do not ship generated files, obsolete assets, speculative abstractions, or undocumented token changes.
