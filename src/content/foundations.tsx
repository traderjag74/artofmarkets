import type { Lesson } from "./types";

export const foundations: Lesson[] = [
  {
    slug: "who-is-on-the-other-side",
    title: "Who is on the other side of your trade?",
    minutes: 30,
    summary: "Exchanges, brokers and market makers, and why short-term trading is a contest before costs.",
    Body: () => (
      <>
        <p>Every trade has two sides. When you buy, someone sells to you. Before you learn a single setup, it helps to know who that someone usually is.</p>
        <h2>Exchanges and over-the-counter markets</h2>
        <p>Equities and futures mostly trade on <strong>exchanges</strong>: a central order book where buyers and sellers are matched and every trade is reported. Spot forex and many crypto products trade <strong>over the counter (OTC)</strong>: you trade with a dealer or broker, who may pass your order on to a bigger dealer or take the other side themselves.</p>
        <p>That difference matters. On an exchange you can see a public price and volume. OTC, the price you see is the price <em>your</em> broker shows you.</p>
        <h2>The participants</h2>
        <ul>
          <li><strong>Market makers</strong> quote a buy and a sell price all day and earn the difference. They are the most frequent counterparty for small traders.</li>
          <li><strong>Institutions</strong> (funds, banks, corporations) move large amounts, often for reasons that have nothing to do with short-term price moves: hedging, rebalancing, paying for imports.</li>
          <li><strong>Other traders</strong>, from professionals with faster tools to beginners on their first account.</li>
        </ul>
        <h2>A contest before costs</h2>
        <p>Over a few minutes or days, one trader's gain is roughly another's loss. Add spreads, commissions and financing charges, and the group of short-term traders as a whole loses money. That is the honest starting point: an edge has to be big enough to beat other people <em>and</em> pay the costs.</p>
        <p className="notice">Exercise: for one market you are interested in, find out whether it trades on an exchange or OTC, and who your counterparty would be if you placed a trade today.</p>
      </>
    ),
  },
  {
    slug: "bid-ask-and-costs",
    title: "Bid, ask, spread and the real cost of a trade",
    minutes: 35,
    summary: "What you pay every time you click, and how to express it in a way you can compare.",
    Body: () => (
      <>
        <p>Every market shows two prices. The <strong>bid</strong> is the highest price someone will pay you. The <strong>ask</strong> is the lowest price someone will sell to you. The gap between them is the <strong>spread</strong>.</p>
        <h2>The costs that add up</h2>
        <table className="table">
          <thead><tr><th>Cost</th><th>What it is</th><th>Where you see it</th></tr></thead>
          <tbody>
            <tr><td>Spread</td><td>Buy at the ask, sell at the bid</td><td>All markets</td></tr>
            <tr><td>Commission</td><td>A fee per trade or per contract</td><td>Equities, futures, some FX accounts</td></tr>
            <tr><td>Financing / swap</td><td>Interest for holding leveraged positions overnight</td><td>FX, CFDs, crypto perpetuals</td></tr>
            <tr><td>Slippage</td><td>Getting filled at a worse price than you expected</td><td>Fast markets, stop orders, thin markets</td></tr>
          </tbody>
        </table>
        <h2>Express cost in R</h2>
        <p>A cost only means something relative to the size of your trade. Suppose your stop loss is 20 pips away and the round-trip spread plus commission is 1.2 pips. Each trade costs you 1.2 ÷ 20 = <strong>0.06R</strong>, where R is the amount you lose if the stop is hit.</p>
        <p>Halve the stop to 10 pips and the same cost becomes 0.12R. This is why very short-term strategies need a much bigger edge: the costs eat a bigger share of every trade.</p>
        <p className="notice">Try it in the simulator on the home page: set costs to 0.15R and watch a strategy that looked profitable turn negative.</p>
      </>
    ),
  },
  {
    slug: "order-types",
    title: "Order types: market, limit and stop",
    minutes: 30,
    summary: "Which order to use, when, and what can go wrong with each.",
    Body: () => (
      <>
        <h2>Market order</h2>
        <p>"Fill me now, at whatever the price is." You are certain to get filled, but not certain of the price. In a fast or thin market, the fill can be several ticks away from what you saw.</p>
        <h2>Limit order</h2>
        <p>"Fill me at this price or better." You control the price, but you may not get filled at all. Limit orders are how you add liquidity; market makers use them all day.</p>
        <h2>Stop order</h2>
        <p>"When price reaches this level, send a market order." Stops are used to exit losing trades and to enter breakouts. Because a stop becomes a market order, it can slip. If a market opens far beyond your stop after a weekend or news event (a <strong>gap</strong>), you are filled at the first available price, which can be much worse.</p>
        <h2>Stop-limit order</h2>
        <p>"When price reaches this level, send a limit order." It protects you from bad fills but can leave you <em>without</em> a fill while price keeps running against you. For protective stops, most traders accept slippage rather than risk no exit.</p>
        <div className="notice notice-risk">A stop loss limits your planned loss. It does not guarantee it. Gaps and fast markets can make a loss larger than 1R, so size positions with some room for that.</div>
        <p className="notice">Exercise: for each order type, write one situation where you would use it and one where you would not.</p>
      </>
    ),
  },
  {
    slug: "reading-price",
    title: "Reading a price chart without indicators",
    minutes: 40,
    summary: "Candles, timeframes, trends, ranges and levels: the basic vocabulary of price.",
    Body: () => (
      <>
        <p>Indicators are calculations made from price. Before adding any, learn to read price itself.</p>
        <h2>Candles</h2>
        <p>Each candle shows four numbers for a period: open, high, low and close. A long body means price moved decisively; long wicks mean price went somewhere and was rejected. One candle tells you little. A sequence tells you more.</p>
        <h2>Timeframes</h2>
        <p>The same market can be trending on a daily chart and ranging on a 5-minute chart. Pick the timeframe that matches how long you plan to hold, and check one timeframe above it for context.</p>
        <h2>Trends and ranges</h2>
        <ul>
          <li><strong>Uptrend:</strong> higher highs and higher lows.</li>
          <li><strong>Downtrend:</strong> lower highs and lower lows.</li>
          <li><strong>Range:</strong> price moves between a ceiling and a floor.</li>
        </ul>
        <p>Most of the time, most markets are in ranges. A strategy built for trends will lose in ranges, and the other way around. Knowing which environment you're in is half the work.</p>
        <h2>Levels are zones, not lines</h2>
        <p>Support and resistance are areas where price has turned before. Treat them as zones a few ticks wide, not exact prices. Price often pokes through a level before turning.</p>
        <p className="notice">Exercise: open a daily chart of any market. Mark the last three swing highs and lows. Is the market trending up, down, or ranging? Write down why.</p>
      </>
    ),
  },
  {
    slug: "four-markets",
    title: "Forex, crypto, equities and futures compared",
    minutes: 40,
    summary: "Trading hours, leverage, costs and rules: how the four markets we teach differ.",
    Body: () => (
      <>
        <table className="table">
          <thead><tr><th></th><th>Forex</th><th>Crypto</th><th>Equities</th><th>Futures</th></tr></thead>
          <tbody>
            <tr><th>Where</th><td>OTC via brokers</td><td>Exchanges and brokers</td><td>Exchanges</td><td>Exchanges</td></tr>
            <tr><th>Hours</th><td>24h, Mon–Fri</td><td>24/7</td><td>Exchange hours</td><td>Nearly 24h, Mon–Fri</td></tr>
            <tr><th>Typical leverage</th><td>High</td><td>Varies widely</td><td>Low or none</td><td>Set by margin</td></tr>
            <tr><th>Main costs</th><td>Spread, swap</td><td>Fees, spread, funding</td><td>Commission, spread</td><td>Commission, spread</td></tr>
            <tr><th>Price transparency</th><td>Broker quotes</td><td>Per exchange</td><td>Public</td><td>Public</td></tr>
          </tbody>
        </table>
        <h2>Leverage cuts both ways</h2>
        <p>Leverage lets you control a large position with a small deposit. It doesn't change your edge; it changes how fast you win or lose. With high leverage, a small move against you can wipe out your deposit. We teach position sizing before we teach any strategy for exactly this reason.</p>
        <h2>Rules depend on where you live</h2>
        <p>What you can trade, and through whom, depends on your country. Two examples for Sri Lankan residents: the Central Bank of Sri Lanka has warned that forex trading and sending money abroad for it without its approval may break the Foreign Exchange Act, and that payment cards may not be used for crypto transactions. Other countries have their own rules. Check what applies to you before opening any account, and prefer brokers regulated in your jurisdiction.</p>
        <div className="notice notice-risk">We don't recommend brokers or exchanges and we don't receive referral commissions from them. That keeps our teaching independent.</div>
        <p>You've finished Foundations. The next step is learning to size positions and measure your results in R, so that one bad week can't end your trading. That's what the Risk & Process course covers.</p>
      </>
    ),
  },
];
