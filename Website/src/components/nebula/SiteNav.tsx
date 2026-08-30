import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Industry Gap", target: "problem", group: ["problem"] },
  { label: "Solution", target: "solution-1", group: ["solution-1", "solution-2", "solution-3", "solution-4", "solution-5"] },
  { label: "Where Nebula Stands", target: "competition", group: ["competition"] },
];

// All section ids that participate in the slide sequence — used for scroll-spy.
const SLIDE_IDS = [
  "problem",
  "solution-1",
  "solution-2",
  "solution-3",
  "solution-4",
  "solution-5",
  "competition",
  "contact",
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function SiteNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const detect = () => {
      const mid = window.innerHeight / 2;
      let best: string | null = null;
      let bestDist = Infinity;
      for (const id of SLIDE_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // distance from section vertical center to viewport center
        const center = rect.top + rect.height / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = id;
        }
      }
      // Only highlight when scrolled past the hero.
      setActiveId(window.scrollY > window.innerHeight * 0.4 ? best : null);
    };
    detect();
    window.addEventListener("scroll", detect, { passive: true });
    window.addEventListener("resize", detect);
    return () => {
      window.removeEventListener("scroll", detect);
      window.removeEventListener("resize", detect);
    };
  }, []);

  const isActive = (group: string[]) => activeId != null && group.includes(activeId);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 md:px-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer font-display text-sm tracking-[0.25em] uppercase text-foreground"
        >
          Nebula
        </button>

        <div className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.target}
              onClick={() => scrollToId(l.target)}
              className={
                "cursor-pointer font-display text-sm tracking-tight transition-colors hover:text-foreground " +
                (isActive(l.group)
                  ? "font-semibold text-foreground"
                  : "font-normal text-muted-foreground")
              }
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollToId("contact")}
          className={
            "cursor-pointer rounded-full border px-4 py-1.5 font-display text-sm tracking-tight transition-colors " +
            (activeId === "contact"
              ? "border-neon bg-neon/15 text-neon font-semibold"
              : "border-neon/50 text-neon hover:bg-neon/10")
          }
        >
          Early Access
        </button>
      </nav>
    </header>
  );
}
