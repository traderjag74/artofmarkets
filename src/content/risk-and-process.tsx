import type { Lesson } from "./types";

export const riskAndProcess: Lesson[] = [
  {
    slug: "thinking-in-r",
    title: "Thinking in R",
    minutes: 60,
    summary: "Measure every trade by what you risked, not by money won or lost.",
    Body: () => (
      <>
        <p><strong>R</strong> is the amount you planned to lose on a trade if your stop is hit. If you risk 50 on a trade and make 100, that trade was <strong>+2R</strong>. If you lose 50, it was <strong>−1R</strong>. If slippage turns the loss into 60, it was −1.2R.</p>
        <h2>Why R instead of money</h2>
        <ul>
          <li>It makes trades comparable across markets, position sizes and account sizes.</li>
          <li>It separates two questions that beginners mix up: <em>is my strategy any good?</em> (measured in R) and <em>how big should I bet?</em> (position sizing).</li>
          <li>It takes some of the emotion out. "−1R" is a planned business expense; "I lost 20,000 rupees" feels like a disaster.</li>
        </ul>
        <h2>Your R-multiple list</h2>
        <p>From today, every trade you take gets one number: its result in R. Twenty trades later you'll have a list like this:</p>
        <p className="num">+2.1, −1, −1, +0.4, −1, +3.0, −1, −1.2, +1.8, −1, …</p>
        <p>That list is the raw material for everything else in this course: expectancy, drawdowns and position size all come from it.</p>
        <p className="notice">Exercise: take your last 20 trades (or 20 paper trades). Write each one as an R-multiple. If you didn't have a stop, you'll find that hard, and that's the first lesson.</p>
      </>
    ),
  },
  {
    slug: "position-sizing",
    title: "Position sizing from a stop and a fixed risk",
    minutes: 90,
    summary: "One formula that works in every market, with worked examples for stocks, FX and futures.",
    Body: () => (
      <>
        <p>Decide how much of your account you are willing to lose on one trade. Most professional desks keep this between 0.25% and 1%. Then let the stop distance decide the size:</p>
        <p className="notice notice-ok num">Position size = (Account × Risk %) ÷ (Stop distance × Value per unit of price)</p>
        <h2>Worked examples (account 5,000, risk 1% = 50)</h2>
        <table className="table">
          <thead><tr><th>Market</th><th>Stop distance</th><th>Value per unit</th><th>Size</th></tr></thead>
          <tbody>
            <tr><td>Stock at 42.00, stop 40.50</td><td>1.50 per share</td><td>1 per share</td><td className="num">33 shares</td></tr>
            <tr><td>EUR/USD, 25-pip stop</td><td>25 pips</td><td>10 per pip per standard lot</td><td className="num">0.20 lots</td></tr>
            <tr><td>Micro index future, 8-point stop</td><td>8 points</td><td>5 per point per contract</td><td className="num">1 contract (risk 40)</td></tr>
          </tbody>
        </table>
        <p>Always round <em>down</em>. If the minimum size puts you over your risk limit, skip the trade or find a tighter, still logical stop. Never widen the risk to fit the trade.</p>
        <h2>Why the percentage matters so much</h2>
        <p>Ten losses in a row happen to every trader eventually. At 1% risk they cost about 10% of the account, which needs an 11% gain to recover. At 5% risk they cost 40%, which needs a 67% gain to recover. Same strategy, same bad luck, very different outcome.</p>
        <p className="notice">Use the simulator: set "Trend follower", then change only the risk per trade from 1% to 5%. Nothing about the strategy changed.</p>
      </>
    ),
  },
  {
    slug: "expectancy-and-sample-size",
    title: "Expectancy, and how many trades you need to trust it",
    minutes: 75,
    summary: "The one number that tells you whether a strategy makes money, and why 20 trades prove nothing.",
    Body: () => (
      <>
        <p>Expectancy is the average R you make per trade:</p>
        <p className="notice notice-ok num">E = (Win rate × Average win in R) − (Loss rate × Average loss in R) − costs</p>
        <p>A strategy that wins 40% of the time with 2R winners and 1R losers has E = 0.4 × 2 − 0.6 × 1 = +0.2R per trade before costs. Over 100 trades, that's about +20R. A strategy that wins 70% of the time with 0.4R winners has E = 0.28 − 0.30 = −0.02R: it loses money while <em>feeling</em> like it wins.</p>
        <h2>Small samples lie</h2>
        <p>With 20 trades, a strategy with zero edge can easily show +5R or −5R from luck alone. Rough rules we use on the desk:</p>
        <ul>
          <li>Under 30 trades: you know almost nothing.</li>
          <li>30–100 trades: you can spot a strategy that is clearly broken.</li>
          <li>100+ trades in the same market conditions: you can start to trust a positive number.</li>
        </ul>
        <p>Press "Re-roll the dice" in the simulator a few times with only 50 trades. Watch how much the same rules can differ from one run to the next.</p>
        <p className="notice">Exercise: calculate the expectancy of your R-multiple list from lesson 1. Then write down how confident you are in it, given the sample size.</p>
      </>
    ),
  },
  {
    slug: "drawdowns-and-streaks",
    title: "Drawdowns and losing streaks",
    minutes: 60,
    summary: "How long bad runs really are, so you don't abandon a good strategy at the worst time.",
    Body: () => (
      <>
        <p>If you win 40% of your trades, you lose 60% of them. Over 100 trades, the chance of seeing at least one run of losses is higher than most people expect:</p>
        <table className="table">
          <thead><tr><th>Losses in a row</th><th className="num">Chance in 100 trades at 40% win rate</th><th className="num">At 35% win rate</th></tr></thead>
          <tbody>
            <tr><td>5</td><td className="num">98%</td><td className="num">99%</td></tr>
            <tr><td>6</td><td className="num">87%</td><td className="num">96%</td></tr>
            <tr><td>8</td><td className="num">49%</td><td className="num">69%</td></tr>
            <tr><td>10</td><td className="num">21%</td><td className="num">37%</td></tr>
          </tbody>
        </table>
        <p>So a trend follower should <em>expect</em> eight losses in a row at some point. If you haven't planned for it, you'll probably quit or double your size right before the winners come.</p>
        <h2>Plan the drawdown before it happens</h2>
        <ul>
          <li>Write down the drawdown you expect (use the simulator's "bad-luck drawdown").</li>
          <li>Decide in advance what you'll do at that level: cut size by half, pause and review, or stop.</li>
          <li>Separate "the strategy stopped working" from "normal bad luck" using your journal, not your mood.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "the-trade-journal",
    title: "A trade journal that tells you what to fix",
    minutes: 60,
    summary: "What to record before, during and after every trade, and how to review it weekly.",
    Body: () => (
      <>
        <p>A journal is not a diary. It is data you will analyse. Record the same fields for every trade:</p>
        <table className="table">
          <thead><tr><th>When</th><th>Field</th></tr></thead>
          <tbody>
            <tr><td>Before</td><td>Setup name, reason in one sentence, entry, stop, target, planned R, size</td></tr>
            <tr><td>During</td><td>Anything you changed and why (moved stop, partial exit)</td></tr>
            <tr><td>After</td><td>Result in R, whether you followed the plan (yes/no), one thing to repeat or fix</td></tr>
          </tbody>
        </table>
        <h2>The weekly review</h2>
        <ol>
          <li>Total R for the week, and total R for trades where you followed your plan.</li>
          <li>Expectancy per setup, once each setup has enough trades.</li>
          <li>Your most expensive mistake of the week, in R.</li>
          <li>One change for next week. Only one.</li>
        </ol>
        <p>Most traders find that their "rule-breaking" trades cost more than their strategy's losing trades. That's good news: behaviour is easier to fix than an edge is to find.</p>
      </>
    ),
  },
  {
    slug: "your-trading-plan",
    title: "Your one-page trading plan",
    minutes: 90,
    summary: "Put it together: markets, times, setups, risk limits and review routine on one page.",
    Body: () => (
      <>
        <p>Your plan should fit on one page, so you can actually follow it. Use these headings:</p>
        <ol>
          <li><strong>Markets and times.</strong> Which instruments, which sessions, when you do not trade (for example around major news).</li>
          <li><strong>Setups.</strong> For each: the conditions, entry trigger, stop placement and exit rule, written clearly enough that someone else could follow them.</li>
          <li><strong>Risk.</strong> Risk per trade (%), maximum daily loss (in R), maximum open risk at once.</li>
          <li><strong>Drawdown rules.</strong> What you do at −5R, −10R and your planned bad-luck drawdown.</li>
          <li><strong>Routine.</strong> Pre-session checklist, journal fields, weekly review time.</li>
        </ol>
        <div className="notice notice-risk">A plan is not a promise of profit. It is a set of rules that makes your results measurable, so you can tell whether you have an edge at all.</div>
        <p>Bring your plan to the monthly live Q&amp;A. If you want to build and test new setups with a group and a desk trader, that's what the Strategy Building cohort is for.</p>
      </>
    ),
  },
];
