import { useMemo, useState } from "react";
import type { UnifiedStage, HumanChannel, BotChannel } from "@/data/funnel-data";
import { nf, pct } from "./primitives";

export type SocialOutbound = {
  platform: string;
  handle: string;
  clicks: number;
  newFollows: number;
  returnVisits: number;
};

/* ---------- palette (chart-local, dark alluvial) ---------- */
const C = {
  bg: "#090d16",
  grid: "#1b2334",
  human: "#8b5cf6",
  bot: "#f59e0b",
  flow: "#10b981",
  flowDeep: "#059669",
  fallout: "#f43f5e",
  text: "#e2e8f5",
  muted: "#7c8aa5",
};

/* ---------- geometry ---------- */
const WIDTH = 1520;
const HEIGHT = 860;
const MID = 340;
const MAX_H = 250;
const EXP = 0.42;
const NODE_W = 12;
const PILLAR_W = 14;
const LOAD_X = -232;
const IN_X = 168;
const PILLAR_X = [470, 660, 850, 1040, 1230];
const OUT_X = 1372;
const SOCIAL_X = 1310;
const SOCIAL_MID = 545;
const FALL_Y = 678;
const MIN_H = 14;


type Seg = { top: number; bot: number };

function ribbon(x0: number, a: Seg, x1: number, b: Seg) {
  const cx0 = x0 + (x1 - x0) * 0.45;
  const cx1 = x0 + (x1 - x0) * 0.55;
  return [
    `M ${x0} ${a.top}`,
    `C ${cx0} ${a.top}, ${cx1} ${b.top}, ${x1} ${b.top}`,
    `L ${x1} ${b.bot}`,
    `C ${cx1} ${b.bot}, ${cx0} ${a.bot}, ${x0} ${a.bot}`,
    "Z",
  ].join(" ");
}

/* fallout stream: leaves the bottom of a pillar and sinks into a shelf below */
function fallStream(x0: number, a: Seg, x1: number, y: number, thick: number) {
  const cx = x0 + (x1 - x0) * 0.55;
  return [
    `M ${x0} ${a.top}`,
    `C ${cx} ${a.top}, ${x1 - 40} ${y}, ${x1} ${y}`,
    `L ${x1} ${y + thick}`,
    `C ${x1 - 40} ${y + thick}, ${cx} ${a.bot}, ${x0} ${a.bot}`,
    "Z",
  ].join(" ");
}

export function SankeyFunnel({
  stages,
  humanChannels,
  botChannels,
  pageViews,
  socialOutbound = [],
}: {
  stages: UnifiedStage[];
  humanChannels: HumanChannel[];
  botChannels: BotChannel[];
  pageViews: number;
  socialOutbound?: SocialOutbound[];
}) {
  const [hover, setHover] = useState<string | null>(null);

  const model = useMemo(() => {
    const totals = stages.map((s) => s.human + s.bot);
    const max = totals[0] || 1;
    // Dynamic proportional scaling that reshapes the funnel as numbers change
    const h = (v: number) => {
      if (v <= 0) return MIN_H;
      const ratio = v / max;
      const scaled = MAX_H * Math.pow(ratio, 0.55);
      return Math.max(MIN_H, Math.min(MAX_H, scaled));
    };

    const pillars = stages.map((s, i) => {
      const value = totals[i] ?? 0;
      const height = h(value);
      const prev = totals[i - 1];
      return {
        id: `p${s.stageId}`,
        name: s.name,
        badge: s.badge,
        value,
        human: s.human,
        botCount: s.bot,
        x: PILLAR_X[i] ?? 0,
        top: MID - height / 2,
        bottom: MID + height / 2,
        height,
        conv: prev ? (value / prev) * 100 : 100,
      };
    });

    /* inbound channel nodes, grouped and proportionally sized */
    const inbound: {
      id: string;
      label: string;
      sub: string;
      value: number;
      kind: "human" | "bot";
      top: number;
      bot: number;
      target: Seg;
    }[] = [];

    const humans = humanChannels.map((c) => ({
      id: `h-${c.source}`,
      label: c.source.replace(/\s*\(.*\)$/, ""),
      sub: c.dubClicks ? `${nf.format(c.dubClicks)} link clicks` : "no short link",
      value: c.visits,
      kind: "human" as const,
    }));
    const bots = botChannels.map((c) => ({
      id: `b-${c.source}`,
      label: c.source,
      sub: c.agents.split(",")[0]?.trim() ?? "",
      value: c.requests,
      kind: "bot" as const,
    }));

    const all = [...humans, ...bots];
    const totalInbound = all.reduce((sum, n) => sum + n.value, 0) || 1;
    const heights = all.map((n) => {
      const share = n.value / totalInbound;
      return Math.max(10, Math.min(80, Math.pow(share, 0.5) * 65));
    });
    const GAP = 15;
    const GROUP_GAP = 34;
    const span =
      heights.reduce((a, b) => a + b, 0) + GAP * (all.length - 1) + GROUP_GAP;
    let y = MID - span / 2;
    let ty = pillars[0]?.top ?? 0;
    const p0H = pillars[0]?.height ?? MAX_H;

    all.forEach((n, i) => {
      const nh = heights[i] ?? MIN_H;
      if (i === humans.length) y += GROUP_GAP;
      const th = Math.max(2, (n.value / totalInbound) * p0H);
      inbound.push({
        ...n,
        top: y,
        bot: y + nh,
        target: { top: ty, bot: ty + th },
      });
      y += nh + GAP;
      ty += th;
    });

    const humanBandTop = inbound[0]?.top ?? 0;
    const humanBandBot = inbound[humans.length - 1]?.bot ?? 0;
    const botBandTop = inbound[humans.length]?.top ?? 0;
    const botBandBot = inbound[inbound.length - 1]?.bot ?? 0;

    /* browser / search page-load layer feeding Direct / Organic only */
    const directNode = inbound.find((n) => n.id.startsWith("h-Direct"));
    const directVisits = directNode ? directNode.value : 0;
    const referredVisits = humanChannels
      .filter((c) => !c.source.startsWith("Direct"))
      .reduce((a, c) => a + c.visits, 0);
    const loadsValue = Math.max(directVisits, pageViews - referredVisits);
    const enteredH = directNode ? directNode.bot - directNode.top : MIN_H;
    const loadsH = Math.max(enteredH, enteredH * (loadsValue / (directVisits || 1)) * 0.55);
    const loadsMid = directNode ? (directNode.top + directNode.bot) / 2 : MID;
    const loads = {
      id: "loads",
      value: loadsValue,
      entered: directVisits,
      bounced: Math.max(0, loadsValue - directVisits),
      top: loadsMid - loadsH / 2,
      bot: loadsMid + loadsH / 2,
      target: directNode
        ? { top: directNode.top, bot: directNode.bot }
        : { top: MID - MIN_H, bot: MID + MIN_H },
    };

    /* advancing flow + fallout between stages (dynamically calculated) */
    const flows: {
      id: string;
      from: Seg;
      to: Seg;
      fromX: number;
      toX: number;
      conv: number;
    }[] = [];

    const falls: {
      id: string;
      lost: number;
      label: string;
      share: number;
      last: boolean;
      from: Seg;
      x: number;
      shelfX: number;
      thick: number;
    }[] = [];

    for (let i = 0; i < pillars.length - 1; i++) {
      const p = pillars[i]!;
      const next = pillars[i + 1]!;
      const lost = Math.max(0, p.value - next.value);
      const convRate = p.value > 0 ? Math.min(1, next.value / p.value) : 0;
      
      // Advancing ribbon thickness on pillar p scales dynamically with the conversion rate
      const advancingThick = Math.max(3, Math.min(p.height, p.height * Math.pow(convRate, 0.6)));

      flows.push({
        id: `flow-${p.id}`,
        fromX: p.x + PILLAR_W / 2,
        from: { top: p.top, bot: p.top + advancingThick },
        toX: next.x - PILLAR_W / 2,
        to: { top: next.top, bot: next.bottom },
        conv: next.conv,
      });

      if (lost > 0) {
        const falloutSourceThick = p.bottom - (p.top + advancingThick);
        const thick = Math.max(4, Math.min(65, falloutSourceThick * 0.75));
        const label =
          i === 0
            ? "Bounced on hero"
            : i === 1
              ? "Left inside solution slides"
              : i === 2
                ? "Read but never clicked CTA"
                : "Form abandonment";

        falls.push({
          id: `f${i}`,
          lost,
          label,
          share: p.value ? (lost / p.value) * 100 : 0,
          last: i === pillars.length - 2,
          from: { top: p.top + advancingThick, bot: p.bottom },
          x: p.x + PILLAR_W / 2,
          shelfX: (PILLAR_X[i + 1] ?? 0) - 26,
          thick,
        });
      }
    }

    /* outbound: primary goal from the final pillar, social branch from "reached last slide" */
    const last = pillars[pillars.length - 1]!;
    const lastSlide = pillars[2] ?? last;
    const leads = stages[stages.length - 1]?.human ?? 0;
    const leadBots = stages[stages.length - 1]?.bot ?? 0;
    const returns = socialOutbound.reduce((a, s) => a + s.returnVisits, 0);
    const socialClicks = socialOutbound.reduce((a, s) => a + s.clicks, 0);
    const socialThick = Math.max(16, Math.min(60, socialClicks * 1.5 + 16));

    /* fan the branch into one ribbon per handle */
    const S_GAP = 26;
    const sHeights = socialOutbound.map((s) =>
      Math.max(10, (socialThick * s.clicks) / (socialClicks || 1)) * 2.2,
    );
    const sSpan =
      sHeights.reduce((a, b) => a + b, 0) + S_GAP * Math.max(0, socialOutbound.length - 1);
    let sy = SOCIAL_MID - sSpan / 2;
    let sfy = lastSlide.bottom - socialThick;
    const socialNodes = socialOutbound.map((s, i) => {
      const hh = sHeights[i] ?? 10;
      const fh = Math.max(3, (socialThick * s.clicks) / (socialClicks || 1));
      const node = {
        id: `soc-${s.platform}`,
        platform: s.platform,
        handle: s.handle,
        clicks: s.clicks,
        follows: s.newFollows,
        returnVisits: s.returnVisits,
        top: sy,
        bot: sy + hh,
        from: { top: sfy, bot: sfy + fh },
      };
      sy += hh + S_GAP;
      sfy += fh;
      return node;
    });

    return {
      pillars,
      inbound,
      flows,
      falls,
      humanBand: { top: humanBandTop, bot: humanBandBot },
      botBand: { top: botBandTop, bot: botBandBot },
      leads,
      leadBots,
      returns,
      socialClicks,
      socialNodes,
      socialFromX: lastSlide.x + PILLAR_W / 2,
      loads,
      out: {
        lead: { top: last.top, bot: last.bottom },
      },
      last,

      pageViews,
    };
  }, [stages, humanChannels, botChannels, pageViews, socialOutbound]);


  const dim = (id: string) => (hover && hover !== id ? 0.16 : 1);

  return (
    <div
      className="overflow-x-auto rounded-2xl border p-1"
      style={{ background: C.bg, borderColor: C.grid }}
    >
      <svg
        viewBox={`${LOAD_X - 40} 0 ${WIDTH - LOAD_X + 40} ${HEIGHT}`}
        className="h-auto w-full min-w-[1240px]"
        role="img"
        aria-label="Traffic alluvial funnel from referral sources to verified form submissions"
      >
        <defs>
          <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.flow} stopOpacity="0.85" />
            <stop offset="100%" stopColor={C.flowDeep} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="pillarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor={C.flowDeep} />
          </linearGradient>
          <linearGradient id="fallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.fallout} stopOpacity="0.42" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* group headers */}
        <text x={IN_X - NODE_W} y={model.humanBand.top - 20} fill={C.human} className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
          Human referrals
        </text>
        <text x={IN_X - NODE_W} y={model.botBand.top - 14} fill={C.bot} className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
          AI / bot crawlers
        </text>

        {/* browser / search page loads → Direct / Organic */}
        <g opacity={dim(model.loads.id)}>
          <text
            x={LOAD_X}
            y={model.loads.top - 40}
            fill={C.muted}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            Browser / search page loads
          </text>
          <path
            d={ribbon(
              LOAD_X + NODE_W,
              { top: model.loads.top, bot: model.loads.bot },
              IN_X - NODE_W,
              model.loads.target,
            )}
            fill={C.muted}
            opacity={0.22}
            onMouseEnter={() => setHover(model.loads.id)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`${nf.format(model.loads.value)} page loads → ${nf.format(model.loads.entered)} entered`}</title>
          </path>
          <rect
            x={LOAD_X}
            y={model.loads.top}
            width={NODE_W}
            height={model.loads.bot - model.loads.top}
            rx={3}
            fill={C.muted}
          />
          <text x={LOAD_X} y={model.loads.top - 18} fill={C.text} className="font-mono text-[18px] font-semibold tabular-nums">
            {nf.format(model.loads.value)}
          </text>
          <text x={LOAD_X} y={model.loads.bot + 20} fill={C.muted} className="font-mono text-[10.5px] tabular-nums">
            {nf.format(model.loads.entered)} entered the site
          </text>
          <text x={LOAD_X} y={model.loads.bot + 36} fill={C.fallout} className="font-mono text-[10.5px] tabular-nums" opacity={0.8}>
            −{nf.format(model.loads.bounced)} loaded, never engaged
          </text>
        </g>

        {/* inbound ribbons */}
        <g>
          {model.inbound.map((n) => (
            <path
              key={n.id}
              d={ribbon(IN_X, { top: n.top, bot: n.bot }, PILLAR_X[0]! - PILLAR_W / 2, n.target)}
              fill={n.kind === "human" ? C.human : C.bot}
              opacity={0.4 * dim(n.id)}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${n.label}: ${nf.format(n.value)}`}</title>
            </path>
          ))}
        </g>

        {/* fallout streams */}
        <g>
          {model.falls.map((f) => (
            <g key={f.id} opacity={dim(f.id)}>
              <path
                d={fallStream(f.x, f.from, f.shelfX, FALL_Y, f.thick)}
                fill="url(#fallGrad)"
                onMouseEnter={() => setHover(f.id)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${f.label}: ${nf.format(f.lost)}`}</title>
              </path>
              <rect x={f.shelfX} y={FALL_Y} width={4} height={f.thick} rx={2} fill={C.fallout} opacity={0.55} />
              <text
                x={f.last ? f.shelfX - 12 : f.shelfX + 12}
                textAnchor={f.last ? "end" : "start"}
                y={FALL_Y + Math.max(f.thick, 34) + 26}
                fill={C.fallout}
                className="font-mono text-[12px] font-semibold"
              >
                −{nf.format(f.lost)}
              </text>
              <text
                x={f.last ? f.shelfX - 12 : f.shelfX + 12}
                textAnchor={f.last ? "end" : "start"}
                y={FALL_Y + Math.max(f.thick, 34) + 42}
                fill={C.muted}
                className="text-[11px]"
              >
                {f.label} · {pct(f.share, 1)}
              </text>

            </g>
          ))}
        </g>

        {/* advancing emerald flow */}
        <g>
          {model.flows.map((fl) => (
            <path
              key={fl.id}
              d={ribbon(fl.fromX, fl.from, fl.toX, fl.to)}
              fill="url(#flowGrad)"
              opacity={dim(fl.id)}
            >
              <title>{`Advancing flow: ${pct(fl.conv, 1)}`}</title>
            </path>
          ))}
        </g>

        {/* social branch: fans out of "Reached last slide" into each handle */}
        <g>
          {model.socialNodes.map((s) => (
            <path
              key={`sr-${s.id}`}
              d={ribbon(model.socialFromX, s.from, SOCIAL_X, { top: s.top, bot: s.bot })}
              fill={C.human}
              opacity={0.3 * dim(s.id)}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${s.platform}: ${nf.format(s.clicks)} clicks · ${nf.format(s.returnVisits)} return visits`}</title>
            </path>
          ))}
        </g>


        {/* primary goal ribbon */}
        <path
          d={ribbon(model.last.x + PILLAR_W / 2, model.out.lead, OUT_X, { top: 214, bot: 274 })}
          fill={C.flow}
          opacity={0.55}
        />


        {/* pillars + KPI cards */}
        <g>
          {model.pillars.map((p, i) => (
            <g
              key={p.id}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={p.x - PILLAR_W / 2}
                y={p.top}
                width={PILLAR_W}
                height={p.height}
                rx={3}
                fill="url(#pillarGrad)"
                filter="url(#glow)"
                opacity={dim(p.id)}
              />
              {/* leader line up to the card */}
              <line
                x1={p.x}
                y1={p.top - 6}
                x2={p.x}
                y2={150}
                stroke={C.grid}
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              {/* KPI card */}
              <g>
                <rect
                  x={p.x - 84}
                  y={40}
                  width={168}
                  height={108}
                  rx={12}
                  fill="#0e141f"
                  stroke={hover === p.id ? C.flow : C.grid}
                />
                <text x={p.x - 68} y={64} fill={C.muted} className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Step {i + 1}
                </text>
                <text x={p.x - 68} y={84} fill={C.text} className="text-[12.5px] font-semibold">
                  {p.name}
                </text>
                <text
                  x={p.x - 68}
                  y={116}
                  fill={C.flow}
                  filter="url(#glow)"
                  className="font-mono text-[22px] font-semibold tabular-nums"
                >
                  {nf.format(p.value)}
                </text>
                <text x={p.x - 68} y={136} fill={C.muted} className="font-mono text-[11px] tabular-nums">
                  {i === 0 ? "entry volume" : `${pct(p.conv, 1)} of previous`}
                </text>
              </g>
              <text
                x={p.x}
                y={p.bottom + 22}
                textAnchor="middle"
                fill={C.muted}
                className="font-mono text-[10.5px] tabular-nums"
              >
                {nf.format(p.human)} human · {nf.format(p.botCount)} bot
              </text>
            </g>
          ))}
        </g>

        {/* inbound node bars + labels */}
        <g>
          {model.inbound.map((n) => (
            <g key={`n-${n.id}`} opacity={dim(n.id)}>
              <rect
                x={IN_X - NODE_W}
                y={n.top}
                width={NODE_W}
                height={n.bot - n.top}
                rx={3}
                fill={n.kind === "human" ? C.human : C.bot}
              />
              <text
                x={IN_X - NODE_W - 12}
                y={(n.top + n.bot) / 2 - 1}
                textAnchor="end"
                fill={C.text}
                className="text-[12px] font-medium"
              >
                {n.label}
              </text>
              <text
                x={IN_X - NODE_W - 12}
                y={(n.top + n.bot) / 2 + 14}
                textAnchor="end"
                fill={C.muted}
                className="font-mono text-[10.5px] tabular-nums"
              >
                {nf.format(n.value)} · {n.sub}
              </text>
            </g>
          ))}
        </g>

        {/* primary conversion card */}
        <g>
          <rect x={OUT_X} y={186} width={132} height={116} rx={12} fill="#0d1a16" stroke={C.flow} strokeOpacity={0.6} />
          <text x={OUT_X + 14} y={210} fill={C.flow} className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
            Primary goal
          </text>
          <text x={OUT_X + 14} y={244} fill={C.flow} filter="url(#glow)" className="font-mono text-[24px] font-semibold tabular-nums">
            {nf.format(model.leads + model.leadBots)}
          </text>
          <text x={OUT_X + 14} y={264} fill={C.text} className="text-[11px]">
            Submitted Google Form
          </text>
          <text x={OUT_X + 14} y={282} fill={C.muted} className="font-mono text-[10.5px] tabular-nums">
            {nf.format(model.leads)} humans + {nf.format(model.leadBots)} bots
          </text>
        </g>

        {/* secondary destinations: social handles as open end nodes */}
        <g>
          <text
            x={SOCIAL_X}
            y={(model.socialNodes[0]?.top ?? SOCIAL_MID) - 26}
            fill={C.human}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            Social ecosystem
          </text>
          {model.socialNodes.map((s) => (
            <g key={s.id} opacity={dim(s.id)}>
              <rect x={SOCIAL_X} y={s.top} width={NODE_W} height={s.bot - s.top} rx={3} fill={C.human} />
              <text x={SOCIAL_X + NODE_W + 12} y={(s.top + s.bot) / 2 - 1} fill={C.text} className="text-[12px] font-medium">
                {s.platform}
              </text>
              <text
                x={SOCIAL_X + NODE_W + 12}
                y={(s.top + s.bot) / 2 + 14}
                fill={C.muted}
                className="font-mono text-[10.5px] tabular-nums"
              >
                {nf.format(s.clicks)} clicks · {nf.format(s.returnVisits)} return
              </text>
            </g>
          ))}
        </g>


        {/* footer legend */}
        <g>
          <text x={IN_X - NODE_W} y={HEIGHT - 26} fill={C.muted} className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
            {nf.format(model.pageViews)} page views aggregated · advancing flow in emerald · social branch in violet · fallout sinks below
          </text>
        </g>

      </svg>
    </div>
  );
}
