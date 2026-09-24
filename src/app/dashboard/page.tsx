import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { activeEnrollments } from "@/lib/access";
import { formatMoney } from "@/lib/money";
import { lessonsFor } from "@/content/courses";
import { productBySlug } from "@/config/site";
import { ResendVerification } from "@/components/ResendVerification";
import { LiveList } from "@/components/home/LiveList";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const user = await requireUser("/dashboard");
  const [enrollments, progress, orders, live] = await Promise.all([
    activeEnrollments(user.id),
    db.lessonProgress.findMany({ where: { userId: user.id } }),
    db.order.findMany({ where: { userId: user.id, status: { in: ["PAID", "REFUNDED"] } }, include: { product: true }, orderBy: { createdAt: "desc" } }),
    db.liveSession.findMany({ where: { published: true, startsAt: { gte: new Date(Date.now() - 3 * 3600_000) } }, orderBy: { startsAt: "asc" }, take: 3 }),
  ]);
  const owned = new Set(enrollments.map((e) => e.product.slug));
  const nextStep = ["risk-and-process", "strategy-building", "desk-mentorship"].find((s) => !owned.has(s));
  const nextInfo = nextStep ? productBySlug(nextStep) : null;

  return (
    <section className="section">
      <div className="container-wide stack stack-xl">
        <div className="stack stack-s">
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>Hello, {user.name.split(" ")[0]}.</h1>
        </div>

        {q.welcome && <p className="notice notice-ok">Your account is ready and Foundations is open. We've sent you an email to confirm your address.</p>}
        {q.verified && <p className="notice notice-ok">Thanks, your email address is confirmed.</p>}
        {q.reset && <p className="notice notice-ok">Your password has been changed.</p>}
        {q.already && <p className="notice notice-ok">You already have access to that programme.</p>}
        {q.verify === "expired" && <p className="notice notice-risk">That confirmation link has expired or was already used.</p>}
        {!user.emailVerifiedAt && (
          <div className="notice notice-risk cluster" style={{ justifyContent: "space-between" }}>
            <span>Please confirm your email address ({user.email}). You'll need it to enrol in paid programmes.</span>
            <ResendVerification />
          </div>
        )}

        <div className="split split-rev">
          <div className="stack stack-l">
            <h2 style={{ fontSize: "var(--step-2)" }}>Your programmes</h2>
            {enrollments.map((e) => {
              const lessons = lessonsFor(e.product.slug);
              const done = progress.filter((p) => p.courseSlug === e.product.slug).length;
              return (
                <div key={e.id} className="card stack stack-s">
                  <div className="cluster" style={{ justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "var(--step-1)" }}>{e.product.name}</h3>
                    <span className="badge">{e.product.kind === "COURSE" ? "Self-paced" : e.product.kind === "COHORT" ? "Cohort" : "Membership"}</span>
                  </div>
                  {lessons.length > 0 && (
                    <>
                      <div className="progress" aria-hidden="true"><span style={{ width: `${(done / lessons.length) * 100}%` }} /></div>
                      <p className="small muted num">{done} of {lessons.length} lessons complete</p>
                      <Link href={`/learn/${e.product.slug}`} className="btn btn-primary btn-s" style={{ width: "fit-content" }}>{done ? "Continue" : "Start"}</Link>
                    </>
                  )}
                  {e.cohort && (
                    <p className="small">{e.cohort.name}: {dateFmt.format(e.cohort.startsAt)} to {dateFmt.format(e.cohort.endsAt)}. Mondays and Thursdays, 19:00 Sri Lanka time. Joining links arrive by email a week before the start.</p>
                  )}
                  {e.product.kind === "MEMBERSHIP" && e.expiresAt && (
                    <p className="small">Access runs until {dateFmt.format(e.expiresAt)} and renews automatically each month. To cancel, reply to any receipt email or write to us; access continues to the end of the paid month.</p>
                  )}
                </div>
              );
            })}
            {nextInfo && (
              <div className="card-flat stack stack-s">
                <p className="eyebrow">Suggested next step</p>
                <h3 style={{ fontSize: "var(--step-1)" }}>{nextInfo.name}</h3>
                <p className="small muted">{nextInfo.summary}</p>
                <div className="cluster">
                  <Link href={`/academy#${nextInfo.slug}`} className="btn btn-ghost btn-s">See details</Link>
                  <Link href={`/apply?interest=${nextInfo.slug}`} className="small">Ask the desk first</Link>
                </div>
              </div>
            )}
          </div>

          <div className="stack stack-l">
            <h2 style={{ fontSize: "var(--step-2)" }}>Live sessions</h2>
            <LiveList sessions={live} />
            <h2 style={{ fontSize: "var(--step-2)" }}>Receipts</h2>
            {orders.length === 0 ? (
              <p className="small muted">No payments yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Date</th><th>Programme</th><th className="num">Amount</th><th>Ref.</th></tr></thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{dateFmt.format(o.paidAt ?? o.createdAt)}</td>
                        <td>{o.product.name}{o.status === "REFUNDED" && <span className="badge badge-loss" style={{ marginLeft: "var(--s-2)" }}>Refunded</span>}</td>
                        <td className="num">{formatMoney(o.amount, o.currency)}</td>
                        <td className="num">{o.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link href="/dashboard/account" className="small">Account settings</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
