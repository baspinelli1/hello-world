"use client";
import type { ReactNode } from "react";

export function Swatches({ colors, avoid }: { colors: { hex: string; name: string }[]; avoid?: boolean }) {
  return (
    <div className="swatches">
      {colors.map((c) => (
        <div key={c.hex + c.name} className={`swatch${avoid ? " avoid" : ""}`}>
          <div className="chip" style={{ background: c.hex }} />
          {c.name}
        </div>
      ))}
    </div>
  );
}

const SCALES: Record<string, string[]> = {
  hue: ["cool", "neutral-cool", "neutral", "neutral-warm", "warm"],
  value: ["light", "light-medium", "medium", "medium-deep", "deep"],
  chroma: ["soft", "soft-medium", "medium", "medium-clear", "clear"],
  contrast: ["low", "medium-low", "medium", "medium-high", "high"],
};
const ENDS: Record<string, [string, string]> = {
  hue: ["Cool", "Warm"], value: ["Light", "Deep"], chroma: ["Soft", "Clear"], contrast: ["Low contrast", "High contrast"],
};

export function DimensionBar({ dim, value }: { dim: keyof typeof SCALES; value: string }) {
  const v = value.replace(/^olive-/, "");
  const i = Math.max(0, SCALES[dim].indexOf(v));
  const pct = 8 + (i / (SCALES[dim].length - 1)) * 84;
  return (
    <div>
      <div className="dim-label"><span>{ENDS[dim][0]}</span><strong style={{ color: "var(--ink)" }}>{value.replace("-", " · ")}</strong><span>{ENDS[dim][1]}</span></div>
      <div className="dim-track"><div className="dim-dot" style={{ left: `${pct}%` }} /></div>
    </div>
  );
}

export function TrendBadge({ status }: { status: string }) {
  const cls = status === "classic" ? "good" : status === "mixed" ? "" : "accent";
  return <span className={`badge ${cls}`}>{status.replace("-", " ")}</span>;
}

export function ErrorBox({ error }: { error: string | null }) {
  return error ? <div className="error" role="alert">{error}</div> : null;
}

export function DemoNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="notice">
      <strong>Sample mode.</strong> No Claude API key is connected yet, so you're seeing example results, not an analysis of your photos.
    </div>
  );
}

export function Section({ kicker, title, children }: { kicker?: string; title: string; children: ReactNode }) {
  return (
    <section className="card">
      {kicker && <div className="kicker">{kicker}</div>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Confidence({ level, runnerUp }: { level: string; runnerUp?: string }) {
  const label = level === "high" ? "High confidence" : level === "medium" ? "Medium confidence" : "Low confidence";
  return (
    <span className="muted small">
      {label}{runnerUp ? ` · could also be ${runnerUp}` : ""}
    </span>
  );
}
