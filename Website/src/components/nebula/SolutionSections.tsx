import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

type A = { reduce: boolean };

const loop = (reduce: boolean, duration: number, delay = 0) =>
  reduce
    ? { duration: 0 }
    : { duration, delay, repeat: Infinity, ease: "easeInOut" as const };

/* ---------------- Solution 1 — Mid-Way Trajectory Interception ---------------- */
/** An agent trajectory runs left→right; a drifting step is caught at the gate and steered back. */
function InterceptAnimation({ reduce }: A) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-violet-400/25 bg-violet-400/5 md:h-52">
      <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="An agent trajectory intercepted mid-flight and corrected back on course">
        <path d="M14 96 H300" stroke="oklch(0.7 0.12 300)" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="6 8" />
        {/* drift path */}
        <path d="M150 96 C186 96, 200 62, 236 46" fill="none" stroke="oklch(0.7 0.18 300)" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="4 6" />

        {/* execution steps on the safe track */}
        {[0, 1, 2, 3].map((i) => (
          <motion.g
            key={i}
            initial={{ x: 0, opacity: 0 }}
            animate={reduce ? { x: 0, opacity: 1 } : { x: [0, 286], opacity: [0, 1, 1, 0] }}
            transition={loop(reduce, 4.2, i * 1.05)}
          >
            <rect x="8" y="90" width="14" height="12" rx="2.5" fill="oklch(0.72 0.17 300)" />
            <rect x="11" y="94" width="8" height="1.4" fill="oklch(0.2 0.02 300)" />
          </motion.g>
        ))}

        {/* the drifting step: rises off-track, gets pushed back down */}
        <motion.g
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: [90, 140, 150, 200], y: [0, -34, -2, 0], opacity: [0, 1, 1, 1] }}
          transition={loop(reduce, 4.6, 0.6)}
        >
          <rect x="8" y="90" width="14" height="12" rx="2.5" fill="oklch(0.78 0.2 330)" />
          <text x="15" y="99.5" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.2 0.02 320)">!</text>
        </motion.g>

        {/* interception gate */}
        <g transform="translate(166 96)">
          <motion.g
            animate={reduce ? {} : { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
            transition={loop(reduce, 2.3)}
            style={{ transformOrigin: "0px 0px" }}
          >
            <rect x="-9" y="-52" width="18" height="104" rx="9" fill="oklch(0.62 0.2 300 / 0.14)" stroke="oklch(0.75 0.18 300)" strokeOpacity="0.7" />
          </motion.g>
          <path d="M0 -16 l12 6 v10 c0 8 -6 13 -12 16 c-6 -3 -12 -8 -12 -16 v-10 z" fill="oklch(0.72 0.19 300 / 0.35)" stroke="oklch(0.85 0.16 300)" strokeOpacity="0.85" />
          <path d="M-5 -2 l4 5 l7 -9" fill="none" stroke="oklch(0.92 0.12 300)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <text x="14" y="26" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.8 0.13 300 / 0.8)">AGENT LOOP</text>
        <text x="306" y="26" textAnchor="end" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.8 0.13 300 / 0.8)">CORRECTED</text>
        <text x="166" y="150" textAnchor="middle" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.85 0.14 300 / 0.85)">INTERCEPT · &lt;5ms</text>
      </svg>
    </div>
  );
}

/* ---------------- Solution 2 — Pre-Execution Cost Predictor ---------------- */
/** Payload weighed on a scale; the price is computed before dispatch and over-budget calls reroute. */
function CostPredictorAnimation({ reduce }: A) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/5 md:h-52">
      <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="A payload weighed on a cost scale before execution, with over-budget calls rerouted">
        {/* incoming payloads */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={i}
            initial={{ x: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { x: [0, 96], opacity: [0, 1, 1, 0] }}
            transition={loop(reduce, 3.6, i * 1.2)}
          >
            <rect x="10" y="70" width="26" height="18" rx="3" fill="oklch(0.55 0.12 165 / 0.5)" stroke="oklch(0.85 0.15 165)" strokeOpacity="0.6" />
            <text x="23" y="82" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.93 0.1 165)">REQ</text>
          </motion.g>
        ))}

        {/* weighing scale */}
        <g transform="translate(150 108)">
          <rect x="-26" y="0" width="52" height="6" rx="3" fill="oklch(0.42 0.05 165)" />
          <rect x="-3" y="-44" width="6" height="44" fill="oklch(0.45 0.06 165)" />
          <motion.g
            animate={reduce ? {} : { rotate: [0, -9, 4, -9, 0] }}
            transition={loop(reduce, 3.6)}
            style={{ transformOrigin: "0px -44px" }}
          >
            <rect x="-48" y="-47" width="96" height="5" rx="2.5" fill="oklch(0.8 0.14 165)" fillOpacity="0.8" />
            <path d="M-44 -42 l-8 18 h32 l-8 -18" fill="oklch(0.6 0.13 165 / 0.25)" stroke="oklch(0.85 0.15 165)" strokeOpacity="0.6" />
            <path d="M44 -42 l8 18 h-32 l8 -18" fill="oklch(0.6 0.13 165 / 0.25)" stroke="oklch(0.85 0.15 165)" strokeOpacity="0.6" />
            <text x="-36" y="-28" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.92 0.11 165)">CTX</text>
            <text x="36" y="-28" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.92 0.11 165)">$</text>
          </motion.g>
        </g>

        {/* projected cost readout */}
        <g transform="translate(236 44)">
          <rect x="0" y="0" width="74" height="42" rx="6" fill="oklch(0.24 0.03 165)" stroke="oklch(0.85 0.15 165)" strokeOpacity="0.5" />
          <text x="8" y="15" fontSize="7" fontFamily="monospace" fill="oklch(0.85 0.12 165 / 0.8)">PROJECTED</text>
          <motion.text
            x="8" y="33" fontSize="15" fontFamily="monospace" fill="oklch(0.88 0.17 165)"
            animate={reduce ? {} : { opacity: [0.45, 1, 0.45] }}
            transition={loop(reduce, 1.8)}
          >
            $0.42
          </motion.text>
        </g>

        {/* budget gate: blocked stamp */}
        <g transform="translate(236 100)">
          <motion.g
            animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0], scale: [0.9, 0.9, 1, 1, 0.9] }}
            transition={loop(reduce, 3.6)}
            style={{ transformOrigin: "37px 16px" }}
          >
            <rect x="0" y="0" width="74" height="32" rx="6" fill="oklch(0.3 0.08 90 / 0.4)" stroke="oklch(0.85 0.16 90)" strokeOpacity="0.7" />
            <text x="37" y="20" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.92 0.14 95)">REROUTED</text>
          </motion.g>
        </g>

        <text x="14" y="26" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.13 165 / 0.8)">BEFORE DISPATCH</text>
        <text x="150" y="150" textAnchor="middle" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.13 165 / 0.8)">RESOURCE WEIGHT MATRIX</text>
      </svg>
    </div>
  );
}

/* ---------------- Solution 3 — Strict Regulatory Policy Layer ---------------- */
/** Tool calls hit a hard policy wall: compliant ones pass, non-compliant ones are stopped dead. */
function PolicyLayerAnimation({ reduce }: A) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-sky-400/25 bg-sky-400/5 md:h-52">
      <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="A policy wall passing compliant calls and blocking non-compliant tool calls">
        {/* policy wall */}
        <g transform="translate(170 0)">
          <rect x="-10" y="18" width="20" height="124" rx="6" fill="oklch(0.6 0.16 240 / 0.15)" stroke="oklch(0.8 0.14 240)" strokeOpacity="0.7" />
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.rect
              key={i}
              x="-10" y={22 + i * 24} width="20" height="18" rx="4"
              fill="oklch(0.72 0.16 240)"
              animate={reduce ? { opacity: 0.35 } : { opacity: [0.15, 0.6, 0.15] }}
              transition={loop(reduce, 2.4, i * 0.22)}
            />
          ))}
        </g>

        {/* compliant call passes */}
        <motion.g
          initial={{ x: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: [0, 262], opacity: [0, 1, 1, 0] }}
          transition={loop(reduce, 4, 0.2)}
        >
          <rect x="14" y="40" width="42" height="18" rx="4" fill="oklch(0.5 0.1 240 / 0.5)" stroke="oklch(0.85 0.13 240)" strokeOpacity="0.65" />
          <text x="35" y="52.5" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.94 0.08 240)">ALLOWED</text>
        </motion.g>

        {/* non-compliant call is stopped at the wall */}
        <motion.g
          initial={{ x: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: [0, 100, 106, 100, 100], opacity: [0, 1, 1, 1, 0] }}
          transition={loop(reduce, 4, 1.2)}
        >
          <rect x="14" y="98" width="46" height="18" rx="4" fill="oklch(0.45 0.14 25 / 0.45)" stroke="oklch(0.8 0.17 25)" strokeOpacity="0.7" />
          <text x="37" y="110.5" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.94 0.09 25)">DELETE *</text>
        </motion.g>
        <motion.g
          transform="translate(148 107)"
          animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 1, 0], scale: [0.6, 0.6, 1.1, 0.8] }}
          transition={loop(reduce, 4, 1.2)}
          style={{ transformOrigin: "0px 0px" }}
        >
          <circle r="13" fill="oklch(0.6 0.22 25)" />
          <rect x="-8" y="-2.6" width="16" height="5.2" rx="1" fill="oklch(0.97 0.01 20)" />
        </motion.g>

        {/* rulebook */}
        <g transform="translate(238 44)">
          <rect x="0" y="0" width="70" height="72" rx="6" fill="oklch(0.24 0.03 240)" stroke="oklch(0.85 0.13 240)" strokeOpacity="0.5" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(10 ${16 + i * 15})`}>
              <motion.path
                d="M0 0 l4 5 l8 -10" fill="none" stroke="oklch(0.85 0.15 240)" strokeWidth="2" strokeLinecap="round"
                animate={reduce ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
                transition={loop(reduce, 2.6, i * 0.3)}
              />
              <rect x="18" y="-4" width="34" height="4" rx="2" fill="oklch(0.5 0.06 240)" />
            </g>
          ))}
        </g>

        <text x="14" y="26" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.12 240 / 0.8)">TOOL CALLS</text>
        <text x="306" y="132" textAnchor="end" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.12 240 / 0.8)">YOUR PLAYBOOK</text>
      </svg>
    </div>
  );
}

/* ---------------- Solution 4 — Self-Updating Playbooks ---------------- */
/** A closed feedback loop: each cycle folds validated outcomes back into the playbook. */
function PlaybookAnimation({ reduce }: A) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/5 md:h-52">
      <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="A feedback loop folding validated outcomes back into the agent playbook">
        {/* loop ring */}
        <g transform="translate(160 84)">
          <circle r="52" fill="none" stroke="oklch(0.75 0.16 320)" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="5 7" />
          <motion.g
            animate={reduce ? {} : { rotate: 360 }}
            transition={reduce ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "0px 0px" }}
          >
            <circle cx="0" cy="-52" r="5" fill="oklch(0.8 0.2 320)" />
            <circle cx="52" cy="0" r="4" fill="oklch(0.8 0.2 320)" fillOpacity="0.7" />
            <circle cx="0" cy="52" r="4" fill="oklch(0.8 0.2 320)" fillOpacity="0.5" />
            <circle cx="-52" cy="0" r="4" fill="oklch(0.8 0.2 320)" fillOpacity="0.35" />
          </motion.g>

          {/* playbook core */}
          <rect x="-34" y="-24" width="68" height="48" rx="6" fill="oklch(0.24 0.04 320)" stroke="oklch(0.82 0.16 320)" strokeOpacity="0.6" />
          <text x="0" y="-6" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.85 0.12 320 / 0.85)">PLAYBOOK</text>
          {[0, 1].map((i) => (
            <motion.rect
              key={i} x={-24} y={2 + i * 9} width="48" height="4" rx="2" fill="oklch(0.78 0.18 320)"
              animate={reduce ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.25], scaleX: [0.7, 1, 0.7] }}
              transition={loop(reduce, 3, i * 0.5)}
              style={{ transformOrigin: "-24px 0px" }}
            />
          ))}
        </g>

        {/* mistake becomes a validated outcome */}
        <motion.g
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
          transition={loop(reduce, 4.2)}
        >
          <g transform="translate(16 40)">
            <circle r="12" cx="12" cy="12" fill="oklch(0.45 0.14 25 / 0.4)" stroke="oklch(0.8 0.17 25)" strokeOpacity="0.7" />
            <path d="M7 7 l10 10 M17 7 l-10 10" stroke="oklch(0.94 0.09 25)" strokeWidth="2" strokeLinecap="round" />
            <text x="32" y="16" fontSize="7" fontFamily="monospace" fill="oklch(0.85 0.1 25 / 0.85)">CYCLE 3 · FAIL</text>
          </g>
        </motion.g>
        <motion.g
          animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }}
          transition={loop(reduce, 4.2)}
        >
          <g transform="translate(212 106)">
            <circle r="12" cx="12" cy="12" fill="oklch(0.5 0.14 150 / 0.35)" stroke="oklch(0.82 0.17 150)" strokeOpacity="0.7" />
            <path d="M6 12 l4 5 l8 -10" fill="none" stroke="oklch(0.93 0.12 150)" strokeWidth="2" strokeLinecap="round" />
            <text x="32" y="16" fontSize="7" fontFamily="monospace" fill="oklch(0.85 0.12 150 / 0.85)">CYCLE 4 · FIXED</text>
          </g>
        </motion.g>

        <text x="14" y="26" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.14 320 / 0.8)">OUTCOME FEEDBACK</text>
        <text x="306" y="26" textAnchor="end" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.82 0.14 320 / 0.8)">NO RETRAINING</text>
      </svg>
    </div>
  );
}

/* ---------------- Solution 5 — 100% Self-Hosted ---------------- */
/** Your server rack inside your network boundary; the cloud is severed outside. */
function SelfHostedAnimation({ reduce }: A) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-amber-400/25 bg-amber-400/5 md:h-52">
      <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="Nebula deployed on your own server rack inside a sealed network boundary">
        {/* network boundary */}
        <motion.rect
          x="24" y="20" width="180" height="120" rx="12"
          fill="none" stroke="oklch(0.85 0.16 90)" strokeWidth="2" strokeDasharray="8 6"
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.35, 0.85, 0.35] }}
          transition={loop(reduce, 3)}
        />
        <text x="114" y="14" textAnchor="middle" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.85 0.14 90 / 0.9)">YOUR NETWORK BOUNDARY</text>

        {/* on-prem rack */}
        <g transform="translate(66 42)">
          <rect x="0" y="0" width="96" height="78" rx="8" fill="oklch(0.26 0.03 90)" stroke="oklch(0.85 0.15 90)" strokeOpacity="0.55" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(10 ${10 + i * 22})`}>
              <rect x="0" y="0" width="76" height="16" rx="3" fill="oklch(0.34 0.05 90 / 0.6)" />
              <motion.circle
                cx="8" cy="8" r="2.5" fill="oklch(0.88 0.2 150)"
                animate={reduce ? { opacity: 1 } : { opacity: [0.3, 1, 0.3] }}
                transition={loop(reduce, 1.4, i * 0.4)}
              />
              <rect x="18" y="6" width="34" height="4" rx="2" fill="oklch(0.55 0.06 90)" />
              <rect x="60" y="6" width="8" height="4" rx="2" fill="oklch(0.8 0.16 90)" fillOpacity="0.7" />
            </g>
          ))}
          <text x="48" y="72" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.88 0.13 90)">NEBULA · ON-PREM</text>
        </g>

        {/* severed cloud */}
        <g transform="translate(248 50)">
          <motion.g
            animate={reduce ? {} : { y: [0, -3, 0] }}
            transition={loop(reduce, 4)}
          >
            <path d="M-24 10 a10 10 0 0 1 4 -19 a12 12 0 0 1 23 -3 a9 9 0 0 1 9 12 a8 8 0 0 1 -6 10 z"
              fill="oklch(0.4 0.02 260 / 0.35)" stroke="oklch(0.6 0.02 260)" strokeOpacity="0.4" strokeDasharray="3 4" />
            <text x="-5" y="4" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.62 0.02 260)">CLOUD</text>
          </motion.g>
          {/* cut wire */}
          <path d="M-14 26 L-40 44" stroke="oklch(0.62 0.02 260)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 4" />
          <motion.g
            transform="translate(-27 35)"
            animate={reduce ? { opacity: 1 } : { opacity: [0.6, 1, 0.6], scale: [0.95, 1.1, 0.95] }}
            transition={loop(reduce, 2)}
            style={{ transformOrigin: "0px 0px" }}
          >
            <path d="M-7 -7 l14 14 M7 -7 l-14 14" stroke="oklch(0.75 0.19 25)" strokeWidth="3" strokeLinecap="round" />
          </motion.g>
          <text x="-5" y="58" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.7 0.06 260)">ZERO BYTES LEAVE</text>
        </g>

        <text x="14" y="150" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.85 0.14 90 / 0.85)">DOCKER · K8S · BARE METAL</text>
        <text x="306" y="150" textAnchor="end" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.85 0.14 90 / 0.85)">NO TELEMETRY</text>
      </svg>
    </div>
  );
}

/* ---------------- Slide shell ---------------- */

type Solution = {
  id: string;
  n: string;
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  stat: string;
  accent: string;
  bar: string;
  badge: string;
  glow: string;
  Anim: (p: A) => ReactNode;
};

const SOLUTIONS: Solution[] = [
  {
    id: "solution-1",
    n: "01",
    eyebrow: "Solution 01 — Mid-Way Trajectory Interception",
    title: (
      <>
        Catch it mid-flight.{" "}
        <span className="text-muted-foreground">Not in the post-mortem.</span>
      </>
    ),
    body: (
      <>
        Nebula monitors every step of an agent's execution loop — tool selections, parameter
        payloads, chain-of-thought decisions — in real time. When a rule is violated or a trajectory
        drifts, Nebula{" "}
        <span className="text-foreground">corrects the agent's course mid-cycle</span>, before the
        action becomes irreversible. Post-hoc tools show you what went wrong after the run
        completed. By then the tokens are burned and the wrong write is committed.
      </>
    ),
    stat: "< 5ms P99 interception latency. Your agents don't feel it.",
    accent: "text-violet-300",
    bar: "bg-violet-400",
    badge: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    glow: "[background:radial-gradient(55%_50%_at_78%_45%,color-mix(in_oklab,oklch(0.72_0.18_300)_14%,transparent),transparent_70%)]",
    Anim: InterceptAnimation,
  },
  {
    id: "solution-2",
    n: "02",
    eyebrow: "Solution 02 — Pre-Execution Cost Predictor",
    title: (
      <>
        Know the cost <span className="text-muted-foreground">before you pay it.</span>
      </>
    ),
    body: (
      <>
        Before any LLM call is dispatched, Nebula's resource weight matrix inspects the full payload
        — context length, tool invocation count, model pricing, retry probability — and calculates
        the <span className="text-foreground">exact projected cost</span> of that step. Over
        threshold? The call is paused, rerouted to a lighter model, or blocked entirely. No tokens
        consumed. No surprise bills.
      </>
    ),
    stat: "3x–5x cost overruns come from uncontrolled recursive loops. Nebula stops them before the first token fires.",
    accent: "text-emerald-300",
    bar: "bg-emerald-400",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    glow: "[background:radial-gradient(55%_50%_at_78%_45%,color-mix(in_oklab,oklch(0.8_0.16_165)_13%,transparent),transparent_70%)]",
    Anim: CostPredictorAnimation,
  },
  {
    id: "solution-3",
    n: "03",
    eyebrow: "Solution 03 — Strict Regulatory Policy Layer",
    title: (
      <>
        Your rules. <span className="text-muted-foreground">Enforced every single run.</span>
      </>
    ),
    body: (
      <>
        You define the operational playbooks — compliance boundaries, action whitelists, formatting
        mandates, workflow constraints. Nebula enforces them as{" "}
        <span className="text-foreground">hard, deterministic execution policies</span> no agent can
        bypass or creatively reinterpret. This isn't prompt-level guidance; it's a policy engine
        that blocks non-compliant tool calls before they fire.
      </>
    ),
    stat: "EU AI Act Article 14 mandates real-time active intervention. Post-hoc logs don't comply.",
    accent: "text-sky-300",
    bar: "bg-sky-400",
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    glow: "[background:radial-gradient(55%_50%_at_78%_45%,color-mix(in_oklab,oklch(0.78_0.14_240)_14%,transparent),transparent_70%)]",
    Anim: PolicyLayerAnimation,
  },
  {
    id: "solution-4",
    n: "04",
    eyebrow: "Solution 04 — Self-Updating Playbooks",
    title: (
      <>
        Your agents stopped{" "}
        <span className="text-muted-foreground">repeating the same mistakes.</span>
      </>
    ),
    body: (
      <>
        Most frameworks run on static playbooks: a mistake in cycle 3 repeats in cycle 4, 5 and 47.
        Nebula folds{" "}
        <span className="text-foreground">validated outcomes back into the playbook</span> after
        each execution cycle. The core structure stays fixed and deterministic; the execution
        strategy evolves on real outcome data — automatically. No prompt hacking. No retraining.
      </>
    ),
    stat: "Continuous feedback loop. Zero human intervention. Agents that get better every cycle.",
    accent: "text-fuchsia-300",
    bar: "bg-fuchsia-400",
    badge: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
    glow: "[background:radial-gradient(55%_50%_at_78%_45%,color-mix(in_oklab,oklch(0.78_0.18_320)_14%,transparent),transparent_70%)]",
    Anim: PlaybookAnimation,
  },
  {
    id: "solution-5",
    n: "05",
    eyebrow: "Solution 05 — 100% Self-Hosted",
    title: (
      <>
        Your infrastructure. Your data.{" "}
        <span className="text-muted-foreground">Zero exceptions.</span>
      </>
    ),
    body: (
      <>
        Nebula deploys directly on your servers — bare metal, Docker, Kubernetes, private VPC. There
        is no cloud component. No telemetry. No "call home."{" "}
        <span className="text-foreground">Zero bytes of your data ever leave your network
        boundary.</span> Every other tool in this space runs on multi-tenant cloud infrastructure —
        Nebula is built from day one for total air-gapped, on-premise deployment.
      </>
    ),
    stat: "Single binary. Docker-native. Deploys on existing Kubernetes infrastructure. Zero additional cloud dependencies.",
    accent: "text-amber-300",
    bar: "bg-amber-400",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    glow: "[background:radial-gradient(55%_50%_at_78%_45%,color-mix(in_oklab,oklch(0.85_0.16_90)_12%,transparent),transparent_70%)]",
    Anim: SelfHostedAnimation,
  },
];

function SolutionSlide({ s, reduce }: { s: Solution; reduce: boolean }) {
  const Anim = s.Anim;
  return (
    <section
      id={s.id}
      className="relative flex min-h-screen items-center overflow-hidden border-t border-border/60 py-12 md:h-screen md:py-0"
    >
      <div className={`pointer-events-none absolute inset-0 opacity-80 ${s.glow}`} />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:px-10">
        <div>
          <motion.p
            className={`font-mono text-xs uppercase tracking-[0.3em] ${s.accent}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            {s.eyebrow}
          </motion.p>
          <motion.h2
            className="mt-3 font-display text-2xl leading-[1.1] tracking-tight sm:text-3xl md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            {s.title}
          </motion.h2>
          <div className={`mt-5 h-0.5 w-12 rounded ${s.bar}`} />
          <motion.p
            className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            {s.body}
          </motion.p>
          <motion.p
            className={`mt-6 inline-block rounded-full border px-4 py-2 font-mono text-xs leading-relaxed ${s.badge}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.24 }}
          >
            {s.stat}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <Anim reduce={reduce} />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Competition — The Status Quo (static, no animation) ---------------- */

const COMPARISON: { cap: string; loggers: string; gateways: string; nebula: string }[] = [
  { cap: "When It Acts", loggers: "After execution ends", gateways: "Before/after API call", nebula: "Mid-execution — real time" },
  { cap: "Cost Control", loggers: "Billing dashboards", gateways: "Rate limiting", nebula: "Pre-execution cost prediction" },
  { cap: "Self-Learning", loggers: "Static", gateways: "None", nebula: "Self-updating playbooks" },
  { cap: "Data Privacy", loggers: "Multi-tenant cloud", gateways: "Multi-tenant cloud", nebula: "100% self-hosted" },
  { cap: "Compliance", loggers: "Audit logs", gateways: "Basic filtering", nebula: "Real-time active intervention" },
  { cap: "Examples", loggers: "LangSmith, Arize, Langfuse", gateways: "Portkey, LiteLLM", nebula: "Project Nebula" },
];

function CompetitionSlide() {
  return (
    <section
      id="competition"
      className="relative flex min-h-screen items-center overflow-hidden border-t border-border/60 py-12 md:h-screen md:py-0"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(55%_50%_at_50%_20%,color-mix(in_oklab,var(--neon)_9%,transparent),transparent_70%)]" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">The Status Quo</p>
        <h2 className="mt-3 max-w-3xl font-display text-2xl leading-[1.1] tracking-tight sm:text-3xl md:text-4xl">
          What exists today —{" "}
          <span className="text-muted-foreground">and why it's not enough.</span>
        </h2>
        <div className="mt-5 h-0.5 w-12 rounded bg-neon" />

        <div className="mt-8 overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/70 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                <th className="px-4 py-3 font-medium">Capability</th>
                <th className="px-4 py-3 font-medium">Post-Hoc Loggers</th>
                <th className="px-4 py-3 font-medium">Passive Gateways</th>
                <th className="px-4 py-3 font-medium text-neon">Nebula</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.cap} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{row.cap}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.loggers}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.gateways}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.nebula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final — Get Early Access ---------------- */
function FinalSlide() {
  useEffect(() => {
    // LinkedIn profile badge script
    const script = document.createElement("script");
    script.src = "https://platform.linkedin.com/badges/js/profile.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <section
      id="contact"
      className="relative flex min-h-screen items-center overflow-hidden border-t border-border/60 py-16 md:h-screen md:py-0"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(55%_50%_at_30%_50%,color-mix(in_oklab,var(--neon)_12%,transparent),transparent_70%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1.2fr_0.8fr] md:px-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Final Boarding Call</p>
          <h2 className="mt-3 font-display text-3xl leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
            Train your agents.
            <br />
            <span className="text-muted-foreground">Not your excuses.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Project Nebula is opening early access to teams running autonomous agents in
            production. Self-hosted, real-time, and built to stop bad runs before they cost you.
          </p>
          <a
            href="https://go.projectnebula.site/form"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-neon px-7 py-3.5 font-display text-sm font-medium tracking-tight text-background transition-transform hover:scale-[1.03]"
          >
            Request Early Access
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Takes less than a minute · Google Form
          </p>
        </div>

        <div className="flex flex-col items-center justify-self-center gap-5">
          <div
            className="badge-base LI-profile-badge"
            data-locale="en_US"
            data-size="large"
            data-theme="dark"
            data-type="HORIZONTAL"
            data-vanity="santhoshkumar-project-nebula"
            data-version="v1"
          >
            <a
              className="badge-base__link LI-simple-link"
              href="https://in.linkedin.com/in/santhoshkumar-project-nebula?trk=profile-badge"
            >
              
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Built by Santhosh Kumar N — say hello on LinkedIn
          </p>
        </div>
      </div>
    </section>
  );
}

export function SolutionSections() {
  const reduce = useReducedMotion() ?? false;
  return (
    <>
      {SOLUTIONS.map((s) => (
        <SolutionSlide key={s.id} s={s} reduce={reduce} />
      ))}
      <CompetitionSlide />
      <FinalSlide />
    </>
  );
}
