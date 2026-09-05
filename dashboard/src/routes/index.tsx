import { createFileRoute } from "@tanstack/react-router";
import { funnelData } from "@/data/funnel-data";
import { Section, Chip, nf, pct } from "@/components/dashboard/primitives";
import { MetricStrip } from "@/components/dashboard/MetricStrip";
import { UnifiedFunnel } from "@/components/dashboard/UnifiedFunnel";
import { SankeyFunnel } from "@/components/dashboard/SankeyFunnel";
import { HumanChannelTable, BotChannelTable } from "@/components/dashboard/ChannelBreakdown";
import { DropOffDiagnostics } from "@/components/dashboard/DropOffDiagnostics";
import { SlideRetentionHeatmap } from "@/components/dashboard/SlideRetention";
import { BotIntelligence } from "@/components/dashboard/BotIntelligence";
import { DubLinksTable } from "@/components/dashboard/DubLinksTable";
import { SocialEcosystemTable } from "@/components/dashboard/SocialEcosystem";


const title = "Project Nebula — Traffic & Funnel Intelligence";
const description =
  "Live conversion funnel, slide retention, drop-off diagnostics, bot intelligence and inbound link attribution for projectnebula.site.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const d = funnelData;
  const lastUpdated = new Date(d.dubLinks[0]?.lastClicked ?? Date.now()).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-brand-alt" />
            <div>
              <h1 className="font-display text-lg font-semibold tracking-tight">
                Project Nebula · Traffic &amp; Funnel Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">
                Cloudflare RUM + Dub attribution · localhost:3000
              </p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Chip tone="brand">Local engine</Chip>
            <Chip tone="success">
              {nf.format(d.summary.totalConversions)} conversions ·{" "}
              {pct(d.summary.overallConversionRate, 2)}
            </Chip>
            <span className="text-xs text-muted-foreground">Updated {lastUpdated} UTC</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-8">
        <MetricStrip summary={d.summary} />

        <Section
          eyebrow="Section 1"
          title="Traffic flow — channels to form submissions"
          description="Every referrer channel and bot category flows into the landing page, then splits at each step: scroll, last slide, Early Access click and Google Form submit — with drop-off branching off to the side."
        >
          <div className="space-y-5">
            <SankeyFunnel
              stages={d.unifiedFunnel}
              humanChannels={d.humanChannels}
              botChannels={d.botChannels}
              pageViews={d.summary.totalPageViews}
              socialOutbound={d.socialOutbound}
            />

            <UnifiedFunnel stages={d.unifiedFunnel} />
          </div>
        </Section>

        <Section
          eyebrow="Section 2"
          title="Referrer channels"
          description="Where traffic comes from — Dub short-link clicks by source, plus every bot category, carried all the way to form submits."
        >
          <div className="space-y-4">
            <HumanChannelTable channels={d.humanChannels} />
            <BotChannelTable channels={d.botChannels} />
          </div>
        </Section>

        <Section
          eyebrow="Section 3"
          title="Slide-by-slide scroll behaviour"
          description="Whether visitors actually scroll each slide, how many reach the last page, and how long they dwell."
        >
          <SlideRetentionHeatmap slides={d.slideRetention} />
        </Section>

        <Section
          eyebrow="Section 4"
          title="Stage-by-stage drop-off diagnostics"
          description="Cut each transition by device, referrer channel and country to locate where intent leaks."
        >
          <DropOffDiagnostics stages={d.funnelStages} diagnostics={d.dropOffDiagnostics} />
        </Section>


        <Section
          eyebrow="Section 5"
          title="AI bot intelligence"
          description="Automated share of traffic, crawler categories, and how far bots travel down the funnel."
        >
          <BotIntelligence bot={d.botIntelligence} />
        </Section>

        <Section
          eyebrow="Section 6"
          title="Ecosystem outbound — social handles"
          description="Where visitors go next: clicks from the deck out to our LinkedIn, X, GitHub, Discord and YouTube presence, with the follows and return visits that build retention and trust."
        >
          <SocialEcosystemTable
            handles={d.socialOutbound}
            reachedLastSlide={d.unifiedFunnel[2]?.human ?? 0}
          />
        </Section>

        <Section
          eyebrow="Section 7"
          title="Dub links & inbound attribution"
          description="Short-link performance cross-checked against on-site CTA clicks and verified submissions."
        >
          <DubLinksTable
            links={d.dubLinks}
            ctaClicks={d.funnelStages[3]?.count ?? 0}
            conversions={d.summary.totalConversions}
          />
        </Section>

      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Project Nebula funnel engine · figures reflect the latest local aggregation run
      </footer>
    </div>
  );
}
