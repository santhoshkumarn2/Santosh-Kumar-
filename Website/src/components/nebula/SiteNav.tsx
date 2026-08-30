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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const detect = () => {
      const mid = window.innerHeight / 2;
      let best: string | null = null;
      let bestDist = Infinity;
      for (const id of SLIDE_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // distance from the visible part of the section to the viewport center
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, window.innerHeight);
        const center = bottom > top ? (top + bottom) / 2 : rect.top + rect.height / 2;
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

  const go = (id: string) => {
    setOpen(false);
    // let the menu close before scrolling
    setTimeout(() => scrollToId(id), 60);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 sm:flex sm:justify-between md:px-10">
        <button
          onClick={() => {
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="cursor-pointer truncate text-left font-display text-sm tracking-[0.25em] uppercase text-foreground"
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
            "hidden cursor-pointer rounded-full border px-4 py-1.5 font-display text-sm tracking-tight transition-colors sm:inline-block " +
            (activeId === "contact"
              ? "border-neon bg-neon/15 text-neon font-semibold"
              : "border-neon/50 text-neon hover:bg-neon/10")
          }
        >
          Early Access
        </button>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-border/70 sm:hidden"
        >
          <span
            className={
              "h-px w-5 bg-foreground transition-transform " + (open ? "translate-y-[3.5px] rotate-45" : "")
            }
          />
          <span
            className={
              "h-px w-5 bg-foreground transition-transform " + (open ? "-translate-y-[3.5px] -rotate-45" : "")
            }
          />
        </button>
      </nav>

      {/* mobile menu */}
      <div
        className={
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-[max-height,opacity] duration-300 sm:hidden " +
          (open ? "max-h-80 opacity-100" : "max-h-0 opacity-0")
        }
      >
        <div className="flex flex-col px-6 py-2">
          {NAV_LINKS.map((l) => (
            <button
              key={l.target}
              onClick={() => go(l.target)}
              className={
                "cursor-pointer py-3 text-left font-display text-base tracking-tight transition-colors " +
                (isActive(l.group)
                  ? "font-semibold text-foreground"
                  : "font-normal text-muted-foreground")
              }
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => go("contact")}
            className={
              "my-3 cursor-pointer rounded-full border px-4 py-2 font-display text-base tracking-tight transition-colors " +
              (activeId === "contact"
                ? "border-neon bg-neon/15 text-neon font-semibold"
                : "border-neon/50 text-neon")
            }
          >
            Early Access
          </button>
        </div>
      </div>
    </header>
  );
}

