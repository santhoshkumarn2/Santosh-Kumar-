import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const nf = new Intl.NumberFormat("en-US");

export function pct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-1">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(16_24_40_/_0.04),0_8px_24px_-16px_rgb(16_24_40_/_0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-muted text-muted-foreground border-border",
    brand: "bg-brand-soft text-brand border-brand/20",
    success: "bg-brand-alt-soft text-brand-alt border-brand-alt/25",
    warning: "bg-warning-soft text-warning border-warning/25",
    danger: "bg-danger-soft text-danger border-danger/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Bar({
  value,
  tone = "brand",
}: {
  value: number;
  tone?: "brand" | "alt" | "warning" | "danger";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand",
    alt: "bg-brand-alt",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}
