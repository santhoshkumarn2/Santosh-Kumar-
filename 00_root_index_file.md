---
domain: "Master Index"
tags:
  - nebula/moc
  - nebula/index
status: active
---

# Project Olympus Master Index & Map of Content (MOC)

This note serves as the central **Map of Content (MOC)** for Project Olympus and your Obsidian Vault.
Use this index to quickly navigate all core documentation, strategy blueprints, product specs, operations, codebases, and skills libraries.

---

## 🎨 Vault Styling & Aesthetic Theme Configuration
* **Theme**: Catppuccin (`Catppuccin v0.4.49`)
* **Mode**: Obsidian Dark Mode (`"theme": "obsidian"`)
* **Accent Color**: Electric Cyan (`#00f3ff`)
* **Active CSS Snippet**: `super-cool-style.css`
  * ✨ Gradient header typography (H1-H3)
  * 🏷️ Glowing cyberpunk pill tags (`#nebula/*`, `#code/*`, `#skills/*`)
  * 💳 Modern callout cards with subtle backdrop blur & glow hover states
  * 🔗 Styled wikilinks with animated underline glow

---

## 📂 Workspace Taxonomy & Hub Overview

### 📂 `/docs/` — Project Documentation Hub
All project documentation is structured into 7 domain-specific directories with standardized YAML frontmatter and Obsidian tags:

* **`01_Strategy_and_Market/`** (`#nebula/strategy`, `#nebula/market`)
  * `assets/` — Pitch deck presentation binaries (`investor_pitch_deck.pptx`, `pitch_deck.pptx`)
  * [[20_docs_nebula_go_to_market_plan]] — Go-To-Market Strategic Plan
  * [[21_docs_nebula_multibillion_dollar_positioning_strategic_plan]] — Strategic Positioning Blueprint
  * [[22_docs_nebula_pitch_deck_content]] — Core Pitch Deck Copy
  * [[23_docs_nebula_1_page_investment_teaser]] — 1-Page Investment Teaser
  * [[24_docs_nebula_financial_runway_model]] — Financial Runway & Projections
  * [[31_docs_nebula_competitive_analysis_indian_moat_strategy]] — Competitive Moat Strategy
  * [[32_docs_nebula_global_competitive_landscape_deep_dive]] — Global Competitor Analysis
  * [[33_docs_nebula_competitor_architecture_gaps_deep_dive]] — Competitor Architecture Gaps
  * [[51_docs_nebula_founder_independence_and_anti_vc_trap_plan]] — Founder Independence Blueprint
  * [[15_docs_waste_management_market_report]] — Market Analysis Report

* **`02_Product_and_Architecture/`** (`#nebula/architecture`, `#nebula/product`)
  * [[35_docs_nebula_master_prd]] — Master Product Requirements Document (PRD)
  * [[36_docs_nebula_master_trd]] — Master Technical Requirements Document (TRD)
  * [[09_docs_testerarmy_architecture_plan]] — TesterArmy Architecture Plan
  * [[10_docs_testerarmy_architecture_spec]] — TesterArmy Technical Spec
  * [[30_docs_nebula_ai_agent_governance_problems_research]] — AI Agent Governance Research
  * [[34_docs_nebula_architecture_spec_leveraging_structural_moats]] — Structural Moats Architecture Spec
  * [[40_docs_nebula_prototype_design]] — Prototype Design & Workflows
  * [[48_docs_system_dependency_report]] — System Dependency Audit
  * [[58_agent_019_gap_scanner_build_deploy_report]] — Gap Scanner Deploy Report
  * [[58_docs_nebula_agent_corporation_build_deploy_report]] — Agent Corporation Deploy Report
  * [[59_docs_litellm_vercel_cloudflare_hosting_guide]] — LiteLLM Hosting & Cloudflare Guide
  * [[60_docs_litellm_proxy_setup_implementation_plan]] — LiteLLM Proxy Implementation Plan

* **`03_Fundraising_and_Legal/`** (`#nebula/fundraising`, `#nebula/legal`)
  * [[16_docs_founder_equity_control_fundraising_guide]] — Equity Control & Fundraising Guide
  * [[17_docs_pre_seed_ai_fundraising_deep_dive]] — Pre-Seed AI Fundraising Deep Dive
  * [[18_docs_pre_seed_pitch_and_documentation_blueprint]] — Pre-Seed Pitch Blueprint
  * [[19_docs_100_question_investor_faq_masterclass]] — 100 Investor FAQ Masterclass
  * [[25_docs_nebula_due_diligence_faq_memo]] — Due Diligence Memo

* **`04_Hiring_and_Advisors/`** (`#nebula/hiring`, `#nebula/advisors`)
  * [[37_docs_nebula_advisory_and_job_roles_playbook]] — Advisory & Job Roles Playbook
  * [[38_root_advisor_reachout]] — Advisor Reachout Scripts
  * [[39_docs_nebula_advisor_tracker]] — Advisor Tracking Sheet
  * [[49_docs_nebula_mvp_employee_list]] — MVP Hiring List
  * [[50_docs_nebula_equity_hiring_strategy]] — Equity Hiring Strategy
  * [[52_docs_nebula_hiring_and_internship_land_plan]] — Internship & Hiring Rollout Plan
  * [[53_docs_nebula_equity_hiring_cofounder_toolkit]] — Co-founder Equity Toolkit

* **`05_Brand_and_Naming/`** (`#nebula/brand`, `#nebula/naming`)
  * [[26_docs_company_naming_implementation_plan]] — Naming Implementation Plan
  * [[27_docs_company_naming_options_report]] — Naming Options Report
  * [[28_docs_company_naming_walkthrough]] — Naming Selection Walkthrough
  * [[29_docs_brand_identity_50_term_naming_engine]] — 50-Term Naming Engine

* **`06_Content_and_GTM/`** (`#nebula/gtm`, `#nebula/content`)
  * [[54_docs_nebula_linkedin_gap_solution_content_engine]] — LinkedIn Content Engine
  * [[55_docs_nebula_substack_newsletter_engine]] — Substack Newsletter Strategy
  * [[56_docs_nebula_slack_community_roundtable]] — Community Roundtable Blueprint
  * [[57_docs_nebula_concierge_audit_conversion_pipeline]] — Audit & Conversion Pipeline
  * [[58_docs_nebula_seo_aiseo_launch_analytics_baseline]] — SEO & AISEO Launch Analytics Baseline
  * [[58_linkedin_website_launch_aiseo_post]] — Website Launch LinkedIn Marketing Post

* **`07_Research_and_Case_Studies/`** (`#nebula/research`, `#nebula/case-studies`)
  * [[01_docs_summary]] — Executive Summary Notes
  * [[04_docs_continuous-learning-report]] — Continuous Learning Report
  * [[08_docs_testerarmy_case_study]] — TesterArmy Case Study
  * [[41_docs_claude_fable5_mythos5_deep_research]] — Deep Research Report
  * [[58_docs_nebula_autonomous_agent_corporation_deep_research]] — Autonomous Agent Deep Research

---

### 💻 Codebases, Operations & Skills Hub

* **`/src/`** (`#code/src`, `#code/rust`)
  * [[00_src_index]] — Core Rust Gateway Codebase Index Note (`Cargo.toml`, `main.rs`, `domain.rs`, `ports.rs`, `adapters.rs`)
* **`/operations/`** (`#operations`)
  * [[00_operations_index]] — Operations & Background Services Index Note (`agent-runner`, `litellm-proxy`, scripts)
* **`/skills/`** (`#skills/local`)
  * [[00_skills_index]] — Local Custom Agent Skills & Categorization Schemas
* **`/antigravity-awesome-skills/`** (`#skills/awesome`)
  * [[00_awesome_skills_index]] — Master Awesome Skills Catalog MOC (100+ production agent skills)
* **`/ideas/`** (`#ideas`)
  * Outreach templates, FAST legal agreements, LinkedIn content engines, TryPost integration

---

## ⚙️ Vault Indexing Rules (`.obsidian/app.json`)
Obsidian indexes all project markdown notes, source code modules, and skills catalogs while excluding non-source build artifacts and node packages:
* **Indexed**: `/docs`, `/src`, `/tests`, `/operations`, `/skills`, `/antigravity-awesome-skills`, `/everything-claude-code`, `/ideas`, `/scratch`
* **Excluded**: `**/node_modules/**`, `**/.git/**`, `**/target/**`, `**/dist/**`, `**/build/**`, `**/__pycache__/**`
