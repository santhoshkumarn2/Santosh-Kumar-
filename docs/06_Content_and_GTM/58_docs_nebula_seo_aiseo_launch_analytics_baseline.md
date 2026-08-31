# Project Nebula — SEO & AISEO Launch Analytics Baseline

**Date of Record:** August 31, 2026  
**Domain:** `https://projectnebula.site`  
**Hosting Architecture:** Vercel Serverless (TanStack Start SSR) + Cloudflare Global Edge CDN  
**Repository Commit:** `d82d11f` (feat(seo): comprehensive SEO & AISEO optimization)  

---

## 1. Cloudflare AI Crawl Control & Traffic Telemetry

Live data captured from Cloudflare AI Crawl Control Dashboard (`/ai/overview` & `/ai/security`):

| Metric | Recorded Value | Status / Trend |
|:---|:---:|:---|
| **Total AI Crawler Requests (First 24h)** | **21 requests** | ↗️ 61.5% increase vs prior period |
| **Successful HTTP 200 Responses** | **19 requests (90.5%)** | ✅ Healthy |
| **Top AI Crawler** | **ClaudeBot (Anthropic)** | **14 requests** |
| **Secondary AI Crawlers** | **Applebot** (6 requests), **GPTBot** (1 request) | Ingesting |
| **Most Crawled Resource** | `https://projectnebula.site/sitemap.xml` | **13 successful requests** |
| **JavaScript Ingested by Applebot** | **170.27 KB** | Full DOM hydration executed |
| **Active Bot Blockades** | **0 crawlers blocked** | 100% unrestricted |
| **Managed robots.txt Status** | **Disabled (Off)** | Cloudflare override block removed |

### Individual Crawler Permission Matrix (Cloudflare Edge)
All 20+ tracked AI agents/scrapers confirmed unblocked:
* `ClaudeBot` (Anthropic): **Allowed**
* `GPTBot` (OpenAI): **Allowed**
* `ChatGPT-User` (OpenAI): **Allowed**
* `Claude-SearchBot` / `Claude-User` (Anthropic): **Allowed**
* `PerplexityBot` / `Perplexity-User`: **Allowed**
* `Applebot` / `Applebot-Extended`: **Allowed**
* `Googlebot` / `Google-Extended` / `Google-CloudVertexBot`: **Allowed**
* `Meta-ExternalAgent` / `FacebookBot`: **Allowed**
* `Bytespider` (ByteDance): **Allowed**
* `MistralAI-User`: **Allowed**
* `Manus Bot`: **Allowed**

---

## 2. Google Search Console & Rich Results Audit

**Test ID:** `Z1rNHuK0W2rRVOqB55htBw`  
**Test URL:** `https://search.google.com/test/rich-results/result?id=Z1rNHuK0W2rRVOqB55htBw`  
**Googlebot Fetch Status:** `HTTP/1.1 200 OK`  
**Renderer:** Google Smartphone Crawler (Headless Chromium)  
**Indexing Request Date:** August 31, 2026 (Submitted via Search Console URL Inspection)

### Extracted Schema.org Graph & Verification
* **`SoftwareApplication`**:
  * Name: `Project Nebula`
  * Alternate Name: `The Cloudflare for AI Agents`
  * Category: `SecurityApplication, DeveloperApplication`
  * Operating System: `Linux, Docker, Kubernetes, Self-Hosted`
  * Price: `$0 (Early Access / Open-Core)`
  * Features Extracted (8/8): Sub-5ms Interception, Cost Predictor, Policy Engine, Self-Updating Playbooks, 100% Self-Hosted, OWASP LLM Top 10 Mitigation, MCP Server Security, Framework Integrations.
  * Status: **VALID**
* **`WebSite`**:
  * Name: `Project Nebula`
  * Description: Real-time AI agent interception & cost control
  * Language: `en-US`
* **`FAQPage`**:
  * 5 Structured Q&A pairs (What is Nebula, Cost Control, EU AI Act Article 14, Supported Frameworks, Nebula vs Langfuse/LangSmith).
  * Target Use: Google AI Overviews, Perplexity, and ChatGPT Retrieval-Augmented Generation grounding.
* **`Organization`**:
  * Name: `Project Nebula`
  * Founder/Profile SameAs: `https://github.com/santhoshkumarn2`

---

## 3. Edge Latency & Network Benchmarks (Live curl metrics)

Live edge timings measured from client to `https://projectnebula.site` over TLS 1.3:

| Metric | Homepage (SSR) | Static Asset (`/og-image.png`) | Target / Industry Benchmark |
|:---|:---:|:---:|:---:|
| **DNS Resolution (`time_namelookup`)** | 69.5 ms | ~20 ms (cached) | < 100 ms |
| **TCP Connect (`time_connect`)** | 118.3 ms | ~45 ms | < 150 ms |
| **TLS Handshake (`time_appconnect`)** | 411.0 ms | ~110 ms | < 500 ms |
| **Time to First Byte (`time_starttransfer`)** | 1,247 ms | 327 ms | < 1,500 ms (SSR) / < 400 ms (CDN) |
| **Total Roundtrip (`time_total`)** | 1,248 ms | 328 ms | < 2,000 ms |
| **HTTP Response Code** | `200 OK` | `200 OK` | `200 OK` |
| **Compression** | Brotli (`br`) | Image (`image/png`) | Optimized |

---

## 4. On-Page Keyword Coverage & Intent Mapping

### Primary Brand & Infrastructure Cluster
* `Project Nebula` (Primary Brand)
* `The Cloudflare for AI Agents` (Positioning Analogy)
* `Self-Hosted AI Gateway` (Architecture Category)
* `Real-Time AI Agent Interception` (Core Capability 1)
* `Pre-Execution Token Cost Control` (Core Capability 2)

### High-Value 2026 Search Intent Expansion
* **Runtime Protection:** `AI agent runtime security`, `autonomous agent sandbox`, `agent policy enforcement`
* **Compliance & Standards:** `EU AI Act Article 14`, `OWASP LLM Top 10`, `agentic AI compliance`
* **Protocol & Framework Integrations:** `MCP security`, `MCP server governance`, `LangGraph`, `CrewAI`, `AutoGen`, `LlamaIndex`
* **FinOps & Cost Optimization:** `LLM inference cost optimization`, `LLM cost control`, `runaway loop prevention`

---

## 5. Live Asset Inventory Checklist

* [x] `https://projectnebula.site/robots.txt` (441 B, clean wildcard, discovery pointers)
* [x] `https://projectnebula.site/sitemap.xml` (1,973 B, 11 URLs including SPA section anchors)
* [x] `https://projectnebula.site/llms.txt` (3,692 B, standard B2A documentation)
* [x] `https://projectnebula.site/llms-full.txt` (7,305 B, in-depth architectural whitepaper)
* [x] `https://projectnebula.site/og-image.png` (572 KB, high-resolution dark-mode hero preview)
* [x] `https://projectnebula.site/.well-known/security.txt` (RFC 9116 security disclosure)
* [x] `https://projectnebula.site/site.webmanifest` (PWA / browser application metadata)

---

## 6. Review Schedule & Tracking Cadence

1. **T+3 Days (Sept 3, 2026):** Check Google Search Console Index Coverage report for `projectnebula.site/` to confirm live indexing.
2. **T+7 Days (Sept 7, 2026):** Audit keyword impressions in GSC for brand search queries (`"Project Nebula"`, `"Cloudflare for AI Agents"`).
3. **T+14 Days (Sept 14, 2026):** Review Cloudflare AI Crawl Control dashboard to measure bot crawl volume from Perplexity, ChatGPT, and ClaudeBot.
