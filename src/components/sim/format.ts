export const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
export const r = (v: number, digits = 2) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}R`;
export const balance = (index: number) => Math.round(index * 100).toLocaleString("en-US");
