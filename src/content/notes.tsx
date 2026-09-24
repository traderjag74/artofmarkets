import type { ComponentType } from "react";

export type Note = {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  summary: string;
  Body: ComponentType;
};

/** Desk notes: process and education, never trade calls. Authors are PLACEHOLDERS (see CONFIG.instructors). */
export const NOTES: Note[] = [
  {
    slug: "why-we-dont-post-pnl",
    title: "Why we don't post P&L screenshots",
    date: "2026-09-15",
    author: "Instructor A (placeholder)",
    authorRole: "Head of desk",
    summary: "A screenshot shows one outcome. It hides the risk taken, the losing trades and the sample size.",
    Body: () => (
      <>
        <p>A winning screenshot tells you almost nothing. It doesn't show how much was risked, how many losing trades came before it, or whether the account survived the month. It is a selected outcome, and selection is the oldest trick in trading marketing.</p>
        <p>We teach people to judge strategies by expectancy over a meaningful sample, with drawdowns in view. Posting our best days would teach the opposite habit. So we show process instead: how we size, how we journal, and how we review losing weeks.</p>
        <p>If we ever publish performance, it will be complete, independently verified and shown with its drawdowns, not as a highlight.</p>
      </>
    ),
  },
  {
    slug: "the-week-we-cut-size",
    title: "The week we cut size in half, and why",
    date: "2026-09-08",
    author: "Instructor A (placeholder)",
    authorRole: "Head of desk",
    summary: "A walk through a pre-written drawdown rule, triggered in a real review. Nothing heroic, which is the point.",
    Body: () => (
      <>
        <p>Our trend strategy's plan says: at −6R from the equity peak, halve risk per trade until we're back to −3R. Two weeks ago we hit −6.2R after a run of seven losses in choppy, range-bound markets.</p>
        <p>We didn't debate it. The rule was written before the drawdown, when nobody was upset. Size came down, we kept taking the same setups, and the review focused on one question: were these losses the strategy, or were they us?</p>
        <p>The journal said the strategy: every trade followed the plan, and a range-bound month is exactly the environment where this strategy is expected to lose. That's a normal drawdown, not a broken edge. Writing rules in advance is what lets you tell the two apart.</p>
      </>
    ),
  },
  {
    slug: "win-rate-is-a-trap",
    title: "Win rate is a trap",
    date: "2026-09-01",
    author: "Instructor B (placeholder)",
    authorRole: "Equities and crypto",
    summary: "Why a 70% win rate can lose money, and a 35% win rate can be a good strategy.",
    Body: () => (
      <>
        <p>New students almost always ask about win rate first. It's the wrong first question. A strategy that wins 70% of the time with small winners and full-size losers can lose money slowly, while one that wins 35% of the time with 3R winners can grow steadily.</p>
        <p>The number that matters is expectancy: win rate × average win − loss rate × average loss, minus costs. Then the question becomes whether your position size lets you survive the losing streaks that come with that expectancy.</p>
        <p>Try the two presets in our simulator side by side. The one that feels better is not the one that works.</p>
      </>
    ),
  },
];

export function noteBySlug(slug: string) {
  return NOTES.find((n) => n.slug === slug);
}
