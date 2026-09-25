import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { dt } from "./fmt";
import { paymentMode } from "@/lib/payments";

export default async function AdminOverview() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [students, newStudents, requests, paid, recent, failedEmails] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "STUDENT", createdAt: { gte: since } } }),
    db.application.count({ where: { status: "NEW" } }),
    db.order.groupBy({ by: ["currency"], where: { status: "PAID", paidAt: { gte: since } }, _sum: { amount: true }, _count: true }),
    db.order.findMany({ where: { status: "PAID" }, orderBy: { paidAt: "desc" }, take: 8, include: { user: true, product: true } }),
    db.emailLog.count({ where: { status: "FAILED", createdAt: { gte: since } } }),
  ]);
  const provider = paymentMode();
  return (
    <div className="stack stack-xl">
      <h1 style={{ fontSize: "var(--step-3)" }}>Overview</h1>
      {(provider !== "payhere" || !process.env.RESEND_API_KEY) && (
        <p className="notice notice-risk">
          {provider === "mock" && "Payments are in TEST mode: no real money is taken. "}
          {provider === "off" && "Payments are switched off: paid programmes show \"opening soon\". "}
          {!process.env.RESEND_API_KEY && "Emails are not being sent (no RESEND_API_KEY); they're stored under Emails."}
        </p>
      )}
      <dl className="grid grid-4">
        <div className="stat card"><dt className="stat-label">Students</dt><dd className="stat-value">{students}</dd></div>
        <div className="stat card"><dt className="stat-label">New students, 30 days</dt><dd className="stat-value">{newStudents}</dd></div>
        <div className="stat card"><dt className="stat-label">Open requests</dt><dd className="stat-value"><Link href="/admin/requests">{requests}</Link></dd></div>
        <div className="stat card">
          <dt className="stat-label">Revenue, 30 days</dt>
          <dd className="stat-value" style={{ margin: 0, fontSize: "var(--data-1)" }}>
            {paid.length === 0 ? "—" : paid.map((p) => <div key={p.currency}>{formatMoney(p._sum.amount ?? 0, p.currency)} <span className="small muted">({p._count})</span></div>)}
          </dd>
        </div>
      </dl>
      {failedEmails > 0 && <p className="notice notice-risk">{failedEmails} emails failed to send in the last 30 days. <Link href="/admin/emails">Check the email log</Link>.</p>}
      <div className="stack">
        <h2 style={{ fontSize: "var(--step-2)" }}>Latest enrolments</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Paid</th><th>Student</th><th>Programme</th><th className="num">Amount</th><th>Ref.</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{o.paidAt && dt.format(o.paidAt)}</td>
                  <td><Link href={`/admin/students/${o.userId}`}>{o.user.name}</Link></td>
                  <td>{o.product.name}</td>
                  <td className="num">{formatMoney(o.amount, o.currency)}</td>
                  <td className="num">{o.reference}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="muted">No paid orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
