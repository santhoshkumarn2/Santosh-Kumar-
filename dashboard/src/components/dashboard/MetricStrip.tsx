import { Panel, nf } from "./primitives";
import type { FunnelData } from "@/data/funnel-data";

export function MetricStrip({ summary }: { summary: FunnelData["summary"] }) {
  const cards = [
    {
      label: "True Visitors",
      value: nf.format(summary.totalPageVisits),
      sub: `${nf.format(summary.totalPageViews)} page views · ${summary.viewsPerVisitRatio.toFixed(2)} views/visit`,
    },
    {
      label: "Inbound Interest",
      value: nf.format(summary.inboundDubClicks),
      sub: "Aggregated clicks across Dub links",
    },
    {
      label: "Total Submissions",
      value: nf.format(summary.totalConversions),
      sub: "Verified early-access form submits",
    },
    {
      label: "End-to-End Conversion",
      value: `${summary.overallConversionRate.toFixed(2)}%`,
      sub: "Converted ÷ total visitors",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Panel key={c.label} className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand to-brand-alt" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {c.label}
          </p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {c.value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{c.sub}</p>
        </Panel>
      ))}
    </div>
  );
}
