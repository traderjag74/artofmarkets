import Link from "next/link";
import { CONFIG } from "@/config/site";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { NOTES } from "@/content/notes";
import { EdgeSimulator } from "@/components/sim/EdgeSimulator";
import { ExpectancyGrid } from "@/components/sim/ExpectancyGrid";
import { VolSurface } from "@/components/visual/VolSurface";
import { InkShader } from "@/components/visual/InkShader";
import { LiveList } from "@/components/home/LiveList";

export const revalidate = 300;

const principles = [
  { title: "Risk is decided before the entry", body: "Every trade has a stop and a size before it's placed. Risk per trade stays between 0.25% and 1%." },
  { title: "Losses are recorded like wins", body: "Every trade goes into the journal with its result in R, including the ones we'd rather forget." },
  { title: "Rules are written when we're calm", body: "Drawdown rules, daily loss limits and review routines are decided in advance, not in the moment." },
  { title: "We teach process, not predictions", body: "We don't give signals or tell students what to buy. We teach how to build and judge a strategy of your own." },
];

export default async function HomePage() {
  const live = await db.liveSession.findMany({
    where: { published: true, startsAt: { gte: new Date(Date.now() - 3 * 3600_000) } },
    orderBy: { startsAt: "asc" },
    take: 2,
  });
  const paid = CONFIG.products;

  return (
    <>
      {/* 1 · Hero: edge simulator */}
      <section id="simulator" className="section" style={{ paddingTop: "var(--s-8)" }} aria-labelledby="hero-title">
        <div className="container-wide stack stack-l">
          <div className="split split-rev" style={{ alignItems: "end", gap: "var(--s-6)" }}>
            <div className="stack stack-l">
              <p className="eyebrow">Edge simulator · try it, no sign-up</p>
              <h1 id="hero-title" style={{ fontSize: "var(--step-4)" }}>Most traders aren't wrong too often. They risk too much when they are.</h1>
            </div>
            <p className="lede muted">
              Win rate, reward-to-risk and position size decide whether an account survives. Set them below and watch {CONFIG.simulator.paths} accounts
              trade the same rules. The default is a typical beginner: a small edge, sized too big.
            </p>
          </div>
          <EdgeSimulator />
        </div>
      </section>

      {/* 2 · Win rate is not the point */}
      <section className="section bg-paper" aria-labelledby="wr-title">
        <div className="container-wide split">
          <div className="stack stack-l">
            <p className="eyebrow">The idea behind the simulator</p>
            <h2 id="wr-title">Win rate is not the point.</h2>
            <p className="lede">What matters is how much you make when you're right, compared with how much you lose when you're wrong.</p>
            <p>
              That's called <strong>expectancy</strong>: the average result per trade, measured in R (the amount you risk). Win 40% of the time
              with winners twice the size of your losers, and every trade is worth +0.2R on average. Win 70% of the time with small winners, and you can
              slowly lose money while feeling successful.
            </p>
            <p className="notice notice-ok num" style={{ fontSize: "var(--data-0)" }}>E = win rate × average win − loss rate × 1R − costs</p>
            <p className="muted">
              Expectancy tells you <em>whether</em> a strategy makes money. Position size decides whether you're still trading when it does.
            </p>
          </div>
          <ExpectancyGrid />
        </div>
      </section>

      {/* 3 · Academy path */}
      <section className="section" aria-labelledby="path-title">
        <div className="container-wide stack stack-xl">
          <div className="cluster" style={{ justifyContent: "space-between", alignItems: "end" }}>
            <div className="stack stack-s" style={{ maxWidth: "40rem" }}>
              <p className="eyebrow">The academy</p>
              <h2 id="path-title">Four steps, in the order the desk learned them.</h2>
            </div>
            <Link href="/academy" className="btn btn-ghost">See the full programme</Link>
          </div>
          <ol className="steps">
            {paid.map((p) => (
              <li key={p.slug} className="step">
                <span className="step-n">Step {p.step}</span>
                <h3>{p.name}</h3>
                <p className="small muted">{p.format} · {p.length}</p>
                <p className="small">{p.summary}</p>
                <div>
                  <p className="small" style={{ fontWeight: 500 }}>You will be able to:</p>
                  <ul>
                    {p.outcomes.slice(0, 3).map((o) => <li key={o}>{o}</li>)}
                  </ul>
                </div>
                <p className="num small">
                  {p.priceUsd === 0 ? "Free" : `${formatMoney(p.priceUsd, "USD")}${p.kind === "MEMBERSHIP" ? " / month" : ""}`}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · How the desk trades */}
      <section className="section bg-paper" aria-labelledby="desk-title">
        <div className="container-wide split-rev split">
          <div className="stack stack-l">
            <p className="eyebrow">How the desk trades</p>
            <h2 id="desk-title">We don't post winning trades on social media. Here's why.</h2>
            <p className="lede">A screenshot shows one outcome and hides the risk, the losing trades and the sample size. We'd rather show you how we work.</p>
            <div className="grid grid-2" style={{ ["--gap" as string]: "var(--s-5)" }}>
              {principles.map((p) => (
                <div key={p.title} className="stack stack-s">
                  <h3 style={{ fontSize: "var(--step-1)" }}>{p.title}</h3>
                  <p className="small muted">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
          <figure className="stack stack-s" style={{ margin: 0 }}>
            <dl className="journal" aria-label="Sample journal entry">
              <div className="journal-row"><dt>Date</dt><dd className="num">2026-06-18 (historical)</dd></div>
              <div className="journal-row"><dt>Market</dt><dd>Equity index future, 1-hour chart</dd></div>
              <div className="journal-row"><dt>Setup</dt><dd>Trend pullback to prior breakout zone</dd></div>
              <div className="journal-row"><dt>Reason</dt><dd>Higher highs and lows on the daily chart; first pullback after a breakout, into the old resistance zone.</dd></div>
              <div className="journal-row"><dt>Stop · size</dt><dd>Below the zone, 14 points. Sized to 0.5% of the account.</dd></div>
              <div className="journal-row"><dt>Result</dt><dd className="num loss">−1.1R (0.1R slippage on the stop)</dd></div>
              <div className="journal-row"><dt>Plan followed?</dt><dd>Yes.</dd></div>
              <div className="journal-row"><dt>What went wrong</dt><dd>Entered 20 minutes before a scheduled data release. Our plan says no entries within 30 minutes of high-impact news. Rule was followed on sizing, broken on timing.</dd></div>
              <div className="journal-row"><dt>Fix</dt><dd>Add the economic calendar check to the pre-trade checklist.</dd></div>
            </dl>
            <figcaption className="figure-caption">A real-format page from the desk journal. Losing trades are logged and reviewed the same way as winners.</figcaption>
          </figure>
        </div>
      </section>

      {/* 5 · Volatility has shape */}
      <section className="section" aria-labelledby="vol-title">
        <div className="container-wide split">
          <div className="stack stack-l">
            <p className="eyebrow">Market structure</p>
            <h2 id="vol-title">Volatility has shape.</h2>
            <p className="lede">Markets don't expect every price move to be equally likely. You can see it in how options are priced.</p>
            <p>
              This surface shows <em>implied volatility</em>: how much movement option prices are expecting, for strikes far from and near to today's price
              (left to right) and for expiries from weeks to two years away (front to back).
            </p>
            <ul className="stack stack-s">
              <li><strong>The smile.</strong> Big moves in either direction are priced as more likely than a normal curve suggests.</li>
              <li><strong>The skew.</strong> Sharp falls are feared more than sharp rises, so the downside wing sits higher.</li>
              <li><strong>The term structure.</strong> The smile flattens further out in time.</li>
            </ul>
            <p className="muted small">Why it matters for you: your stop will occasionally be hit by a move bigger than you thought possible. Size so that you survive it. Drag the surface to rotate it. (Illustrative shape, generated in code, not live data.)</p>
          </div>
          <VolSurface />
        </div>
      </section>

      {/* 6 · Trust */}
      <section className="section night" aria-labelledby="trust-title">
        <InkShader />
        <div className="container-wide stack stack-xl">
          <div className="stack stack-s" style={{ maxWidth: "40rem" }}>
            <p className="eyebrow">Who teaches</p>
            <h2 id="trust-title">A small desk that trades its own capital, and teaches what it does.</h2>
          </div>
          <dl className="grid grid-4" style={{ margin: 0 }}>
            <div className="stat"><dt className="stat-label">Years trading on the desk</dt><dd className="stat-value" style={{ margin: 0 }}>{CONFIG.proof.yearsTrading}</dd></div>
            <div className="stat"><dt className="stat-label">Students taught</dt><dd className="stat-value" style={{ margin: 0 }}>{CONFIG.proof.studentsTaught}</dd></div>
            <div className="stat"><dt className="stat-label">{CONFIG.proof.reviewPlatform}</dt><dd className="stat-value" style={{ margin: 0 }}>{CONFIG.proof.reviewScore} / 5 <span className="small">({CONFIG.proof.reviewCount})</span></dd></div>
            <div className="stat"><dt className="stat-label">Regulatory status</dt><dd style={{ margin: 0 }} className="small">{CONFIG.risk.regulator ? `${CONFIG.risk.regulator.name} · ${CONFIG.risk.regulator.licence}` : "Education provider. Not a licensed investment adviser. We don't manage money. [Placeholder: confirm with counsel]"}</dd></div>
          </dl>
          <div className="grid grid-3">
            {CONFIG.testimonials.map((t) => (
              <figure key={t.quote} className="card-flat stack stack-s" style={{ margin: 0 }}>
                <blockquote style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--step-1)", lineHeight: "var(--lh-snug)" }}>“{t.quote}”</blockquote>
                <figcaption className="small muted">{t.name} · {t.programme}. Individual experience about the teaching; not a claim about trading results.</figcaption>
              </figure>
            ))}
          </div>
          <p className="tiny muted">Proof points and testimonials shown are placeholders for the prototype and will be replaced with verified figures.</p>
        </div>
      </section>

      {/* 7 · Live + notes */}
      <section className="section" aria-labelledby="live-title">
        <div className="container-wide split split-even">
          <div className="stack stack-l">
            <p className="eyebrow">Free, on YouTube</p>
            <h2 id="live-title" style={{ fontSize: "var(--step-3)" }}>Watch the desk review its week.</h2>
            <p className="muted">Live sessions on how we size, journal and review trades, using historical charts. Education only: no signals, no trade calls.</p>
            <LiveList sessions={live} />
            <div className="cluster">
              <a href={CONFIG.site.youtube} className="btn btn-ghost" rel="noopener">Subscribe on YouTube</a>
              <Link href="/live" className="small">All live sessions</Link>
            </div>
          </div>
          <div className="stack stack-l">
            <p className="eyebrow">Desk notes</p>
            <h2 style={{ fontSize: "var(--step-3)" }}>From the journal</h2>
            <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {NOTES.map((n) => (
                <li key={n.slug} className="stack stack-s rule-top" style={{ paddingTop: "var(--s-4)" }}>
                  <p className="eyebrow num">{n.date} · {n.author}</p>
                  <h3 style={{ fontSize: "var(--step-1)" }}><Link href={`/notes/${n.slug}`} style={{ color: "var(--c-ink)" }}>{n.title}</Link></h3>
                  <p className="small muted">{n.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8 · Final CTA */}
      <section className="section bg-paper" aria-labelledby="cta-title">
        <div className="container stack stack-l center" style={{ maxWidth: "44rem" }}>
          <h2 id="cta-title">Start with the free Foundations module.</h2>
          <p className="lede muted">Five lessons on how markets work and what trading really costs. No card needed. If you'd rather talk first, book a short intro call with the desk.</p>
          <div className="cluster" style={{ justifyContent: "center" }}>
            <Link href="/register?next=/learn/foundations" className="btn btn-primary">Start Foundations free</Link>
            <Link href="/apply" className="btn btn-ghost">Book an intro call</Link>
          </div>
        </div>
      </section>
    </>
  );
}
