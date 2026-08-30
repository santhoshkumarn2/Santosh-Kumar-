import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame } from "motion/react";

const round = (n: number) => Math.round(n * 1000) / 1000;

type Point = { x: number; y: number; z: number };

function buildSphere(latBands: number, lonBands: number): Point[] {
  const pts: Point[] = [];
  for (let i = 1; i < latBands; i++) {
    const phi = (Math.PI * i) / latBands;
    const ringRadius = Math.sin(phi);
    const count = Math.max(4, Math.round(lonBands * ringRadius));
    for (let j = 0; j < count; j++) {
      const theta = (2 * Math.PI * j) / count;
      pts.push({
        x: ringRadius * Math.cos(theta),
        y: Math.cos(phi),
        z: ringRadius * Math.sin(theta),
      });
    }
  }
  return pts;
}

export function DottedGlobe({ size = 260 }: { size?: number }) {
  const points = useMemo(() => buildSphere(22, 44), []);
  const circlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const r = size / 2;
  const tilt = -0.32;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  // Update dot positions directly on the DOM each frame — no React re-render,
  // so rotation stays perfectly smooth regardless of tree size.
  useAnimationFrame((t) => {
    if (!mounted) return;
    const rotation = (t / 1000) * 0.28;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const circles = circlesRef.current;

    for (let i = 0; i < points.length; i++) {
      const el = circles[i];
      if (!el) continue;
      const p = points[i];
      if (!p) continue;
      const x1 = p.x * cosR - p.z * sinR;
      const z1 = p.x * sinR + p.z * cosR;
      const y2 = p.y * cosT - z1 * sinT;
      const z2 = p.y * sinT + z1 * cosT;
      const depth = (z2 + 1) / 2;
      el.setAttribute(
        "transform",
        `translate(${round(x1 * r * 0.86)} ${round(y2 * r * 0.86)})`,
      );
      el.setAttribute("r", String(round(0.6 + depth * 1.25)));
      el.setAttribute("opacity", String(round(0.1 + depth * 0.72)));
    }
  });

  if (!mounted) return <div style={{ width: size, height: size }} aria-hidden="true" />;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <radialGradient id="nebula-globe-glow">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r * 0.98} fill="url(#nebula-globe-glow)" />
      {points.map((_, i) => (
        <circle
          key={i}
          ref={(el) => {
            circlesRef.current[i] = el;
          }}
          cx={r}
          cy={r}
          r={1.2}
          fill="var(--foreground)"
          opacity={0.4}
          style={{ willChange: "transform" }}
        />
      ))}
    </svg>
  );
}
