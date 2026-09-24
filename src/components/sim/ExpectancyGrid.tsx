"use client";

import { expectancy } from "@/lib/sim/engine";
import { setSim, useSim } from "./store";

const WIN = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
const RR = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

/** Win rate × reward grid. Teal = positive expectancy, oxblood = negative. Linked to the simulator. */
export function ExpectancyGrid() {
  const sim = useSim();
  const nearestW = WIN.reduce((a, b) => (Math.abs(b - sim.winRate) < Math.abs(a - sim.winRate) ? b : a));
  const nearestR = RR.reduce((a, b) => (Math.abs(b - sim.avgWinR) < Math.abs(a - sim.avgWinR) ? b : a));

  return (
    <figure className="stack stack-s" style={{ margin: 0 }}>
      <div className="table-wrap">
        <table className="table" style={{ tableLayout: "fixed", minWidth: "36rem", fontSize: "var(--data-n2)" }}>
          <caption className="sr-only">Expectancy per trade in R, for each win rate and average win (after {sim.costR.toFixed(2)}R costs)</caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: "4.5rem" }}>Win ↓ / Rate →</th>
              {WIN.map((w) => (
                <th key={w} scope="col" className="num" style={{ padding: "var(--s-1)" }}>{Math.round(w * 100)}%</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RR.map((rr) => (
              <tr key={rr}>
                <th scope="row" className="num" style={{ padding: "var(--s-1) var(--s-2)" }}>{rr.toFixed(1)}R</th>
                {WIN.map((w) => {
                  const e = expectancy(w, rr, sim.costR);
                  const strength = Math.min(Math.abs(e) / 1.2, 1);
                  const active = w === nearestW && rr === nearestR;
                  const bg = e > 0.005 ? "var(--c-accent)" : e < -0.005 ? "var(--c-loss)" : "var(--c-line)";
                  return (
                    <td key={w} style={{ padding: 0, borderBottom: "1px solid var(--c-bg)" }}>
                      <button
                        type="button"
                        onClick={() => setSim({ winRate: w, avgWinR: rr, preset: null })}
                        title={`${Math.round(w * 100)}% at ${rr}R: ${e >= 0 ? "+" : ""}${e.toFixed(2)}R per trade`}
                        aria-label={`Set win rate ${Math.round(w * 100)}% and average win ${rr}R, expectancy ${e.toFixed(2)}R`}
                        style={{
                          width: "100%",
                          aspectRatio: "1.4",
                          border: active ? "2px solid var(--c-ink)" : "0",
                          background: `color-mix(in srgb, ${bg} ${Math.round(12 + strength * 70)}%, var(--c-card))`,
                          color: strength > 0.55 ? "var(--c-on-accent)" : "var(--c-ink)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--data-n2)",
                          cursor: "pointer",
                        }}
                      >
                        {e >= 0 ? "+" : "−"}
                        {Math.abs(e).toFixed(1)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="figure-caption">
        Expectancy per trade in R, after {sim.costR.toFixed(2)}R of costs. The outlined cell is your current simulator setting; click any cell to try it.
      </figcaption>
    </figure>
  );
}
