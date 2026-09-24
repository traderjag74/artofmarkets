import Link from "next/link";
import { db } from "@/lib/db";
import { dt } from "../fmt";

export default async function Emails() {
  const emails = await db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="stack stack-l">
      <h1 style={{ fontSize: "var(--step-3)" }}>Emails</h1>
      <p className="small muted">Every email the site sends is logged here. <strong>LOGGED</strong> means no email provider is configured, so it wasn't sent.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Sent</th><th>To</th><th>Subject</th><th>Template</th><th>Status</th></tr></thead>
          <tbody>
            {emails.map((e) => (
              <tr key={e.id}>
                <td>{dt.format(e.createdAt)}</td>
                <td>{e.to}</td>
                <td><Link href={`/admin/emails/${e.id}`}>{e.subject}</Link></td>
                <td>{e.template}</td>
                <td><span className={`badge ${e.status === "SENT" ? "badge-accent" : e.status === "FAILED" ? "badge-loss" : ""}`}>{e.status}</span>{e.error && <div className="tiny loss">{e.error}</div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
