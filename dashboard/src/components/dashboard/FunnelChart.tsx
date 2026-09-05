import { Panel, Chip, nf, pct } from "./primitives";
import type { FunnelStage } from "@/data/funnel-data";

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.count ?? 1;

  return (
    <Panel className="p-6">
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const width = (stage.count / max) * 100;
          const prev = stages[i - 1];
          const lost = prev ? prev.count - stage.count : 0;
          const t = stages.length > 1 ? i / (stages.length - 1) : 0;

          return (
            <div key={stage.stageId}>
              {prev ? (
                <div className="flex items-center gap-2 py-2 pl-1">
                  <span className="text-xs text-muted-foreground">↓</span>
                  <Chip tone="danger">
                    −{nf.format(lost)} lost · {pct(stage.dropOffRate, 2)}
                  </Chip>
                  <Chip tone="success">{pct(stage.conversionFromPrevious, 2)} continued</Chip>
                </div>
              ) : null}

              <div className="group relative lg:pr-32">
                <div
                  className="relative flex min-h-[74px] items-center overflow-hidden rounded-lg px-5 py-4 transition-all duration-500"
                  style={{
                    width: `${Math.max(Math.pow(stage.count / max, 0.48) * 100, 10)}%`,
                    background: `linear-gradient(90deg, color-mix(in oklab, var(--brand) ${100 - t * 100}%, var(--brand-alt)) 0%, color-mix(in oklab, var(--brand) ${Math.max(0, 85 - t * 100)}%, var(--brand-alt)) 100%)`,
                  }}
                >
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-white/95">
                      {stage.stageId}. {stage.name}
                    </p>
                    <p className="truncate text-[11px] text-white/75">{stage.badge}</p>
                  </div>
                  <p className="ml-auto pl-4 font-display text-2xl font-semibold tabular-nums text-white">
                    {nf.format(stage.count)}
                  </p>
                </div>
                <p className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-xs tabular-nums text-muted-foreground lg:block">
                  {pct((stage.count / max) * 100)} of arrivals
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
