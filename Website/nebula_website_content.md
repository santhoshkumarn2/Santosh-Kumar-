# Project Nebula — Website Content Plan (v2)

> **Layout:** Full-screen scroll sections (one section = one viewport).  
> **Tone:** Minimal. Sharp. No fluff.  
> **Style:** Dark (Vercel-like).

---

## Page 1 — Hero (Full Screen)

**Headline:**
> If your models can be trained, Why not your agents

**Sub-headline:**
> Real-Time AI Agent Interception & Pre-Execution Cost Control. 100% Self-Hosted.

**Element:** ↓ Scroll button (anchors to Page 2)

*Nothing else on this page.*

---

## Page 2 — The Problem (Full Screen — All 3 on One Page)

**Section Title:**
> The agents are running. Nobody's watching.

| # | Problem | Two-Line Explanation |
|---|---------|---------------------|
| 1 | **Unpredictable Costs** | Recursive agent loops burn 3x–5x more tokens than estimated — and you only find out when the invoice arrives. 82% of agent builders say cost predictability is the #1 blocker to scaling. |
| 2 | **Zero Policy Enforcement** | Same prompt, same context — different execution path every time. Agents ignore company rules, compliance boundaries, and deterministic workflows mid-run because nothing enforces them during the loop. |
| 3 | **Data Leaves the Building** | Every cloud API call transmits your proprietary code, customer data, and internal docs to servers you don't control. Enterprise migration to self-hosted open-weight models grew 4x in 2025–2026 for exactly this reason. |

---

## Page 3 — Solution 1: Mid-Way Trajectory Interception (Full Screen)

**Title:**
> Catch it mid-flight. Not in the post-mortem.

**Body (6-7 lines):**

Nebula monitors every step of an agent's execution loop — tool selections, parameter payloads, chain-of-thought decisions — in real time. When a rule is violated or a trajectory drifts, Nebula intervenes and corrects the agent's course mid-cycle, before the action becomes irreversible.

Post-hoc tools like LangSmith and Arize show you what went wrong after the run completed. By then, the tokens are burned, the bad API call fired, the wrong database write committed. Nebula acts during execution — not after it.

**Stat Badge:**
> < 5ms P99 interception latency. Your agents don't feel it.

---

## Page 4 — Solution 2: Pre-Execution Cost Predictor (Full Screen)

**Title:**
> Know the cost before you pay it.

**Body (6-7 lines):**

Before any LLM call is dispatched, Nebula's resource weight matrix inspects the full payload — context window length, tool invocation count, model-specific token pricing, and estimated retry probability — then calculates the exact projected cost of that step.

If the projected cost exceeds your defined threshold, the call is paused, rerouted to a lighter model, or blocked entirely. No tokens consumed. No surprise bills. This is the difference between reading last month's bill and controlling this second's spend.

**Stat Badge:**
> Enterprises report 3x–5x cost overruns from uncontrolled recursive agent loops. Nebula stops them before the first token fires.

---

## Page 5 — Solution 3: Strict Regulatory Policy Layer (Full Screen)

**Title:**
> Your rules. Enforced every single run.

**Body (6-7 lines):**

You define the operational playbooks — compliance boundaries, action whitelists, formatting mandates, workflow constraints. Nebula enforces them as hard, deterministic execution policies that no agent can bypass or creatively reinterpret.

This isn't prompt-level guidance the model can ignore. This is a policy execution engine that blocks non-compliant tool calls before they fire — regardless of what the LLM decided. For teams subject to EU AI Act Article 14, HIPAA, SOC 2, or internal audit frameworks, this is the line between a governance checkbox and actual governance.

**Stat Badge:**
> EU AI Act Article 14 mandates real-time active intervention for autonomous systems. Post-hoc logs don't comply.

---

## Page 6 — Solution 4: Self-Updating Playbooks (Full Screen)

**Title:**
> Your agents stopped repeating the same mistakes.

**Body (6-7 lines):**

Most agent frameworks run on static playbooks — the agent gets instructions once and free-runs. If it makes a mistake in cycle 3, it repeats that exact mistake in cycle 4, cycle 5, and cycle 47.

Nebula's playbook architecture works differently. After each execution cycle, validated outcomes feed back into the agent's operational playbook. The core structure stays fixed and deterministic. The execution strategy evolves based on real outcome data — automatically. No prompt hacking. No retraining. No manual intervention.

**Stat Badge:**
> Continuous feedback loop. Zero human intervention. Agents that get better at their job every cycle.

---

## Page 7 — Solution 5: 100% Self-Hosted (Full Screen)

**Title:**
> Your infrastructure. Your data. Zero exceptions.

**Body (6-7 lines):**

Nebula deploys directly on your servers — bare metal, Docker, Kubernetes, private VPC. There is no cloud component. No telemetry. No "call home." Zero bytes of your data ever leave your network boundary.

Every other tool in this space — LangSmith, Arize, Portkey, LiteLLM — runs on multi-tenant cloud infrastructure. Your agent traces, policy configs, and compliance audit trails sit on someone else's servers. Nebula is built from day one for total air-gapped, on-premise deployment. For enterprises with data residency mandates or IP sensitivity — there is no alternative.

**Stat Badge:**
> Single binary. Docker-native. Deploys on existing Kubernetes infrastructure. Zero additional cloud dependencies.

---

## Page 8 — The Status Quo (Competitive Comparison — Full Screen)

**Section Title:**
> What exists today — and why it's not enough.

| Capability | Post-Hoc Loggers | Passive Gateways | **Nebula** |
|-----------|-----------------|-----------------|------------|
| **When It Acts** | After execution ends | Before/after API call | **Mid-execution — real time** |
| **Cost Control** | Billing dashboards | Rate limiting | **Pre-execution cost prediction** |
| **Self-Learning** | Static | None | **Self-updating playbooks** |
| **Data Privacy** | Multi-tenant cloud | Multi-tenant cloud | **100% self-hosted** |
| **Compliance** | Audit logs | Basic filtering | **Real-time active intervention** |
| **Examples** | LangSmith, Arize, Langfuse | Portkey, LiteLLM | **Project Nebula** |

---

## Page 9 — Signup + Footer (Full Screen)

**Section Title:**
> Get early access.

**Sub-text:**
> Nebula is in closed development. Join the waitlist to be among the first to deploy real-time agent governance on your own infrastructure.

**Form Fields:**
- Full Name
- Work Email
- Company Name
- Your Role *(dropdown: CTO / VP Eng / AI Infra Lead / AI Engineer / Other)*
- Agents in production? *(dropdown: 0 / 1–5 / 6–20 / 20+)*

**Below form:**
> Early access members get founding-partner pricing and direct engineering support.

**Footer:**
> *(User will provide footer code)*

---

## Full Scroll Flow Summary

```
┌──────────────────────────────┐
│  Page 1: HERO                │  Headline + Sub-headline + ↓ Button
├──────────────────────────────┤
│  Page 2: THE PROBLEM         │  3 problems, 2 lines each, with stats
├──────────────────────────────┤
│  Page 3: SOLUTION 1          │  Mid-Way Trajectory Interception
├──────────────────────────────┤
│  Page 4: SOLUTION 2          │  Pre-Execution Cost Predictor
├──────────────────────────────┤
│  Page 5: SOLUTION 3          │  Strict Regulatory Policy Layer
├──────────────────────────────┤
│  Page 6: SOLUTION 4          │  Self-Updating Playbooks
├──────────────────────────────┤
│  Page 7: SOLUTION 5          │  100% Self-Hosted Architecture
├──────────────────────────────┤
│  Page 8: STATUS QUO          │  Competitive Comparison Grid
├──────────────────────────────┤
│  Page 9: SIGNUP + FOOTER     │  Waitlist Form + Footer
└──────────────────────────────┘
```

---

*Content Version: 2.0 — August 2026*
