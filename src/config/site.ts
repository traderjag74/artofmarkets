/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIG — every business assumption on the site lives here.
 *
 *  Anything marked PLACEHOLDER is invented for the prototype and must be
 *  replaced with real, substantiated information before launch. Regulator
 *  wording in particular must be reviewed by a Sri Lankan securities lawyer.
 *
 *  Prices are stored in minor units (cents). Products are synced into the
 *  database by `npm run db:seed`; the slug is the stable key, so renaming a
 *  product here and re-seeding updates it in place.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CONFIG = {
  site: {
    name: "Art of Markets",
    domain: "artofmarkets.com",
    tagline: "A trading desk that teaches.",
    // PLACEHOLDER company details — replace with registered details.
    company: "Art of Markets (Private) Limited",
    companyRegNo: "PV 000000 (placeholder)",
    address: "Colombo, Sri Lanka",
    email: "academy@artofmarkets.com",
    youtube: "https://www.youtube.com/@artofmarkets",
  },

  /** Monte Carlo "edge simulator" defaults. */
  simulator: {
    winRate: 0.4, // probability a trade is a winner
    avgWinR: 1.8, // average winner, in multiples of risk (R)
    riskPct: 3, // % of current equity risked per trade
    trades: 200, // trades per simulated path
    paths: 200, // number of simulated equity curves
    seed: 20240917, // fixed seed so every visitor sees the same first draw
    ruinDrawdown: 0.5, // a 50% peak-to-trough drawdown counts as "blown"
    costR: 0.05, // spread + commission per trade, in R
    limits: {
      winRate: [0.2, 0.8],
      avgWinR: [0.5, 4],
      riskPct: [0.25, 5],
      trades: [50, 500],
      costR: [0, 0.3],
    },
  },

  presets: [
    {
      id: "scalper",
      name: "Scalper chasing a 70% win rate",
      values: { winRate: 0.7, avgWinR: 0.4, riskPct: 2, costR: 0.08 },
      lesson:
        "Winning seven trades out of ten feels great, but tiny winners and trading costs turn it into a slow leak.",
    },
    {
      id: "trend",
      name: "Trend follower (35%, 3R)",
      values: { winRate: 0.35, avgWinR: 3, riskPct: 1, costR: 0.05 },
      lesson:
        "Losing most trades is normal when winners are three times the size of losers. Expect long losing streaks.",
    },
    {
      id: "oversized",
      name: "Same edge, too much risk",
      values: { winRate: 0.35, avgWinR: 3, riskPct: 5, costR: 0.05 },
      lesson:
        "The same positive edge, sized at 5% a trade. The expectancy did not change. The chance of a 50% drawdown did.",
    },
  ],

  /**
   * Risk warning. PLACEHOLDER wording — Art of Markets is not licensed by the
   * Securities and Exchange Commission of Sri Lanka to give investment advice.
   * If a licence is obtained, add the regulator name and licence number.
   */
  risk: {
    short:
      "Trading involves substantial risk of loss. Most retail traders lose money. Education only, not financial advice.",
    regulator: null as null | { name: string; licence: string },
    // Only fill this if a broker/regulator requires you to publish a loss rate.
    lossRatePct: null as null | number,
    hypothetical:
      "Hypothetical results. These are computer-simulated outcomes of a random process, not the results of any real trading account, student or strategy. Simulated results have inherent limitations: they do not reflect real execution, slippage, liquidity or the psychological pressure of trading real money. No representation is made that any account will or is likely to achieve results similar to those shown.",
  },

  /** Paid and free programmes. PLACEHOLDER prices, research-based (see README). */
  products: [
    {
      slug: "foundations",
      name: "Foundations",
      kind: "COURSE" as const,
      priceUsd: 0,
      priceLkr: 0,
      step: 1,
      format: "Self-paced, online",
      length: "5 lessons · about 3 hours",
      summary:
        "How markets actually work: who is on the other side of your trade, how orders fill, and what a spread costs you.",
      outcomes: [
        "Explain bid, ask, spread and slippage in your own words",
        "Choose between market, limit and stop orders for a given situation",
        "Read a price chart without indicators",
        "Describe how forex, crypto, equities and futures differ in hours, leverage and cost",
      ],
    },
    {
      slug: "risk-and-process",
      name: "Risk & Process",
      kind: "COURSE" as const,
      priceUsd: 14900,
      priceLkr: 4490000,
      step: 2,
      format: "Self-paced, online, with a monthly live Q&A",
      length: "6 lessons · about 8 hours plus exercises",
      summary:
        "Position sizing, expectancy, journaling and the habits that keep an account alive long enough to learn.",
      outcomes: [
        "Size any position from a stop distance and a fixed account risk",
        "Calculate the expectancy of your own trades in R",
        "Keep a trade journal that shows you what to fix",
        "Write a one-page trading plan with rules you can follow",
      ],
    },
    {
      slug: "strategy-building",
      name: "Strategy Building",
      kind: "COHORT" as const,
      priceUsd: 69000,
      priceLkr: 19900000,
      step: 3,
      format: "Live cohort, 8 weeks, two sessions a week (recorded)",
      length: "16 live sessions · max. 24 students",
      summary:
        "Turn an idea into a tested, written strategy: hypothesis, rules, backtest, forward test, review.",
      outcomes: [
        "Write entry, exit and sizing rules that another person could follow",
        "Backtest a strategy by hand and in a spreadsheet without fooling yourself",
        "Tell the difference between an edge and a lucky sample",
        "Present your strategy for review by a desk trader",
      ],
    },
    {
      slug: "desk-mentorship",
      name: "Desk Mentorship",
      kind: "MEMBERSHIP" as const,
      priceUsd: 2900,
      priceLkr: 890000,
      step: 4,
      format: "Monthly membership, cancel any time",
      length: "Weekly desk review · monthly 1:1 journal review",
      summary:
        "Sit in on the desk's weekly review, bring your journal, and get specific feedback from people who trade.",
      outcomes: [
        "Get your journal reviewed by a desk trader every month",
        "Hear how the desk reviews its own week, including losing trades",
        "Keep a routine going with a group that takes process seriously",
      ],
    },
  ],

  /** Cohort dates for Strategy Building. PLACEHOLDER dates. */
  cohorts: [
    { code: "SB-2026-11", product: "strategy-building", name: "November 2026 cohort", startsAt: "2026-11-09", endsAt: "2027-01-04", seats: 24 },
    { code: "SB-2027-02", product: "strategy-building", name: "February 2027 cohort", startsAt: "2027-02-08", endsAt: "2027-04-05", seats: 24 },
  ],

  membershipDays: 31,
  membershipGraceDays: 5,

  markets: ["Forex", "Crypto", "Equities", "Futures"],

  experienceLevels: [
    "Never traded",
    "Under 1 year",
    "1–3 years",
    "More than 3 years",
  ],

  hoursPerWeek: ["Under 3 hours", "3–6 hours", "6–10 hours", "More than 10 hours"],

  goals: [
    "Understand the basics before I risk money",
    "Find out why I keep losing",
    "Build and test a strategy of my own",
    "Get feedback from people who trade",
  ],

  contactMoments: [
    "Weekday morning (Sri Lanka time)",
    "Weekday afternoon (Sri Lanka time)",
    "Weekday evening (Sri Lanka time)",
    "Weekend",
    "Email only, please",
  ],

  /** PLACEHOLDER proof points. Replace with real, verifiable numbers. */
  proof: {
    yearsTrading: 12,
    studentsTaught: 480,
    reviewScore: 4.8,
    reviewCount: 96,
    reviewPlatform: "Google reviews",
  },

  /** PLACEHOLDER instructors. Replace with real people and real backgrounds. */
  instructors: [
    {
      name: "Instructor A (placeholder)",
      role: "Head of desk · futures and FX",
      bio: "Twelve years trading index futures and major FX pairs with own capital. Previously on a proprietary trading desk. Teaches risk and process.",
    },
    {
      name: "Instructor B (placeholder)",
      role: "Equities and crypto",
      bio: "Nine years trading equities, later crypto. Background in statistics. Teaches testing, and why most backtests lie.",
    },
    {
      name: "Instructor C (placeholder)",
      role: "Student mentor",
      bio: "Former academy student, now trading part-time and running the weekly journal reviews.",
    },
  ],

  /** PLACEHOLDER testimonials — only about learning, never about money. */
  testimonials: [
    {
      quote:
        "The position-sizing lesson changed how I think about every trade. I finally understand why my old account kept shrinking.",
      name: "Student, Colombo",
      programme: "Risk & Process",
    },
    {
      quote:
        "Nobody here showed me a winning screenshot. They showed me their journal, losses included. That's why I trust them.",
      name: "Student, Dubai",
      programme: "Strategy Building",
    },
    {
      quote:
        "Clear, patient teaching. My journal reviews are specific about what to fix, not generic motivation.",
      name: "Student, Kandy",
      programme: "Desk Mentorship",
    },
  ],
} as const;

export type Product = (typeof CONFIG.products)[number];
export type ProductSlug = Product["slug"];

export function productBySlug(slug: string): Product | undefined {
  return CONFIG.products.find((p) => p.slug === slug);
}
