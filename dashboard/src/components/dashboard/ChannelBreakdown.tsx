import { Panel, Chip, Bar, nf, pct } from "./primitives";
import type { BotChannel, HumanChannel } from "@/data/funnel-data";

function Head({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border-b border-border px-5 py-4">
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function HumanChannelTable({ channels }: { channels: HumanChannel[] }) {
  const max = Math.max(...channels.map((c) => c.visits));
  const totals = channels.reduce(
    (a, c) => ({
      dubClicks: a.dubClicks + c.dubClicks,
      visits: a.visits + c.visits,
      scrolled: a.scrolled + c.scrolled,
      reachedLastSlide: a.reachedLastSlide + c.reachedLastSlide,
      ctaClicks: a.ctaClicks + c.ctaClicks,
      submissions: a.submissions + c.submissions,
    }),
    { dubClicks: 0, visits: 0, scrolled: 0, reachedLastSlide: 0, ctaClicks: 0, submissions: 0 },
  );

  return (
    <Panel className="overflow-hidden p-0">
      <Head
        title="Human referrer channels"
        hint="Dub short-link clicks through to submitted Google Forms"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <Th>Channel</Th>
              <Th right>Dub clicks</Th>
              <Th right>Visits</Th>
              <Th right>Scrolled</Th>
              <Th right>Last slide</Th>
              <Th right>Early access</Th>
              <Th right>Form submits</Th>
              <Th right>CVR</Th>
              <Th right>Quality</Th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.source} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{c.source}</p>
                  <div className="mt-1.5 w-32">
                    <Bar value={(c.visits / max) * 100} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {c.dubClicks ? nf.format(c.dubClicks) : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {nf.format(c.visits)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {nf.format(c.scrolled)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {nf.format(c.reachedLastSlide)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {nf.format(c.ctaClicks)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-brand-alt">
                  {nf.format(c.submissions)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {pct((c.submissions / (c.visits || 1)) * 100, 2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Chip
                    tone={
                      c.qualityScore === "High"
                        ? "success"
                        : c.qualityScore === "Medium"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {c.qualityScore}
                  </Chip>
                </td>
              </tr>
            ))}
            <tr className="border-t border-border bg-surface-muted font-medium">
              <td className="px-4 py-3 text-foreground">All human traffic</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.dubClicks)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.visits)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.scrolled)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.reachedLastSlide)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.ctaClicks)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-brand-alt">
                {nf.format(totals.submissions)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {pct((totals.submissions / (totals.visits || 1)) * 100, 2)}
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function BotChannelTable({ channels }: { channels: BotChannel[] }) {
  const max = Math.max(...channels.map((c) => c.requests));
  const totals = channels.reduce(
    (a, c) => ({
      requests: a.requests + c.requests,
      rendered: a.rendered + c.rendered,
      reachedLastSlide: a.reachedLastSlide + c.reachedLastSlide,
      ctaTouches: a.ctaTouches + c.ctaTouches,
      formProbes: a.formProbes + c.formProbes,
    }),
    { requests: 0, rendered: 0, reachedLastSlide: 0, ctaTouches: 0, formProbes: 0 },
  );

  return (
    <Panel className="overflow-hidden p-0">
      <Head
        title="Bot & crawler channels"
        hint="Read the site → touched Early Access → probed the form"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <Th>Category</Th>
              <Th right>Read site</Th>
              <Th right>Rendered</Th>
              <Th right>Last slide</Th>
              <Th right>Early access</Th>
              <Th right>Form probes</Th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.source} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{c.source}</p>
                  <p className="text-[11px] text-muted-foreground">{c.agents}</p>
                  <div className="mt-1.5 w-32">
                    <Bar value={(c.requests / max) * 100} tone="warning" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {nf.format(c.requests)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {nf.format(c.rendered)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {nf.format(c.reachedLastSlide)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {nf.format(c.ctaTouches)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-danger">
                  {nf.format(c.formProbes)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-border bg-surface-muted font-medium">
              <td className="px-4 py-3 text-foreground">All automated traffic</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.requests)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.rendered)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.reachedLastSlide)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">
                {nf.format(totals.ctaTouches)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-danger">
                {nf.format(totals.formProbes)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
