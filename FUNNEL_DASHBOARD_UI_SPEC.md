# Funnel Dashboard UI Specification & Data Contract

This document specifies the exact data contracts, components, metrics, and visual hierarchy required to construct the localhost browser UI.

---

## 1. Overall Dashboard Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Project Nebula Traffic & Funnel Intelligence (Localhost:3000)      │
├────────────────────────────────────────────────────────────────────────────┤
│ [Top Metric Strip: Visits | Views | Inbound Clicks | Total Conversions]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SECTION 1: THE VISUAL FUNNEL & FLOW PIPELINE                              │
│  - Inbound Channels (Left: LinkedIn, Reddit, Direct, AI Crawlers)          │
│  - Journey: Landing -> Scrolled -> Last Slide (#contact)                   │
│  - AT LAST SLIDE (#contact): Traffic branches into:                        │
│      A) Primary CTA: "Clicked Early Access" (148) -> Submitted Form (40)  │
│      B) Outbound Socials: LinkedIn / Twitter / GitHub / Community links    │
│      C) Exit / Drop-off without action                                     │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SECTION 2: STAGE-BY-STAGE DROP-OFF DIAGNOSTICS                            │
│  - Interactive tabs for Stage 1→2, Stage 2→3, Stage 3→4, Stage 4→5       │
│  - Dimension cuts: By Device, By Referrer Channel, By Country, By Skim Time│
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SECTION 3: SECTION-LEVEL RETENTION HEATMAP (8 Page Slides)               │
│  - problem -> solution 1-5 -> competition -> contact                       │
│  - Read-through % & Average Time-on-Slide                                 │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SECTION 4: AI BOT INTELLIGENCE & BOT FUNNEL                               │
│  - Human vs. Bot traffic ratio                                             │
│  - Bot crawler categorization (Search vs. AI Model Scrapers vs. SEO)       │
│  - 3-Stage Bot Funnel (Crawl -> CTA link touch -> Form probe)              │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SECTION 5: DUB LINK & INBOUND ATTRIBUTION                                 │
│  - dub links performance table                                             │
│  - go.projectnebula.site/form cross-check stats                            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Data Contract (Served to the UI)

The local backend engine outputs the following unified JSON payload to `GET /api/funnel-data`:

```json
{
  "summary": {
    "totalPageVisits": 1420,
    "totalPageViews": 2180,
    "viewsPerVisitRatio": 1.53,
    "inboundDubClicks": 980,
    "totalConversions": 38,
    "overallConversionRate": 2.68
  },
  "funnelStages": [
    {
      "stageId": 1,
      "name": "Arrivals",
      "count": 1420,
      "conversionFromPrevious": 100.0,
      "dropOffRate": 0.0,
      "badge": "Visited projectnebula.site"
    },
    {
      "stageId": 2,
      "name": "Engaged Readers",
      "count": 994,
      "conversionFromPrevious": 70.0,
      "dropOffRate": 30.0,
      "badge": "Scrolled past hero into #problem"
    },
    {
      "stageId": 3,
      "name": "Deep Reads",
      "count": 426,
      "conversionFromPrevious": 42.85,
      "dropOffRate": 57.15,
      "badge": "Reached #contact section"
    },
    {
      "stageId": 4,
      "name": "Intent (CTA Click)",
      "count": 136,
      "conversionFromPrevious": 31.92,
      "dropOffRate": 68.08,
      "badge": "Clicked 'Request Early Access'"
    },
    {
      "stageId": 5,
      "name": "Converted",
      "count": 38,
      "conversionFromPrevious": 27.94,
      "dropOffRate": 72.06,
      "badge": "Submitted Early Access Form"
    }
  ],
  "slideRetention": [
    { "slideId": "hero", "title": "Hero / Globe", "retainedCount": 1420, "dropPercent": 0, "avgTimeSeconds": 8.4 },
    { "slideId": "problem", "title": "The Problem", "retainedCount": 994, "dropPercent": 30.0, "avgTimeSeconds": 14.2 },
    { "slideId": "solution-1", "title": "Trajectory Interception", "retainedCount": 810, "dropPercent": 18.5, "avgTimeSeconds": 16.8 },
    { "slideId": "solution-2", "title": "Cost Predictor", "retainedCount": 680, "dropPercent": 16.0, "avgTimeSeconds": 19.5 },
    { "slideId": "solution-3", "title": "Policy Layer", "retainedCount": 590, "dropPercent": 13.2, "avgTimeSeconds": 12.1 },
    { "slideId": "solution-4", "title": "Self-Updating Playbooks", "retainedCount": 510, "dropPercent": 13.5, "avgTimeSeconds": 11.4 },
    { "slideId": "solution-5", "title": "100% Self-Hosted", "retainedCount": 465, "dropPercent": 8.8, "avgTimeSeconds": 13.7 },
    { "slideId": "competition", "title": "Comparison Matrix", "retainedCount": 440, "dropPercent": 5.4, "avgTimeSeconds": 21.0 },
    { "slideId": "contact", "title": "Early Access Boarding", "retainedCount": 426, "dropPercent": 3.2, "avgTimeSeconds": 28.3 }
  ],
  "dropOffDiagnostics": {
    "byDevice": [
      { "device": "Desktop", "arrivals": 850, "deepReads": 340, "conversions": 29, "conversionRate": 3.41 },
      { "device": "Mobile", "arrivals": 520, "deepReads": 78, "conversions": 8, "conversionRate": 1.54 },
      { "device": "Tablet", "arrivals": 50, "deepReads": 8, "conversions": 1, "conversionRate": 2.0 }
    ],
    "byReferrer": [
      { "source": "LinkedIn", "clicks": 620, "visits": 580, "conversions": 24, "qualityScore": "High" },
      { "source": "Reddit", "clicks": 260, "visits": 230, "conversions": 6, "qualityScore": "Medium" },
      { "source": "Direct / Organic", "clicks": 100, "visits": 610, "conversions": 8, "qualityScore": "High" }
    ],
    "byTopCountries": [
      { "country": "US", "visits": 680, "ctaClicks": 84, "conversions": 23 },
      { "country": "IN", "visits": 390, "ctaClicks": 31, "conversions": 9 },
      { "country": "DE", "visits": 90, "ctaClicks": 7, "conversions": 2 },
      { "country": "GB", "visits": 85, "ctaClicks": 6, "conversions": 2 }
    ]
  },
  "botIntelligence": {
    "totalHumanRequests": 2180,
    "totalBotRequests": 890,
    "botSharePercentage": 28.99,
    "botFunnel": {
      "crawledSite": 890,
      "interactedCTA": 12,
      "attemptedSubmission": 2
    },
    "crawlerCategories": [
      { "category": "AI Model Crawler (GPTBot, ClaudeBot, CCBot)", "count": 480 },
      { "category": "Search Engine (Googlebot, Bingbot)", "count": 310 },
      { "category": "Commercial Scrapers / SEO Tools", "count": 100 }
    ]
  },
  "dubLinks": [
    {
      "linkId": "link_form",
      "shortUrl": "go.projectnebula.site/form",
      "targetUrl": "https://forms.gle/...",
      "totalClicks": 136,
      "lastClicked": "2026-09-04T08:30:00Z"
    }
  ]
}
```

---

## 3. Recommended Visual Components for the UI

1. **Top Metric Cards (4 cards):**
   * **True Visitors (`totalPageVisits`)**: Derived from Cloudflare RUM.
   * **Inbound Interest (`inboundDubClicks`)**: Aggregated clicks across all Dub links.
   * **Total Submissions (`totalConversions`)**: Verified form submits.
   * **End-to-End Conversion Rate (`overallConversionRate`)**: (Converted / Total Visitors) × 100.

2. **The Funnel Chart:**
   * Stepped horizontal bar chart or SVG trapezoid funnel.
   * Color gradient: Vibrant Purple (`#8b5cf6`) to Emerald Green (`#10b981`).
   * Drop-off tags between steps indicating red badges with exact drop count and `% lost`.

3. **Slide Heatmap Bar:**
   * Horizontal bar for each of the 8 slides showing percentage of visitors who reached it.
   * Highlighting in red or warning amber the slide with the highest single drop percentage.

4. **Bot Breakdown Donut Chart:**
   * Split of Human Visitors vs. AI Crawlers vs. Search Engines.
