import { Panel, Chip, nf, pct } from "./primitives";
import { cn } from "@/lib/utils";
import type { SlideRetention as Slide } from "@/data/funnel-data";

export function SlideRetentionHeatmap({ slides }: { slides: Slide[] }) {
  const max = slides[0]?.retainedCount ?? 1;
  const worst = slides.reduce<Slide | undefined>(
    (a, b) => (!a || b.dropPercent > a.dropPercent ? b : a),
    undefined,
  );

  return (
    <Panel className="p-6">
      <div className="space-y-3">
        {slides.map((s) => {
          const reach = (s.retainedCount / max) * 100;
          const isWorst = s.slideId === worst?.slideId && s.dropPercent > 0;
          return (
            <div
              key={s.slideId}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2.5 transition-colors",
                isWorst ? "border-danger/25 bg-danger-soft" : "hover:bg-surface-muted",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">
                    {s.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">#{s.slideId}</span>
                  {isWorst ? <Chip tone="danger">Biggest single drop</Chip> : null}
                </div>
                <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                  <span className="text-foreground">{nf.format(s.retainedCount)} humans</span>
                  <span>·</span>
                  <span>{nf.format(s.botRetainedCount)} bots</span>
                  <span>·</span>
                  <span>{pct(reach)} reach</span>
                  <span>·</span>
                  <span>{s.avgTimeSeconds.toFixed(1)}s avg</span>
                </div>

              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${reach}%`,
                    background: isWorst
                      ? "var(--danger)"
                      : `linear-gradient(90deg, var(--brand), color-mix(in oklab, var(--brand) ${reach}%, var(--brand-alt)))`,
                  }}
                />
              </div>
              {s.dropPercent > 0 ? (
                <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
                  {pct(s.dropPercent)} dropped versus previous slide
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-muted-foreground">Entry slide</p>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
