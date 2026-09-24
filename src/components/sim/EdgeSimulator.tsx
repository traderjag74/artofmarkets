"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CONFIG } from "@/config/site";
import { profileFromQuery, profileToQuery, simulate } from "@/lib/sim/engine";
import { EquityChart } from "./EquityChart";
import { setSim, useSim } from "./store";
import { balance, pct, r } from "./format";

const S = CONFIG.simulator;
const L = S.limits;

function Slider(props: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field" style={{ gap: "var(--s-1)" }}>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <label htmlFor={props.id} style={{ fontSize: "var(--data-n1)" }}>{props.label}</label>
        <output htmlFor={props.id} className="num" style={{ fontSize: "var(--data-0)" }}>{props.display}</output>
      </div>
      <input
        id={props.id}
        type="range"
        className="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function EdgeSimulator() {
  const sim = useSim();
  const deferred = useDeferredValue(sim);
  const [view, setView] = useState<"chart" | "table">("chart");
  const [showCost, setShowCost] = useState(false);

  // Restore a profile carried back from the apply page (?w=…&r=…).
  useEffect(() => {
    const q = Object.fromEntries(new URLSearchParams(window.location.search));
    const p = profileFromQuery(q, L);
    if (p) setSim({ ...p, preset: null });
  }, []);

  const result = useMemo(
    () =>
      simulate({
        winRate: deferred.winRate,
        avgWinR: deferred.avgWinR,
        riskPct: deferred.riskPct,
        trades: deferred.trades,
        costR: deferred.costR,
        seed: deferred.seed,
        paths: S.paths,
        ruinDrawdown: S.ruinDrawdown,
      }),
    [deferred],
  );

  const preset = CONFIG.presets.find((p) => p.id === sim.preset);
  const edgePositive = result.expectancyR > 0;
  const ruinLevel = (1 - S.ruinDrawdown) * 100;
  const tableRows = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * deferred.trades));

  return (
    <div className="panel" style={{ padding: "clamp(var(--s-4), 3vw, var(--s-6))" }}>
      <div className="grid" style={{ gap: "var(--s-6)" }}>
        {/* Presets */}
        <div className="stack stack-s">
          <p className="eyebrow">Try a trader</p>
          <div className="cluster" style={{ ["--gap" as string]: "var(--s-2)" }}>
            {CONFIG.presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn btn-s ${sim.preset === p.id ? "btn-primary" : "btn-ghost"}`}
                aria-pressed={sim.preset === p.id}
                onClick={() => setSim({ ...p.values, preset: p.id })}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="small" aria-live="polite" style={{ minHeight: "3em" }}>
            {preset ? preset.lesson : "Move the sliders, or pick a trader above. Each path is one possible account, trading the same rules."}
          </p>
        </div>

        <div className="grid" style={{ gap: "var(--s-6)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))", alignItems: "start" }}>
          {/* Controls */}
          <div className="stack" style={{ ["--stack" as string]: "var(--s-4)" }}>
            <Slider id="sim-win" label="Win rate" value={sim.winRate} min={L.winRate[0]} max={L.winRate[1]} step={0.01} display={pct(sim.winRate)} onChange={(v) => setSim({ winRate: v, preset: null })} />
            <Slider id="sim-r" label="Average win, in R" value={sim.avgWinR} min={L.avgWinR[0]} max={L.avgWinR[1]} step={0.1} display={`${sim.avgWinR.toFixed(1)}R`} onChange={(v) => setSim({ avgWinR: v, preset: null })} />
            <Slider id="sim-risk" label="Risk per trade" value={sim.riskPct} min={L.riskPct[0]} max={L.riskPct[1]} step={0.25} display={`${sim.riskPct.toFixed(2)}%`} onChange={(v) => setSim({ riskPct: v, preset: null })} />
            <Slider id="sim-n" label="Number of trades" value={sim.trades} min={L.trades[0]} max={L.trades[1]} step={10} display={String(sim.trades)} onChange={(v) => setSim({ trades: v, preset: null })} />
            {showCost ? (
              <Slider id="sim-cost" label="Cost per trade (spread + fees)" value={sim.costR} min={L.costR[0]} max={L.costR[1]} step={0.01} display={`${sim.costR.toFixed(2)}R`} onChange={(v) => setSim({ costR: v, preset: null })} />
            ) : (
              <button type="button" className="btn-link small" style={{ justifySelf: "start" }} onClick={() => setShowCost(true)}>
                Adjust trading costs ({sim.costR.toFixed(2)}R per trade)
              </button>
            )}
            <p className="tiny muted">1R is the amount you lose when a trade hits its stop. A 2R winner makes twice that.</p>
          </div>

          {/* Results */}
          <dl className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)", margin: 0, alignContent: "start" }}>
            <div className="stat stat-hero" style={{ gridColumn: "1 / -1" }}>
              <dt className="stat-label">Chance of a 50% drawdown at some point</dt>
              <dd className={`stat-value ${result.ruinProbability >= 0.1 ? "loss" : ""}`} style={{ margin: 0 }}>{pct(result.ruinProbability)}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Expectancy per trade</dt>
              <dd className={`stat-value ${edgePositive ? "accent" : "loss"}`} style={{ margin: 0 }}>{r(result.expectancyR)}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Median ending balance (from 10,000)</dt>
              <dd className="stat-value" style={{ margin: 0 }}>{balance(result.medianEnd)}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Median worst drawdown</dt>
              <dd className="stat-value" style={{ margin: 0 }}>{pct(result.medianMaxDD)}</dd>
            </div>
            <div className="stat">
              <dt className="stat-label">Bad-luck drawdown (1 in 20)</dt>
              <dd className="stat-value" style={{ margin: 0 }}>{pct(result.p95MaxDD)}</dd>
            </div>
            <div className="stat" style={{ gridColumn: "1 / -1" }}>
              <dt className="stat-label">Longest losing streak to expect</dt>
              <dd className="stat-value" style={{ margin: 0 }}>{Math.round(result.medianLongestLosingStreak)} <span className="small muted" style={{ fontFamily: "var(--font-body)" }}>losses in a row</span></dd>
            </div>
          </dl>
        </div>

        {/* Chart */}
        <figure className="stack stack-s" style={{ margin: 0 }}>
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <figcaption className="figure-caption">
              {S.paths} simulated accounts · {deferred.trades} trades each ·{" "}
              <span className="accent">median</span>, <span style={{ background: "var(--c-accent-soft)", padding: "0 .3em" }}>5–95% range</span>,{" "}
              <span className="loss">worst path</span>
            </figcaption>
            <div className="cluster" style={{ ["--gap" as string]: "var(--s-2)" }}>
              <div className="tabs" role="group" aria-label="View">
                <button type="button" aria-pressed={view === "chart"} onClick={() => setView("chart")}>Chart</button>
                <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Table</button>
              </div>
              <button type="button" className="btn btn-ghost btn-s" onClick={() => setSim({ seed: (Math.random() * 2 ** 31) | 0 })}>
                Re-roll the dice
              </button>
            </div>
          </div>
          {view === "chart" ? (
            <EquityChart
              result={result}
              trades={deferred.trades}
              ruinLevel={ruinLevel}
              label={`Simulated equity curves. Median account ends at ${balance(result.medianEnd)} from 10,000; ${pct(result.ruinProbability)} of accounts suffer a 50% drawdown.`}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Simulated account balance by trade number, starting from 10,000</caption>
                <thead>
                  <tr>
                    <th scope="col">After trade</th>
                    <th scope="col" className="num">Worst 5%</th>
                    <th scope="col" className="num">Median</th>
                    <th scope="col" className="num">Best 5%</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((t) => (
                    <tr key={t}>
                      <td className="num">{t}</td>
                      <td className="num">{balance(result.p5[t])}</td>
                      <td className="num">{balance(result.p50[t])}</td>
                      <td className="num">{balance(result.p95[t])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="disclaimer notice">
            {CONFIG.risk.hypothetical}
          </p>
        </figure>

        <div className="cluster" style={{ justifyContent: "space-between", gap: "var(--s-4)" }}>
          <p className="small muted" style={{ maxWidth: "36rem" }}>
            {edgePositive
              ? "This edge is positive. Whether the account survives long enough to use it depends on the size of each bet."
              : "This combination loses money on average. No amount of position sizing fixes a negative edge."}
          </p>
          <Link className="btn btn-primary" href={`/apply?${profileToQuery(sim)}`}>
            Learn to build an edge like this
          </Link>
        </div>
      </div>
    </div>
  );
}
