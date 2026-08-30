import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { DottedGlobe } from "@/components/nebula/DottedGlobe";
import { ProblemSection } from "@/components/nebula/ProblemSection";
import { SiteNav } from "@/components/nebula/SiteNav";
import { SolutionSections } from "@/components/nebula/SolutionSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Nebula — Real-Time AI Agent Interception & Pre-Execution Cost Control" },
      {
        name: "description",
        content:
          "The Cloudflare for AI Agents. Real-time trajectory interception, pre-execution token cost control, and deterministic compliance policies. 100% self-hosted.",
      },
      {
        name: "keywords",
        content:
          "AI agents, agent governance, LLM security, AI cost control, EU AI Act Article 14, agent interception, self-hosted AI gateway, Cloudflare for AI agents, LangGraph, CrewAI",
      },
      { property: "og:title", content: "Project Nebula — The Cloudflare for AI Agents" },
      {
        property: "og:description",
        content:
          "Real-time AI agent interception and pre-execution cost control. 100% self-hosted governance for autonomous agents.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://projectnebula.site" },
      { property: "og:site_name", content: "Project Nebula" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Project Nebula — The Cloudflare for AI Agents",
      },
      {
        name: "twitter:description",
        content:
          "Intercept agent trajectories mid-flight, predict cost before execution, enforce policy every run. Fully self-hosted.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://projectnebula.site" },
    ],
  }),
  component: HeroPage,
});

function HeroPage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"center" | "move" | "done">(reduce ? "done" : "center");
  const [target, setTarget] = useState({ x: 0, y: 0, scale: 1 });
  const labelHomeRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const measure = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const measure = () => {
      const label = labelHomeRef.current;
      const introEl = introTextRef.current;
      if (label && introEl) {
        const lr = label.getBoundingClientRect();
        const ir = introEl.getBoundingClientRect();
        setTarget({
          x: lr.left + lr.width / 2 - (ir.left + ir.width / 2),
          y: lr.top + lr.height / 2 - (ir.top + ir.height / 2),
          scale: Math.max(lr.width / Math.max(ir.width, 1), 0.05),
        });
      }
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    const t1 = setTimeout(() => setPhase("move"), 1500);
    const t2 = setTimeout(() => setPhase("done"), 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce]);

  const isMobile = dims.w < 768;

  // Globe travel: from its resting spot (right side, above the label) to viewport center.
  // Slide-style: wheel/touch gestures drive the globe expansion FIRST; only once the
  // globe has fully expanded (progress = 1) does the page advance to the next slide.
  const [globeTarget, setGlobeTarget] = useState({ x: 0, y: 0 });
  const p = useMotionValue(0);
  const targetRef = useRef(0);
  const visitedRef = useRef(false);
  const finishingRef = useRef(false);
  const snappingRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const el = document.getElementById("globe-home");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setGlobeTarget({
        x: dims.w / 2 - (rect.left + rect.width / 2),
        y: dims.h / 2 - (rect.top + rect.height / 2),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [dims]);

  const goToProblem = () => {
    visitedRef.current = true;
    finishingRef.current = false;
    document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" });
  };

  // Drives the globe expansion. When it completes, the slide change fires only
  // after the expansion has visually finished (onComplete), so even a fast
  // scroll flick always shows the globe growing before page 2 appears.
  // Slow ease-out so the sphere visibly expands before fading + advancing.
  const FORWARD_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const driveGlobe = (delta: number) => {
    const next = Math.min(1, Math.max(0, targetRef.current + delta));
    targetRef.current = next;
    if (next >= 1 && !finishingRef.current) {
      finishingRef.current = true;
      animate(p, 1, {
        duration: 1.5,
        ease: FORWARD_EASE,
        onComplete: goToProblem,
      });
    } else {
      animate(p, next, { duration: 1.2, ease: FORWARD_EASE });
    }
    return next;
  };

  useEffect(() => {
    const SLIDES = ["problem", "solution-1", "solution-2", "solution-3", "solution-4", "solution-5", "competition", "contact"];

    // Returns the scroll offsets of every slide, hero (0) included.
    const offsets = () => [
      0,
      ...SLIDES.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN;
      }).filter((v) => !Number.isNaN(v)),
    ];

    const currentIndex = () => {
      const tops = offsets();
      let best = 0;
      let bestDist = Infinity;
      tops.forEach((t, i) => {
        const d = Math.abs(t - window.scrollY);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    // One gesture = exactly one slide, in either direction.
    const snap = (dir: 1 | -1) => {
      if (snappingRef.current) return true;
      const tops = offsets();
      const next = Math.min(tops.length - 1, Math.max(0, currentIndex() + dir));
      snappingRef.current = true;
      window.scrollTo({ top: tops[next] ?? 0, behavior: "smooth" });
      setTimeout(() => (snappingRef.current = false), 900);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 2) {
        e.preventDefault();
        snap(e.deltaY > 0 ? 1 : -1);
        return;
      }
      if (finishingRef.current) {
        e.preventDefault();
        return;
      }
      if (e.deltaY > 0) {
        if (targetRef.current < 1) {
          e.preventDefault();
          // A single downward scroll commits to the full transition:
          // globe expands + fades, then page 2 slides in automatically.
          driveGlobe(1);
        }
      } else if (targetRef.current > 0) {
        e.preventDefault();
        driveGlobe(e.deltaY * 0.0012);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchYRef.current === null) return;
      if (window.scrollY > 2) {
        const dy = touchYRef.current - (e.touches[0]?.clientY ?? touchYRef.current);
        if (Math.abs(dy) > 4) {
          e.preventDefault();
          snap(dy > 0 ? 1 : -1);
        }
        return;
      }
      const y = e.touches[0]?.clientY ?? touchYRef.current;
      const delta = touchYRef.current - y;
      touchYRef.current = y;
      if (finishingRef.current) {
        e.preventDefault();
        return;
      }
      if (delta > 0 && targetRef.current < 1) {
        e.preventDefault();
        driveGlobe(1);
      } else if (delta < 0 && targetRef.current > 0) {
        e.preventDefault();
        driveGlobe(delta * 0.005);
      }
    };


    // When the user scrolls back up to the hero from page 2, play the reverse:
    // the sphere fades back in and shrinks to its resting spot. Same gesture
    // economy as the forward slide — one upward scroll commits to the reverse.
    const onScroll = () => {
      if (window.scrollY <= 2 && visitedRef.current) {
        visitedRef.current = false;
        targetRef.current = 0;
        finishingRef.current = false;
        animate(p, 0, { duration: 1.6, ease: [0.7, 0, 0.84, 0] });
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  const gx = useTransform(p, [0, 0.4, 0.8, 1], [0, globeTarget.x * 0.55, globeTarget.x * 0.92, globeTarget.x]);
  const gy = useTransform(p, [0, 0.4, 0.8, 1], [0, globeTarget.y * 0.9, globeTarget.y * 1.02, globeTarget.y]);
  const gScale = useTransform(p, [0, 1], [1, isMobile ? 6 : 9]);
  const gOpacity = useTransform(p, [0, 0.78, 0.99], [1, 1, 0]);

  const copyDelay = phase === "done" ? 0 : 2.6;

  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      {/* Intro: welcome text centered, then glides onto the persistent label */}
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "move" ? 0 : 1 }}
          transition={{ duration: 0.6, delay: phase === "move" ? 1.15 : 0, ease: "easeInOut" }}
        >
          <motion.div
            ref={introTextRef}
            className="whitespace-nowrap px-6 text-center font-display text-3xl tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
            animate={
              phase === "center"
                ? { opacity: 1, x: 0, y: 0, scale: 1 }
                : { opacity: 1, x: target.x, y: target.y, scale: target.scale }
            }
            transition={
              phase === "center"
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 1.15, ease: [0.76, 0, 0.24, 1] }
            }
          >
            Welcome to the world of <span className="text-accent">Agents</span>
          </motion.div>
        </motion.div>
      )}

      <div className="relative h-screen">
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden pt-16">
          {/* ambient glow */}
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(60%_50%_at_72%_50%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_70%)]" />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-[1.15fr_0.85fr] md:gap-0 md:px-10">
            {/* hero copy — left */}
            <div>
              <p className="relative z-20 mt-4 font-display text-xl font-medium tracking-tight text-neon sm:text-2xl md:text-3xl [text-shadow:0_0_24px_color-mix(in_oklab,var(--neon)_45%,transparent)]">
                Hello from Project Nebula
              </p>

              <motion.h1
                className="mt-5 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: copyDelay + 0.12 }}
              >
                If your models can be trained,
                <br />
                <span className="text-muted-foreground">why not your </span>
                <span className="text-accent">agents</span>
              </motion.h1>

              <motion.p
                className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: copyDelay + 0.24 }}
              >
                Real-Time AI Agent Interception &amp; Pre-Execution Cost Control.
                <span className="text-foreground"> 100% Self-Hosted.</span>
              </motion.p>

              <motion.button
                type="button"
                onClick={() => {
                  targetRef.current = 1;
                  finishingRef.current = true;
                  animate(p, 1, {
                    duration: 1.5,
                    ease: [0.16, 1, 0.3, 1],
                    onComplete: goToProblem,
                  });
                }}
                className="group mt-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-border px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: copyDelay + 0.36 }}
              >
                <span>Scroll</span>
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                >
                  ↓
                </motion.span>
              </motion.button>
            </div>

            {/* globe — right; label centered on the globe's vertical axis, slightly below it */}
            <motion.div
              className="relative flex flex-col items-center justify-self-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: copyDelay - 0.2 < 0 ? 0 : copyDelay - 0.2 }}
            >
              <motion.div id="globe-home" style={{ x: gx, y: gy, scale: gScale, opacity: gOpacity }}>
                <DottedGlobe size={isMobile ? 180 : 280} />
              </motion.div>
              <div
                ref={labelHomeRef}
                className="mt-6 whitespace-nowrap text-center font-display text-sm tracking-tight text-muted-foreground sm:text-base"
              >
                Welcome to the world of <span className="text-accent">Agents</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ProblemSection />
      <SolutionSections />
    </main>
  );
}
