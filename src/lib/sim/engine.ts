/**
 * Monte Carlo engine for the edge simulator. Pure and deterministic for a
 * given seed, so it runs identically in the browser, on the server and in tests.
 *
 * Model: fixed-fractional sizing. Each trade risks `riskPct` of *current*
 * equity. A win returns +avgWinR × risk, a loss −1 × risk, and every trade
 * pays `costR` × risk in spread and commission.
 */

export type SimParams = {
  winRate: number;
  avgWinR: number;
  riskPct: number;
  trades: number;
  paths: number;
  seed: number;
  costR: number;
  ruinDrawdown: number;
};

export type SimResult = {
  /** equity[path][trade], starting at 100 */
  equity: Float32Array[];
  /** per-trade percentile bands across paths */
  p5: Float32Array;
  p50: Float32Array;
  p95: Float32Array;
  worstPath: number;
  medianPath: number;
  expectancyR: number;
  medianEnd: number;
  medianMaxDD: number;
  p95MaxDD: number;
  ruinProbability: number;
  medianLongestLosingStreak: number;
  profitableShare: number;
};

/** mulberry32: tiny, fast, good enough for visual Monte Carlo. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Expectancy per trade in R: E = W×R − (1−W) − cost. */
export function expectancy(winRate: number, avgWinR: number, costR = 0): number {
  return winRate * avgWinR - (1 - winRate) - costR;
}

function quantile(sorted: ArrayLike<number>, q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function simulate(p: SimParams): SimResult {
  const rand = rng(p.seed);
  const n = p.trades;
  const risk = p.riskPct / 100;
  const equity: Float32Array[] = [];
  const maxDD = new Float64Array(p.paths);
  const streaks = new Float64Array(p.paths);
  let ruined = 0;

  for (let i = 0; i < p.paths; i++) {
    const path = new Float32Array(n + 1);
    let eq = 100;
    let peak = 100;
    let dd = 0;
    let streak = 0;
    let longest = 0;
    path[0] = eq;
    for (let t = 1; t <= n; t++) {
      const win = rand() < p.winRate;
      const r = (win ? p.avgWinR : -1) - p.costR;
      eq = Math.max(eq * (1 + risk * r), 0);
      if (win) streak = 0;
      else longest = Math.max(longest, ++streak);
      if (eq > peak) peak = eq;
      dd = Math.max(dd, 1 - eq / peak);
      path[t] = eq;
    }
    equity.push(path);
    maxDD[i] = dd;
    streaks[i] = longest;
    if (dd >= p.ruinDrawdown) ruined++;
  }

  const p5 = new Float32Array(n + 1);
  const p50 = new Float32Array(n + 1);
  const p95 = new Float32Array(n + 1);
  const column = new Float64Array(p.paths);
  for (let t = 0; t <= n; t++) {
    for (let i = 0; i < p.paths; i++) column[i] = equity[i][t];
    column.sort();
    p5[t] = quantile(column, 0.05);
    p50[t] = quantile(column, 0.5);
    p95[t] = quantile(column, 0.95);
  }

  const ends = equity.map((e) => e[n]);
  let worstPath = 0;
  for (let i = 1; i < p.paths; i++) if (ends[i] < ends[worstPath]) worstPath = i;
  const sortedEnds = [...ends].sort((a, b) => a - b);
  const medianEnd = quantile(sortedEnds, 0.5);
  let medianPath = 0;
  for (let i = 1; i < p.paths; i++) {
    if (Math.abs(ends[i] - medianEnd) < Math.abs(ends[medianPath] - medianEnd)) medianPath = i;
  }

  const sortedDD = Array.from(maxDD).sort((a, b) => a - b);
  const sortedStreaks = Array.from(streaks).sort((a, b) => a - b);

  return {
    equity,
    p5,
    p50,
    p95,
    worstPath,
    medianPath,
    expectancyR: expectancy(p.winRate, p.avgWinR, p.costR),
    medianEnd,
    medianMaxDD: quantile(sortedDD, 0.5),
    p95MaxDD: quantile(sortedDD, 0.95),
    ruinProbability: ruined / p.paths,
    medianLongestLosingStreak: quantile(sortedStreaks, 0.5),
    profitableShare: ends.filter((e) => e > 100).length / p.paths,
  };
}

// ── Profile hand-off between pages (URL query string) ───────────────────────

export type SimProfile = Pick<SimParams, "winRate" | "avgWinR" | "riskPct" | "trades" | "costR">;

export function profileToQuery(p: SimProfile): string {
  return new URLSearchParams({
    w: p.winRate.toFixed(2),
    r: p.avgWinR.toFixed(2),
    k: p.riskPct.toFixed(2),
    n: String(Math.round(p.trades)),
    c: p.costR.toFixed(2),
  }).toString();
}

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));

export function profileFromQuery(
  q: Record<string, string | string[] | undefined>,
  limits: { winRate: readonly [number, number]; avgWinR: readonly [number, number]; riskPct: readonly [number, number]; trades: readonly [number, number]; costR: readonly [number, number] },
): SimProfile | null {
  const num = (k: string) => {
    const v = q[k];
    const n = typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  };
  const w = num("w"), r = num("r"), k = num("k"), n = num("n"), c = num("c");
  if (w === null || r === null || k === null || n === null) return null;
  return {
    winRate: clamp(w, limits.winRate),
    avgWinR: clamp(r, limits.avgWinR),
    riskPct: clamp(k, limits.riskPct),
    trades: Math.round(clamp(n, limits.trades)),
    costR: clamp(c ?? 0, limits.costR),
  };
}
