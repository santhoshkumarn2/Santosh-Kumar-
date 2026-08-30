# Project Nebula — Hero Page (Page 1)

Build only the hero screen now. Dark, minimal, Vercel-like. Remaining pages come later, page by page.

## Intro sequence

1. On load: full black screen, centered text **"Welcome to the world of Agents"** — "Agents" rendered in the accent color (electric violet/cyan against near-black), everything else off-white.
2. After a short beat (~1.2s), the line animates: scales down to a small label and glides to the lower-right of the viewport, where it stays as a persistent marker.
3. As it moves, the hero content fades/rises in: headline **"Hello from Project Nebula"**, then the content headline from the file:
   - "If your models can be trained, why not your agents"
   - Sub-headline: "Real-Time AI Agent Interception & Pre-Execution Cost Control. 100% Self-Hosted."
   - A ↓ scroll button anchoring to the next section (placeholder target for now).
4. Intro plays once per page load; a user who prefers reduced motion sees the final state immediately.

## Dotted globe graphic

- A sphere drawn from dots (latitude/longitude dot grid, slowly rotating) sits **above the small "Welcome to the world of Agents" label** in the lower-right.
- On scroll down, the globe travels along a curved path toward the center of the viewport while scaling up, then fades out near the end of the hero scroll range.
- Scrolling back up reverses it exactly — the globe returns to the lower-right, re-fades in. Motion is scroll-progress driven, so it tracks the scroll position rather than firing once.

## Layout

- Hero is one full viewport section (100dvh), with an extra scroll length below it to drive the globe animation before the next page begins.
- Type: large tight-tracked sans for headings, muted gray body. Subtle grain/radial glow behind the globe for depth.
- Mobile: globe smaller, sits above the text stack; same curved-to-center behavior with reduced travel.

## Technical notes

- Rewrite `src/routes/index.tsx` as the hero page; extract `HeroIntro`, `DottedGlobe`, and `HeroContent` into `src/components/`.
- Dark design tokens (background, foreground, muted, accent, glow, gradient) added to `src/styles.css` in oklch — no hardcoded color classes in components.
- Animation with Motion for React (`motion`): intro timeline via variants; globe via `useScroll` + `useTransform` mapping scroll progress to x/y (curved via separate easing on each axis), scale, and opacity.
- Globe rendered as SVG dots computed from spherical coordinates (no WebGL), rotating with a CSS/Motion loop — light and SSR-safe.
- Route `head()`: Nebula-specific title, description, og/twitter tags.
