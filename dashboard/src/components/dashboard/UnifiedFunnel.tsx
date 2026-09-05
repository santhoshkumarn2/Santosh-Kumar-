import { Panel, Chip, nf, pct } from "./primitives";
import type { UnifiedStage } from "@/data/funnel-data";

export function UnifiedFunnel({ stages }: { stages: UnifiedStage[] }) {
  const first = stages[0];
  const max = (first?.human ?? 0) + (first?.bot ?? 0) || 1;

  return (
    <Panel className="p-6">
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-2 text-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Human traffic
        </span>
        <span className="flex items-center gap-2 text-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Bot traffic
        </span>
        <span className="ml-auto text-muted-foreground">
          Widths are share of stage 1 total ({nf.format(max)} sessions)
        </span>
      </div>

      <div className="space-y-2">
        {stages.map((stage, i) => {
          const total = stage.human + stage.bot;
          const prev = stages[i - 1];
          const prevTotal = prev ? prev.human + prev.bot : 0;
          const width = Math.max(Math.pow(total / max, 0.48) * 100, 8);
          const humanShare = total ? (stage.human / total) * 100 : 0;

          return (
            <div key={stage.stageId}>
              {prev ? (
                <div className="flex flex-wrap items-center gap-2 py-2 pl-1">
                  <span className="text-xs text-muted-foreground">↓</span>
                  <Chip tone="danger">
                    −{nf.format(prevTotal - total)} lost ·{" "}
                    {pct(((prevTotal - total) / (prevTotal || 1)) * 100, 1)}
                  </Chip>
                  <Chip tone="brand">
                    humans {pct((stage.human / (prev.human || 1)) * 100, 1)} continued
                  </Chip>
                  <Chip tone="warning">
                    bots {pct((stage.bot / (prev.bot || 1)) * 100, 1)} continued
                  </Chip>
                </div>
              ) : null}

              <div className="relative lg:pr-40">
                <div
                  className="flex min-h-[78px] overflow-hidden rounded-lg transition-all duration-500"
                  style={{ width: `${width}%` }}
                >
                  <div
                    className="flex min-w-0 flex-col justify-center bg-brand px-5 py-4"
                    style={{ width: `${humanShare}%` }}
                  >
                    <p className="font-display text-sm font-semibold text-white/95">
                      {stage.stageId}. {stage.name}
                    </p>
                    <p className="truncate text-[11px] text-white/75">{stage.badge}</p>
                    <p className="mt-1 font-display text-xl font-semibold tabular-nums text-white">
                      {nf.format(stage.human)}
                    </p>
                  </div>
                  <div
                    className="flex flex-col items-end justify-center bg-warning px-4 py-4"
                    style={{ width: `${100 - humanShare}%` }}
                  >
                    <p className="text-[11px] font-medium text-white/85">Bots</p>
                    <p className="font-display text-lg font-semibold tabular-nums text-white">
                      {nf.format(stage.bot)}
                    </p>
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-right text-xs tabular-nums text-muted-foreground lg:block">
                  <p className="text-foreground">{nf.format(total)} total</p>
                  <p>{pct((total / max) * 100, 1)} of arrivals</p>
                  <p>{pct(100 - humanShare, 1)} automated</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
