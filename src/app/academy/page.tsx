import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/config/site";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { lessonsFor } from "@/content/courses";
import { COHORT_PLAN, FAQ, MEMBERSHIP_INCLUDES } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Academy",
  description: "Foundations, Risk & Process, Strategy Building and Desk Mentorship: a four-step trading education path taught by a desk that trades its own capital.",
};
export const revalidate = 300;

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Colombo" });

export default async function AcademyPage() {
  const cohorts = await db.cohort.findMany({
    where: { open: true, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { enrollments: { where: { active: true } } } } },
  });

  return (
    <>
      <section className="section" style={{ paddingBottom: "var(--s-7)" }}>
        <div className="container-wide stack stack-l" style={{ maxWidth: "60rem", marginInline: "auto" }}>
          <p className="eyebrow">The academy</p>
          <h1>Learn it in the order that keeps you trading.</h1>
          <p className="lede muted">First how markets work, then how to size and measure, then how to build and test a strategy, then ongoing feedback from the desk. Start free; move up only when the previous step makes sense.</p>
        </div>
      </section>

      {CONFIG.products.map((p, i) => {
        const lessons = lessonsFor(p.slug);
        return (
          <section key={p.slug} id={p.slug} className={`section-tight ${i % 2 ? "" : "bg-paper"}`} aria-labelledby={`${p.slug}-title`}>
            <div className="container-wide split">
              <div className="stack stack-l">
                <p className="eyebrow">Step {p.step}</p>
                <h2 id={`${p.slug}-title`} style={{ fontSize: "var(--step-3)" }}>{p.name}</h2>
                <p className="lede">{p.summary}</p>
                <dl className="grid" style={{ gridTemplateColumns: "auto 1fr", gap: "var(--s-2) var(--s-4)" }}>
                  <dt className="muted small">Format</dt><dd className="small">{p.format}</dd>
                  <dt className="muted small">Length</dt><dd className="small">{p.length}</dd>
                  <dt className="muted small">Price</dt>
                  <dd className="small num">
                    {p.priceUsd === 0 ? "Free" : `${formatMoney(p.priceUsd, "USD")} or ${formatMoney(p.priceLkr, "LKR")}${p.kind === "MEMBERSHIP" ? " per month" : ""}`}
                  </dd>
                </dl>
                <div className="cluster">
                  {p.priceUsd === 0 ? (
                    <Link href="/register?next=/learn/foundations" className="btn btn-primary">Start free</Link>
                  ) : (
                    <Link href={`/checkout/${p.slug}`} className="btn btn-primary">{p.kind === "MEMBERSHIP" ? "Become a member" : p.kind === "COHORT" ? "Reserve a seat" : "Enrol"}</Link>
                  )}
                  <Link href={`/apply?interest=${p.slug}`} className="btn btn-ghost">Ask a question first</Link>
                </div>
              </div>
              <div className="stack stack-l">
                <div className="stack stack-s">
                  <h3 style={{ fontSize: "var(--step-1)" }}>You will be able to</h3>
                  <ul className="stack stack-s">{p.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
                </div>
                {lessons.length > 0 && (
                  <div className="stack stack-s">
                    <h3 style={{ fontSize: "var(--step-1)" }}>Lessons</h3>
                    <ol className="stack stack-s">
                      {lessons.map((l) => (
                        <li key={l.slug}><strong>{l.title}</strong> <span className="muted small num">· {l.minutes} min</span><br /><span className="small muted">{l.summary}</span></li>
                      ))}
                    </ol>
                  </div>
                )}
                {p.kind === "COHORT" && (
                  <>
                    <div className="stack stack-s">
                      <h3 style={{ fontSize: "var(--step-1)" }}>Eight weeks</h3>
                      <ol className="stack stack-s">
                        {COHORT_PLAN.map((w) => (
                          <li key={w.week}><strong>{w.title}.</strong> <span className="small muted">{w.detail}</span></li>
                        ))}
                      </ol>
                    </div>
                    <div className="stack stack-s">
                      <h3 style={{ fontSize: "var(--step-1)" }}>Next cohorts</h3>
                      {cohorts.length === 0 ? (
                        <p className="muted small">New dates will be announced soon.</p>
                      ) : (
                        <table className="table">
                          <thead><tr><th>Cohort</th><th>Dates</th><th className="num">Seats left</th></tr></thead>
                          <tbody>
                            {cohorts.map((c) => (
                              <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{dateFmt.format(c.startsAt)} – {dateFmt.format(c.endsAt)}</td>
                                <td className="num">{Math.max(c.seats - c._count.enrollments, 0)} of {c.seats}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <p className="tiny muted">Sessions on Monday and Thursday, 19:00–20:30 Sri Lanka time. All sessions are recorded.</p>
                    </div>
                  </>
                )}
                {p.kind === "MEMBERSHIP" && (
                  <div className="stack stack-s">
                    <h3 style={{ fontSize: "var(--step-1)" }}>Included every month</h3>
                    <ul className="stack stack-s">{MEMBERSHIP_INCLUDES.map((m) => <li key={m}>{m}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <section className="section" aria-labelledby="instructors-title">
        <div className="container-wide stack stack-xl">
          <h2 id="instructors-title" style={{ fontSize: "var(--step-3)" }}>Your instructors</h2>
          <div className="grid grid-3">
            {CONFIG.instructors.map((p) => (
              <div key={p.name} className="card stack stack-s">
                <h3 style={{ fontSize: "var(--step-1)" }}>{p.name}</h3>
                <p className="eyebrow">{p.role}</p>
                <p className="small">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper" aria-labelledby="faq-title">
        <div className="container stack stack-l" style={{ maxWidth: "48rem" }}>
          <h2 id="faq-title" style={{ fontSize: "var(--step-3)" }}>Questions</h2>
          <div className="stack">
            {FAQ.map((f) => (
              <details key={f.q} className="card" open={f.q === "Will I make money?"}>
                <summary style={{ cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "var(--step-1)" }}>{f.q}</summary>
                <p style={{ marginTop: "var(--s-3)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
