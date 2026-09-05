import type { SocialOutbound } from "./SankeyFunnel";
import { nf, pct } from "./primitives";

export function SocialEcosystemTable({
  handles,
  reachedLastSlide,
}: {
  handles: SocialOutbound[];
  reachedLastSlide: number;
}) {
  const clicks = handles.reduce((a, h) => a + h.clicks, 0);
  const follows = handles.reduce((a, h) => a + h.newFollows, 0);
  const returns = handles.reduce((a, h) => a + h.returnVisits, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(16_24_40_/_0.04)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Handle</th>
            <th className="px-4 py-3 font-medium">Profile</th>
            <th className="px-4 py-3 text-right font-medium">Outbound clicks</th>
            <th className="px-4 py-3 text-right font-medium">Share of deep readers</th>
            <th className="px-4 py-3 text-right font-medium">New follows</th>
            <th className="px-4 py-3 text-right font-medium">Return visits</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {handles.map((h) => (
            <tr key={h.platform} className="transition-colors hover:bg-surface-muted/60">
              <td className="px-4 py-3 font-medium">{h.platform}</td>
              <td className="px-4 py-3 text-muted-foreground">{h.handle}</td>
              <td className="px-4 py-3 text-right tabular-nums">{nf.format(h.clicks)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {pct(reachedLastSlide ? (h.clicks / reachedLastSlide) * 100 : 0, 1)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{nf.format(h.newFollows)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{nf.format(h.returnVisits)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-surface-muted/70 text-[13px] font-medium">
          <tr>
            <td className="px-4 py-3" colSpan={2}>
              Ecosystem total
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{nf.format(clicks)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
              {pct(reachedLastSlide ? (clicks / reachedLastSlide) * 100 : 0, 1)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{nf.format(follows)}</td>
            <td className="px-4 py-3 text-right tabular-nums">{nf.format(returns)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
