import { useState } from "react";
import { Panel, Chip, Bar, nf, pct } from "./primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FunnelData } from "@/data/funnel-data";

type Diag = FunnelData["dropOffDiagnostics"];

export function DropOffDiagnostics({
  stages,
  diagnostics,
}: {
  stages: FunnelData["funnelStages"];
  diagnostics: Diag;
}) {
  const transitions = stages.slice(1).flatMap((s, i) => {
    const from = stages[i];
    if (!from) return [];
    return [
      {
        id: `${from.stageId}-${s.stageId}`,
        label: `Stage ${from.stageId}→${s.stageId}`,
        from,
        to: s,
      },
    ];
  });
  const [active, setActive] = useState(transitions[0]?.id ?? "");
  const current = transitions.find((t) => t.id === active) ?? transitions[0];

  const maxDevice = Math.max(...diagnostics.byDevice.map((d) => d.arrivals));
  const maxRef = Math.max(...diagnostics.byReferrer.map((d) => d.clicks));
  const maxCountry = Math.max(...diagnostics.byTopCountries.map((d) => d.visits));

  return (
    <div className="space-y-4">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="bg-surface-muted">
          {transitions.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {current && current.from ? (
        <Panel className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Transition
            </p>
            <p className="font-display text-sm font-semibold text-foreground">
              {current.from.name} → {current.to.name}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Lost</p>
            <p className="font-display text-lg font-semibold tabular-nums text-danger">
              {nf.format(current.from.count - current.to.count)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Drop-off
            </p>
            <p className="font-display text-lg font-semibold tabular-nums text-foreground">
              {pct(current.to.dropOffRate, 2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Continued
            </p>
            <p className="font-display text-lg font-semibold tabular-nums text-brand-alt">
              {pct(current.to.conversionFromPrevious, 2)}
            </p>
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHead title="By Device" hint="Arrivals → deep reads → conversions" />
          <div className="space-y-4">
            {diagnostics.byDevice.map((d) => (
              <div key={d.device} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{d.device}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {nf.format(d.arrivals)} arrivals
                  </span>
                </div>
                <Bar value={(d.arrivals / maxDevice) * 100} />
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{nf.format(d.deepReads)} deep reads</Chip>
                  <Chip tone="success">{nf.format(d.conversions)} converted</Chip>
                  <Chip tone={d.conversionRate >= 3 ? "brand" : "warning"}>
                    {pct(d.conversionRate, 2)} CVR
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead title="By Referrer Channel" hint="Inbound clicks vs. landed visits" />
          <div className="space-y-4">
            {diagnostics.byReferrer.map((r) => (
              <div key={r.source} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{r.source}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {nf.format(r.clicks)} clicks
                  </span>
                </div>
                <Bar value={(r.clicks / maxRef) * 100} tone="alt" />
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{nf.format(r.visits)} visits</Chip>
                  <Chip tone="success">{nf.format(r.conversions)} converted</Chip>
                  <Chip tone={r.qualityScore === "High" ? "brand" : "warning"}>
                    {r.qualityScore} quality
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead title="By Country" hint="Visits, CTA clicks, conversions" />
          <div className="space-y-4">
            {diagnostics.byTopCountries.map((c) => (
              <div key={c.country} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{c.country}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {nf.format(c.visits)} visits
                  </span>
                </div>
                <Bar value={(c.visits / maxCountry) * 100} />
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{nf.format(c.ctaClicks)} CTA clicks</Chip>
                  <Chip tone="success">{nf.format(c.conversions)} converted</Chip>
                  <Chip tone="neutral">{pct((c.conversions / c.visits) * 100, 2)} CVR</Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PanelHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
