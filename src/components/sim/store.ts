"use client";

import { useSyncExternalStore } from "react";
import { CONFIG } from "@/config/site";
import type { SimProfile } from "@/lib/sim/engine";

/** Shared simulator state, so the hero and the expectancy grid stay in sync. */
export type SimState = SimProfile & { seed: number; preset: string | null };

const s = CONFIG.simulator;
let state: SimState = {
  winRate: s.winRate,
  avgWinR: s.avgWinR,
  riskPct: s.riskPct,
  trades: s.trades,
  costR: s.costR,
  seed: s.seed,
  preset: null,
};
const listeners = new Set<() => void>();

export function setSim(patch: Partial<SimState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useSim(): SimState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}
