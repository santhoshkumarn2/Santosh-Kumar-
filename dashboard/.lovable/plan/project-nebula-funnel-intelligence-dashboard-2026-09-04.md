# Project Nebula — Funnel Intelligence Dashboard

A single-page analytics dashboard built to the uploaded spec, using the spec's JSON as built-in mock data, in a light, clean SaaS look with violet → emerald accents.

## Page structure (route `/`)

1. **Header** — "Project Nebula · Traffic & Funnel Intelligence", subtle environment tag, last-updated timestamp.
2. **Metric strip (4 cards)** — True Visitors (1,420), Inbound Interest (980 Dub clicks), Total Submissions (38), End-to-End Conversion Rate (2.68%). Each with label, big number, and a secondary line (e.g. views/visit 1.53).
3. **Section 1 — Visual funnel** — 5 tapered SVG stages (Arrivals → Engaged Readers → Deep Reads → Intent → Converted) with violet-to-emerald gradient, stage badge text, count, and red drop-off tags between stages showing lost count and % lost.
4. **Section 2 — Drop-off diagnostics** — tabs for Stage 1→2, 2→3, 3→4, 4→5; beneath, dimension cards for By Device, By Referrer Channel, By Country as compact tables with inline bars, conversion rates, and quality-score chips.
5. **Section 3 — Slide retention heatmap** — one horizontal bar per slide (hero → problem → solution 1-5 → competition → contact) showing retained count, reach %, avg time on slide; the highest single-drop slide highlighted in amber/red.
6. **Section 4 — Bot intelligence** — human vs bot donut (Human / AI crawlers / Search engines / Scrapers), bot share stat, crawler category list, and a 3-step bot funnel (Crawl 890 → CTA touch 12 → Form probe 2).
7. **Section 5 — Dub links & attribution** — table of short links with target, total clicks, last clicked, plus a cross-check note against Stage 4 CTA clicks.

## Design

- Light neutral canvas, white cards, hairline borders, soft shadows, generous spacing; rounded-xl.
- Accent ramp violet `#8b5cf6` → emerald `#10b981` used for funnel, bars, and donut; amber/red reserved for drop-off warnings.
- Typography pairing with a geometric display face for headings and a clean grotesque for body/numerals; tabular numbers for metrics.
- Fully responsive: cards stack, funnel becomes vertical on mobile.

## Technical notes

- `src/data/funnel-data.ts`: the spec JSON typed as `FunnelData` (one export, easy to swap for a real fetch later).
- Components under `src/components/dashboard/`: `MetricStrip`, `FunnelChart` (hand-rolled SVG), `DropOffDiagnostics` (tabs + tables), `SlideRetention`, `BotIntelligence` (donut via SVG arcs), `DubLinksTable`.
- Tabs use the existing shadcn primitives; charts are hand-built SVG so no charting dependency is added.
- Design tokens (accent, warning, chart colors) added to `src/styles.css` in oklch; no hardcoded color classes in components.
- Replace the placeholder `src/routes/index.tsx` with the dashboard and give it its own `head()` title/description/OG tags.
