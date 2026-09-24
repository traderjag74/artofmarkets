import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/config/site";
import { db } from "@/lib/db";
import { LiveList } from "@/components/home/LiveList";

export const metadata: Metadata = {
  title: "Live sessions",
  description: "Free live sessions on YouTube: desk reviews, position sizing and Q&A. Education only; no signals or trade calls.",
};
export const revalidate = 300;

export default async function LivePage() {
  const now = new Date(Date.now() - 3 * 3600_000);
  const [upcoming, past] = await Promise.all([
    db.liveSession.findMany({ where: { published: true, startsAt: { gte: now } }, orderBy: { startsAt: "asc" } }),
    db.liveSession.findMany({ where: { published: true, startsAt: { lt: now } }, orderBy: { startsAt: "desc" }, take: 12 }),
  ]);
  return (
    <section className="section">
      <div className="container-wide split">
        <div className="stack stack-l">
          <p className="eyebrow">Free, on YouTube</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>Live sessions</h1>
          <p className="lede muted">Watch the desk review how it sized, managed and journaled its trades, and bring your questions about risk and process.</p>
          <div className="notice">
            <strong>How we run live sessions.</strong> We review closed trades and use historical charts. We don't call live trades, give buy or sell signals, or recommend brokers. Everything is general education, not advice for your situation.
          </div>
          <div className="cluster">
            <a href={CONFIG.site.youtube} className="btn btn-primary" rel="noopener">Subscribe on YouTube</a>
            <Link href="/register?next=/learn/foundations" className="btn btn-ghost">Start Foundations free</Link>
          </div>
        </div>
        <div className="stack stack-l">
          <h2 style={{ fontSize: "var(--step-2)" }}>Coming up</h2>
          <LiveList sessions={upcoming} />
          {past.length > 0 && (
            <>
              <h2 style={{ fontSize: "var(--step-2)" }}>Recent</h2>
              <LiveList sessions={past} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
