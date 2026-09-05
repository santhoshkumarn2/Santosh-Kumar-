import { Panel, Chip, nf, pct } from "./primitives";
import type { FunnelData } from "@/data/funnel-data";

export function DubLinksTable({
  links,
  ctaClicks,
  conversions,
}: {
  links: FunnelData["dubLinks"];
  ctaClicks: number;
  conversions: number;
}) {
  const form = links.find((l) => l.linkId === "link_form") ?? links[0];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel className="lg:col-span-2 overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left">
              {["Short link", "Destination", "Clicks", "Last clicked"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.linkId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{l.shortUrl}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                  {l.targetUrl}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {nf.format(l.totalClicks)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {new Date(l.lastClicked).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel>
        <h3 className="font-display text-sm font-semibold text-foreground">Cross-check</h3>
        <p className="text-xs text-muted-foreground">
          Dub click volume against on-site CTA intent
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">On-site CTA clicks (Stage 4)</dt>
            <dd className="font-display font-semibold tabular-nums text-foreground">
              {nf.format(ctaClicks)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">go/form clicks</dt>
            <dd className="font-display font-semibold tabular-nums text-foreground">
              {nf.format(form?.totalClicks ?? 0)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">Form submits</dt>
            <dd className="font-display font-semibold tabular-nums text-brand-alt">
              {nf.format(conversions)}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <Chip tone={form?.totalClicks === ctaClicks ? "success" : "warning"}>
            {form?.totalClicks === ctaClicks
              ? "Attribution matched 1:1"
              : "Attribution variance detected"}
          </Chip>
          <p className="mt-3 text-xs text-muted-foreground">
            Form completion from link click:{" "}
            <span className="tabular-nums text-foreground">
              {pct((conversions / (form?.totalClicks || 1)) * 100, 2)}
            </span>
          </p>
        </div>
      </Panel>
    </div>
  );
}
