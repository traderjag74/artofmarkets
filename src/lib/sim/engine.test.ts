import { describe, expect, it } from "vitest";
import { expectancy, profileFromQuery, profileToQuery, simulate } from "./engine";
import { CONFIG } from "@/config/site";

const base = { winRate: 0.4, avgWinR: 2, riskPct: 1, trades: 200, paths: 300, seed: 1, costR: 0, ruinDrawdown: 0.5 };

describe("expectancy", () => {
  it("40% at 2R is positive", () => expect(expectancy(0.4, 2)).toBeCloseTo(0.2));
  it("70% at 0.4R is negative", () => expect(expectancy(0.7, 0.4)).toBeCloseTo(-0.02));
  it("subtracts costs", () => expect(expectancy(0.5, 1, 0.1)).toBeCloseTo(-0.1));
});

describe("simulate", () => {
  it("is deterministic for a seed", () => {
    expect(simulate(base).medianEnd).toBe(simulate(base).medianEnd);
  });
  it("orders the percentile bands", () => {
    const r = simulate(base);
    for (let t = 0; t <= base.trades; t++) {
      expect(r.p5[t]).toBeLessThanOrEqual(r.p50[t]);
      expect(r.p50[t]).toBeLessThanOrEqual(r.p95[t]);
    }
  });
  it("oversizing the same edge raises ruin risk", () => {
    const small = simulate({ ...base, winRate: 0.35, avgWinR: 3, riskPct: 1 });
    const big = simulate({ ...base, winRate: 0.35, avgWinR: 3, riskPct: 5 });
    expect(big.ruinProbability).toBeGreaterThan(small.ruinProbability);
    expect(big.medianMaxDD).toBeGreaterThan(small.medianMaxDD);
  });
  it("a positive edge with small risk usually grows", () => {
    expect(simulate(base).medianEnd).toBeGreaterThan(100);
  });
});

describe("profile query", () => {
  it("round-trips and clamps", () => {
    const q = Object.fromEntries(new URLSearchParams(profileToQuery({ winRate: 0.45, avgWinR: 9, riskPct: 2, trades: 200, costR: 0.05 })));
    const p = profileFromQuery(q, CONFIG.simulator.limits)!;
    expect(p.avgWinR).toBe(4);
    expect(p.winRate).toBeCloseTo(0.45);
  });
  it("returns null when missing", () => expect(profileFromQuery({}, CONFIG.simulator.limits)).toBeNull());
});
