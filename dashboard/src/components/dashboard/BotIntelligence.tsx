import { Panel, Chip, Bar, nf, pct } from "./primitives";
import type { FunnelData } from "@/data/funnel-data";

type Bot = FunnelData["botIntelligence"];

function arc(cx: number, cy: number, r: number, start: number, end: number) {
  const p = (a: number) => [
    Number((cx + r * Math.cos(((a - 90) * Math.PI) / 180)).toFixed(3)),
    Number((cy + r * Math.sin(((a - 90) * Math.PI) / 180)).toFixed(3)),
  ];
  const [x1, y1] = p(start);
  const [x2, y2] = p(end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function BotIntelligence({ bot }: { bot: Bot }) {
  const segments = [
    { label: "Human requests", value: bot.totalHumanRequests, color: "var(--brand-alt)" },
    {
      label: "AI model crawlers",
      value: bot.crawlerCategories[0]?.count ?? 0,
      color: "var(--brand)",
    },
    {
      label: "Search engines",
      value: bot.crawlerCategories[1]?.count ?? 0,
      color: "var(--warning)",
    },
    {
      label: "Scrapers / SEO tools",
      value: bot.crawlerCategories[2]?.count ?? 0,
      color: "var(--danger)",
    },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  let cursor = 0;
  const paths = segments.map((s) => {
    const sweep = (s.value / total) * 360;
    const d = arc(80, 80, 62, cursor + 1, cursor + sweep - 1);
    cursor += sweep;
    return { ...s, d, share: (s.value / total) * 100 };
  });

  const botSteps = [
    { label: "Crawled site", value: bot.botFunnel.crawledSite },
    { label: "CTA link touch", value: bot.botFunnel.interactedCTA },
    { label: "Form probe", value: bot.botFunnel.attemptedSubmission },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Traffic composition
        </h3>
        <p className="text-xs text-muted-foreground">
          {pct(bot.botSharePercentage, 2)} of all requests are automated
        </p>
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
          <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0">
            {paths.map((p) => (
              <path
                key={p.label}
                d={p.d}
                stroke={p.color}
                strokeWidth={18}
                strokeLinecap="round"
                fill="none"
              />
            ))}
            <text
              x="80"
              y="74"
              textAnchor="middle"
              className="fill-foreground font-display text-[17px] font-semibold"
            >
              {nf.format(total)}
            </text>
            <text
              x="80"
              y="93"
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] uppercase tracking-widest"
            >
              requests
            </text>
          </svg>
          <div className="w-full space-y-3">
            {paths.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {nf.format(p.value)} · {pct(p.share)}
                  </span>
                </div>
                <Bar value={p.share} />
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-display text-sm font-semibold text-foreground">Bot funnel</h3>
        <p className="text-xs text-muted-foreground">Crawl → CTA touch → form probe</p>
        <div className="mt-4 space-y-3">
          {botSteps.map((s, i) => {
            const share = (s.value / (botSteps[0]?.value || 1)) * 100;
            return (
              <div key={s.label} className="rounded-lg border border-border bg-surface-muted p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {i + 1}. {s.label}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {nf.format(s.value)}
                  </span>
                </div>
                <div className="mt-2">
                  <Bar value={share} tone={i === 0 ? "brand" : "warning"} />
                </div>
                <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                  {pct(share, 2)} of crawled sessions
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {bot.crawlerCategories.map((c) => (
            <Chip key={c.category} tone="brand">
              {c.category.split(" (")[0]}: {nf.format(c.count)}
            </Chip>
          ))}
        </div>
      </Panel>
    </div>
  );
}
