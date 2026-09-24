import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { profileFromQuery, profileToQuery } from "@/lib/sim/engine";
import { MiniFan } from "@/components/sim/MiniFan";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "Book an intro call",
  description: "Tell us where you are with trading and we'll help you choose where to start. No personal investment advice, no questions about your capital.",
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const profile = profileFromQuery(q, CONFIG.simulator.limits);
  const user = await getCurrentUser();
  const interest = typeof q.interest === "string" && CONFIG.products.some((p) => p.slug === q.interest) ? q.interest : "intro-call";

  return (
    <section className="section">
      <div className="container-wide split">
        <aside className="stack stack-l">
          <div className="stack stack-s">
            <p className="eyebrow">Intro call · application</p>
            <h1 style={{ fontSize: "var(--step-4)" }}>Tell us where you are. We'll tell you where to start.</h1>
            <p className="muted">A 20-minute call with a member of the desk. Free, no obligation, and no sales pressure.</p>
          </div>
          <div className="panel stack" style={{ padding: "var(--s-5)" }}>
            <p className="eyebrow">Your simulator profile</p>
            {profile ? (
              <>
                <dl className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-2) var(--s-4)" }}>
                  <dt className="stat-label">Win rate</dt><dd className="num">{Math.round(profile.winRate * 100)}%</dd>
                  <dt className="stat-label">Average win</dt><dd className="num">{profile.avgWinR.toFixed(1)}R</dd>
                  <dt className="stat-label">Risk per trade</dt><dd className="num">{profile.riskPct.toFixed(2)}%</dd>
                  <dt className="stat-label">Trades</dt><dd className="num">{profile.trades}</dd>
                </dl>
                <MiniFan profile={profile} />
                <p className="tiny muted">Hypothetical, simulated results; not the results of any real account. We'll use this to understand how you think about risk, and we'll attach it to your request.</p>
                <Link href={`/?${profileToQuery(profile)}#simulator`} className="small">Change it in the simulator</Link>
              </>
            ) : (
              <p className="small">
                You haven't used the simulator yet. It takes two minutes and shows how win rate, reward and position size shape an account.{" "}
                <Link href="/#simulator">Try it first</Link>, or just fill in the form.
              </p>
            )}
          </div>
        </aside>
        <div className="panel" style={{ padding: "clamp(var(--s-5), 3vw, var(--s-7))" }}>
          <ApplyForm
            defaults={{ name: user?.name, email: user?.email, country: user?.country ?? undefined, interest }}
            sim={profile ? profileToQuery(profile) : null}
            loggedIn={!!user}
          />
        </div>
      </div>
    </section>
  );
}
