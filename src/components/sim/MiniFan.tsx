"use client";

import { useMemo } from "react";
import { CONFIG } from "@/config/site";
import { simulate, type SimProfile } from "@/lib/sim/engine";
import { EquityChart } from "./EquityChart";
import { pct, r } from "./format";

export function MiniFan({ profile }: { profile: SimProfile }) {
  const S = CONFIG.simulator;
  const result = useMemo(
    () => simulate({ ...profile, paths: 120, seed: S.seed, ruinDrawdown: S.ruinDrawdown }),
    [profile, S.seed, S.ruinDrawdown],
  );
  return (
    <div className="stack stack-s">
      <EquityChart result={result} trades={profile.trades} ruinLevel={(1 - S.ruinDrawdown) * 100} height={140} compact label="Miniature of your simulated equity curves" />
      <dl className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)", margin: 0 }}>
        <div className="stat"><dt className="stat-label">Expectancy</dt><dd className={`num ${result.expectancyR > 0 ? "accent" : "loss"}`} style={{ margin: 0 }}>{r(result.expectancyR)}</dd></div>
        <div className="stat"><dt className="stat-label">Chance of 50% drawdown</dt><dd className="num" style={{ margin: 0 }}>{pct(result.ruinProbability)}</dd></div>
      </dl>
    </div>
  );
}
