import { motion, useReducedMotion } from "motion/react";

type A = { reduce: boolean };
const play = (reduce: boolean) => (reduce ? ("paused" as const) : ("running" as const));

/** Cash burn: banknotes tumble out of a wallet into a burning money pit, meter needle climbing. */
function MoneyFlowAnimation({ reduce }: A) {
  const ps = play(reduce);
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-amber-400/20 bg-amber-400/5 md:h-36">
      <svg viewBox="0 0 260 120" className="h-full w-full" role="img" aria-label="Banknotes flying out of a wallet into a burning money pit">
        {/* wallet */}
        <g>
          <rect x="8" y="52" width="46" height="32" rx="5" fill="oklch(0.32 0.06 60)" stroke="oklch(0.78 0.14 75)" strokeOpacity="0.5" />
          <rect x="8" y="62" width="46" height="22" rx="5" fill="oklch(0.26 0.05 60)" stroke="oklch(0.78 0.14 75)" strokeOpacity="0.45" />
          <circle cx="44" cy="73" r="4" fill="none" stroke="oklch(0.82 0.15 80)" strokeOpacity="0.8" />
          {/* peeking notes */}
          <rect x="16" y="46" width="26" height="12" rx="2" fill="oklch(0.72 0.13 145 / 0.35)" stroke="oklch(0.82 0.15 80)" strokeOpacity="0.5" />
        </g>

        {/* flying banknotes */}
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            className="bill-fly"
            style={{ animationDelay: `${[0, 0.8, 1.6, 2.3][i]}s`, animationDuration: `${[3, 3.4, 2.8, 3.7][i]}s`, animationPlayState: ps }}
          >
            <rect x="0" y="0" width="30" height="16" rx="2.5" fill="oklch(0.55 0.09 150)" stroke="oklch(0.85 0.14 85)" strokeOpacity="0.75" />
            <rect x="3" y="3" width="24" height="10" rx="1.5" fill="none" stroke="oklch(0.9 0.12 90)" strokeOpacity="0.35" strokeDasharray="2 2" />
            <ellipse cx="15" cy="8" rx="5" ry="6" fill="oklch(0.9 0.13 90 / 0.25)" />
            <text x="15" y="11.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="oklch(0.95 0.11 95)">$</text>
          </g>
        ))}

        {/* money pit + flames */}
        <g>
          <path d="M196 92 L246 92 L240 74 L202 74 Z" fill="oklch(0.24 0.03 60)" stroke="oklch(0.8 0.14 75)" strokeOpacity="0.45" />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="flame-lick"
              style={{ animationDelay: `${i * 0.28}s`, animationDuration: `${1.1 + i * 0.22}s`, animationPlayState: ps }}
              d={`M${208 + i * 13} 76 c-5 -8 3 -11 1 -18 c7 4 10 10 9 15 c3 -2 3 -6 2 -9 c5 5 6 10 4 14 z`}
              fill={["oklch(0.82 0.19 60)", "oklch(0.88 0.2 80)", "oklch(0.75 0.2 40)"][i]}
              fillOpacity="0.85"
            />
          ))}
          {/* spend meter */}
          <g transform="translate(221 60)">
            <path d="M-22 0 A22 22 0 0 1 22 0" fill="none" stroke="oklch(0.8 0.14 75)" strokeOpacity="0.35" strokeWidth="2" />
            <line className="meter-climb" style={{ animationPlayState: ps }} x1="0" y1="0" x2="0" y2="-18" stroke="oklch(0.85 0.18 70)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.6" fill="oklch(0.85 0.18 70)" />
          </g>
        </g>

        <text x="10" y="18" fontSize="8" letterSpacing="1.6" fill="oklch(0.85 0.13 80 / 0.75)" fontFamily="monospace">TOKENS BURNED</text>
        <text x="250" y="112" textAnchor="end" fontSize="8" letterSpacing="1.6" fill="oklch(0.85 0.13 80 / 0.75)" fontFamily="monospace">INVOICE</text>
      </svg>
    </div>
  );
}

/** Data leak: your laptop wired into third-party server racks that fill up with your data. */
function DataLeakAnimation({ reduce }: A) {
  const ps = play(reduce);
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/5 md:h-36">
      <svg viewBox="0 0 260 120" className="h-full w-full" role="img" aria-label="A laptop sending data over a cable into third-party server racks">
        {/* laptop */}
        <g>
          <rect x="10" y="46" width="46" height="30" rx="3" fill="oklch(0.26 0.03 220)" stroke="oklch(0.85 0.12 210)" strokeOpacity="0.5" />
          <rect x="14" y="50" width="38" height="22" rx="2" fill="oklch(0.35 0.07 210 / 0.5)" />
          <path d="M4 78 L62 78 L58 84 L8 84 Z" fill="oklch(0.3 0.03 220)" stroke="oklch(0.85 0.12 210)" strokeOpacity="0.45" />
          <text x="33" y="65" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.9 0.1 205)">YOUR DATA</text>
        </g>

        {/* cable */}
        <path d="M62 66 C110 54, 150 78, 196 66" fill="none" stroke="oklch(0.8 0.12 210)" strokeOpacity="0.35" strokeWidth="2" />

        {/* data blobs on the wire */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="wire-data" style={{ animationDelay: `${[0, 0.6, 1.3, 1.9][i]}s`, animationDuration: `${[2.6, 2.3, 2.9, 2.5][i]}s`, animationPlayState: ps }}>
            <rect x="0" y="-4" width="9" height="8" rx="1.5" fill="oklch(0.85 0.14 205)" />
            <rect x="2" y="-2" width="5" height="1" fill="oklch(0.25 0.03 220)" />
            <rect x="2" y="0.5" width="5" height="1" fill="oklch(0.25 0.03 220)" />
          </g>
        ))}

        {/* third-party racks */}
        <g transform="translate(196 26)">
          <rect x="0" y="0" width="52" height="72" rx="4" fill="oklch(0.22 0.02 220)" stroke="oklch(0.85 0.12 210)" strokeOpacity="0.5" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(5 ${6 + i * 17})`}>
              <rect x="0" y="0" width="42" height="13" rx="2" fill="oklch(0.3 0.03 220)" stroke="oklch(0.85 0.12 210)" strokeOpacity="0.28" />
              <circle className="led-blink" style={{ animationDelay: `${i * 0.37}s`, animationPlayState: ps }} cx="6" cy="6.5" r="2" fill="oklch(0.85 0.16 200)" />
              <circle className="led-blink" style={{ animationDelay: `${0.2 + i * 0.29}s`, animationPlayState: ps }} cx="13" cy="6.5" r="2" fill="oklch(0.86 0.17 145)" />
              <rect x="20" y="4.5" width="18" height="4" rx="2" fill="oklch(0.4 0.03 220)" />
              <rect className="disk-fill" style={{ animationDelay: `${i * 0.5}s`, animationPlayState: ps }} x="20" y="4.5" width="18" height="4" rx="2" fill="oklch(0.85 0.14 205)" />
            </g>
          ))}
        </g>
        <text x="248" y="112" textAnchor="end" fontSize="7" letterSpacing="1" fontFamily="monospace" fill="oklch(0.85 0.12 205 / 0.75)">3RD-PARTY SERVERS</text>
        <text x="10" y="18" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.85 0.12 205 / 0.75)">LEAVING THE BUILDING</text>
      </svg>
    </div>
  );
}

/** No enforcement: a road-side "no entry" traffic sign while agent trucks drive straight past it. */
function NoPolicyAnimation({ reduce }: A) {
  const ps = play(reduce);
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/5 md:h-36">
      <svg viewBox="0 0 260 120" className="h-full w-full" role="img" aria-label="Trucks driving past a no-entry traffic sign that nothing enforces">
        {/* road */}
        <rect x="0" y="78" width="260" height="26" fill="oklch(0.22 0.01 20)" />
        <line className="road-scroll" style={{ animationPlayState: ps }} x1="0" y1="91" x2="260" y2="91" stroke="oklch(0.75 0.05 60)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="14 14" />

        {/* traffic sign on a pole */}
        <g transform="translate(56 78)">
          <rect x="-2" y="-34" width="4" height="34" fill="oklch(0.55 0.02 20)" />
          <g className="sign-sway" style={{ animationPlayState: ps, transformOrigin: "0px 0px" }}>
            <g className="sign-flash" style={{ animationPlayState: ps }} transform="translate(0 -52)">
              <circle r="19" fill="oklch(0.62 0.23 25)" />
              <circle r="19" fill="none" stroke="oklch(0.35 0.14 25)" strokeWidth="2" />
              <circle r="13" fill="oklch(0.97 0.01 20)" />
              <rect x="-13.5" y="-3.2" width="27" height="6.4" rx="1" fill="oklch(0.62 0.23 25)" transform="rotate(-45)" />
            </g>
          </g>
        </g>

        {/* trucks driving straight through */}
        {[0, 1].map((i) => (
          <g key={i} className="truck-drive" style={{ animationDelay: `${i * 2.1}s`, animationDuration: `${[4.4, 5.2][i]}s`, animationPlayState: ps }} transform={`translate(0 ${i === 0 ? 0 : -6})`}>
            <g transform="translate(0 60)">
              <rect x="0" y="0" width="34" height="20" rx="2.5" fill="oklch(0.4 0.09 25)" stroke="oklch(0.8 0.15 25)" strokeOpacity="0.6" />
              <text x="17" y="13.5" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="oklch(0.94 0.06 25)">{["WRITE DB", "EXFIL"][i]}</text>
              <path d="M34 6 L46 6 L52 13 L52 20 L34 20 Z" fill="oklch(0.33 0.07 25)" stroke="oklch(0.8 0.15 25)" strokeOpacity="0.6" />
              <rect x="37" y="8.5" width="8" height="6" rx="1" fill="oklch(0.8 0.13 210 / 0.6)" />
              <circle className="wheel-spin" style={{ animationPlayState: ps }} cx="9" cy="21" r="4.4" fill="oklch(0.2 0.01 20)" stroke="oklch(0.72 0.03 60)" strokeWidth="1.4" strokeDasharray="2 3" />
              <circle className="wheel-spin" style={{ animationPlayState: ps }} cx="44" cy="21" r="4.4" fill="oklch(0.2 0.01 20)" stroke="oklch(0.72 0.03 60)" strokeWidth="1.4" strokeDasharray="2 3" />
            </g>
          </g>
        ))}

        <text x="250" y="18" textAnchor="end" fontSize="8" letterSpacing="1.6" fontFamily="monospace" fill="oklch(0.78 0.16 25 / 0.8)">POLICY: NOT ENFORCED</text>
      </svg>
    </div>
  );
}

/* ---------------- Section ---------------- */

const PROBLEMS = [
  {
    n: "01",
    title: "Unpredictable Costs",
    accent: "text-amber-300",
    bar: "bg-amber-400",
    body: (
      <>
        Recursive agent loops burn <span className="text-foreground">3x–5x more tokens</span> than
        estimated — and you only find out when the invoice arrives.{" "}
        <span className="text-foreground">82% of agent builders</span> say cost predictability is
        the #1 blocker to scaling.
      </>
    ),
    Anim: MoneyFlowAnimation,
  },
  {
    n: "02",
    title: "Zero Policy Enforcement",
    accent: "text-rose-400",
    bar: "bg-rose-500",
    body: (
      <>
        Same prompt, same context —{" "}
        <span className="text-foreground">different execution path every time</span>. Agents ignore
        company rules, compliance boundaries, and deterministic workflows mid-run because nothing
        enforces them during the loop.
      </>
    ),
    Anim: NoPolicyAnimation,
  },
  {
    n: "03",
    title: "Data Leaves the Building",
    accent: "text-cyan-300",
    bar: "bg-cyan-400",
    body: (
      <>
        Every cloud API call transmits your{" "}
        <span className="text-foreground">
          proprietary code, customer data, and internal docs
        </span>{" "}
        to servers you don't control. Enterprise migration to self-hosted open-weight models grew{" "}
        <span className="text-foreground">4x in 2025–2026</span> for exactly this reason.
      </>
    ),
    Anim: DataLeakAnimation,
  },
];

export function ProblemSection() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section id="problem" className="relative flex min-h-screen items-center overflow-hidden border-t border-border/60 py-12 md:h-screen md:py-0">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          The Industry Gap
        </motion.p>
        <motion.h2
          className="mt-2 font-display text-2xl tracking-tight sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          The agents are running.{" "}
          <span className="text-muted-foreground">Nobody's watching.</span>
        </motion.h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <motion.article
              key={p.n}
              className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-5 md:p-6"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.12 * i }}
            >
              <div className="flex items-baseline gap-3">
                <span className={`font-mono text-sm ${p.accent}`}>{p.n}</span>
                <h3 className="font-display text-xl tracking-tight">{p.title}</h3>
              </div>
              <div className={`mt-3 h-0.5 w-10 rounded ${p.bar}`} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-6">
                <p.Anim reduce={reduce} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
