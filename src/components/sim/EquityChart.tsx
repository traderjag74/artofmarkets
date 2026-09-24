"use client";

import { useEffect, useRef, useState } from "react";
import type { SimResult } from "@/lib/sim/engine";

type Props = {
  result: SimResult;
  trades: number;
  ruinLevel: number; // equity index at which the ruin zone starts, e.g. 50
  height?: number;
  compact?: boolean;
  label: string;
};

function cssVar(el: Element, name: string) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

function niceTicks(max: number): number[] {
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

/**
 * Monte Carlo fan: faint individual paths, shaded 5–95% band, emphasised
 * median, thin worst path, and a shaded ruin zone. Canvas for speed.
 */
export function EquityChart({ result, trades, ruinLevel, height: heightProp, compact = false, label }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const height = heightProp ?? (width > 0 && width < 560 ? 260 : 360);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = compact ? { l: 8, r: 8, t: 8, b: 8 } : { l: 44, r: 12, t: 12, b: 28 };
  let yMax = 0;
  for (let t = 0; t <= trades; t++) yMax = Math.max(yMax, result.p95[t]);
  yMax = Math.max(yMax * 1.12, 130);
  const ticks = niceTicks(yMax);
  yMax = Math.max(yMax, ticks[ticks.length - 1]);

  const x = (t: number) => pad.l + (t / trades) * (width - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - Math.min(v, yMax) / yMax) * (height - pad.t - pad.b);

  useEffect(() => {
    const c = canvas.current;
    if (!c || width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, height);

    const ink = cssVar(c, "--c-ink");
    const muted = cssVar(c, "--c-muted");
    const line = cssVar(c, "--c-line");
    const accent = cssVar(c, "--c-accent");
    const accentSoft = cssVar(c, "--c-accent-soft");
    const loss = cssVar(c, "--c-loss");
    const lossSoft = cssVar(c, "--c-loss-soft");
    const mono = cssVar(c, "--font-mono") || "monospace";

    // Ruin zone
    g.fillStyle = lossSoft;
    g.fillRect(pad.l, y(ruinLevel), width - pad.l - pad.r, y(0) - y(ruinLevel));

    // Grid + labels
    g.lineWidth = 1;
    g.strokeStyle = line;
    g.fillStyle = muted;
    g.font = `11px ${mono}`;
    g.textAlign = "right";
    g.textBaseline = "middle";
    if (!compact) {
      for (const v of ticks) {
        g.beginPath();
        g.moveTo(pad.l, Math.round(y(v)) + 0.5);
        g.lineTo(width - pad.r, Math.round(y(v)) + 0.5);
        g.stroke();
        g.fillText(`${v - 100 >= 0 ? "+" : ""}${v - 100}%`, pad.l - 6, y(v));
      }
      g.textAlign = "center";
      g.textBaseline = "top";
      const xStep = trades <= 100 ? 25 : trades <= 250 ? 50 : 100;
      for (let t = 0; t <= trades; t += xStep) g.fillText(String(t), x(t), height - pad.b + 8);
      g.fillStyle = loss;
      g.textAlign = "left";
      g.textBaseline = "bottom";
      g.fillText(`Account down ${100 - ruinLevel}%`, pad.l + 6, y(0) - 6);
    }

    // Start line
    g.strokeStyle = muted;
    g.setLineDash([3, 4]);
    g.beginPath();
    g.moveTo(pad.l, y(100));
    g.lineTo(width - pad.r, y(100));
    g.stroke();
    g.setLineDash([]);

    // Individual paths
    g.strokeStyle = ink;
    g.globalAlpha = compact ? 0.06 : 0.07;
    g.lineWidth = 1;
    for (const path of result.equity) {
      g.beginPath();
      for (let t = 0; t <= trades; t++) (t ? g.lineTo : g.moveTo).call(g, x(t), y(path[t]));
      g.stroke();
    }
    g.globalAlpha = 1;

    // 5–95% band
    g.fillStyle = accentSoft;
    g.globalAlpha = 0.7;
    g.beginPath();
    for (let t = 0; t <= trades; t++) (t ? g.lineTo : g.moveTo).call(g, x(t), y(result.p95[t]));
    for (let t = trades; t >= 0; t--) g.lineTo(x(t), y(result.p5[t]));
    g.closePath();
    g.fill();
    g.globalAlpha = 1;

    // Worst path
    const worst = result.equity[result.worstPath];
    g.strokeStyle = loss;
    g.lineWidth = 1;
    g.beginPath();
    for (let t = 0; t <= trades; t++) (t ? g.lineTo : g.moveTo).call(g, x(t), y(worst[t]));
    g.stroke();

    // Median
    g.strokeStyle = accent;
    g.lineWidth = compact ? 1.75 : 2.25;
    g.lineJoin = "round";
    g.beginPath();
    for (let t = 0; t <= trades; t++) (t ? g.lineTo : g.moveTo).call(g, x(t), y(result.p50[t]));
    g.stroke();

    // Crosshair
    if (hover !== null && !compact) {
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(Math.round(x(hover)) + 0.5, pad.t);
      g.lineTo(Math.round(x(hover)) + 0.5, height - pad.b);
      g.stroke();
      for (const [v, col] of [
        [result.p95[hover], accent],
        [result.p50[hover], accent],
        [result.p5[hover], accent],
      ] as const) {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x(hover), y(v), 3, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

  function onMove(e: React.PointerEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const t = Math.round(((px - pad.l) / (width - pad.l - pad.r)) * trades);
    setHover(t >= 0 && t <= trades ? t : null);
  }

  const tip = hover !== null && !compact ? hover : null;
  const fmt = (v: number) => `${v - 100 >= 0 ? "+" : "−"}${Math.abs(v - 100).toFixed(0)}%`;

  return (
    <div ref={wrap} style={{ position: "relative", width: "100%" }}>
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        style={{ width: "100%", height, touchAction: "pan-y" }}
        onPointerMove={compact ? undefined : onMove}
        onPointerLeave={() => setHover(null)}
      />
      {tip !== null && (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "var(--s-3)",
            left: x(tip) > width / 2 ? "auto" : x(tip) + 12,
            right: x(tip) > width / 2 ? width - x(tip) + 12 : "auto",
            padding: "var(--s-2) var(--s-3)",
            fontSize: "var(--data-n1)",
            pointerEvents: "none",
            boxShadow: "var(--shadow-m)",
          }}
        >
          <div className="num">Trade {tip}</div>
          <div className="num">95th pct {fmt(result.p95[tip])}</div>
          <div className="num accent">Median {fmt(result.p50[tip])}</div>
          <div className="num">5th pct {fmt(result.p5[tip])}</div>
        </div>
      )}
    </div>
  );
}
