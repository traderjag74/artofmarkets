import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { countryName } from "@/lib/countries";
import { formatMoney } from "@/lib/money";
import { grantAccess, revokeAccess } from "../../actions";
import { d, dt } from "../../fmt";

export default async function Student({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.user.findUnique({
    where: { id },
    include: {
      enrollments: { include: { product: true, cohort: true }, orderBy: { createdAt: "asc" } },
      orders: { include: { product: true }, orderBy: { createdAt: "desc" } },
      progress: true,
      applications: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!u) notFound();
  const products = await db.product.findMany({ orderBy: { priceUsd: "asc" } });
  return (
    <div className="stack stack-xl">
      <div className="stack stack-s">
        <Link href="/admin/students" className="small">← Students</Link>
        <h1 style={{ fontSize: "var(--step-3)" }}>{u.name}</h1>
        <p className="muted">{u.email} · {countryName(u.country)} · joined {d.format(u.createdAt)} · email {u.emailVerifiedAt ? "verified" : "not verified"} · marketing {u.marketingOptIn ? "opted in" : "no"}</p>
      </div>
      <div className="grid grid-2">
        <div className="stack">
          <h2 style={{ fontSize: "var(--step-2)" }}>Access</h2>
          <table className="table">
            <thead><tr><th>Programme</th><th>Source</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {u.enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{e.product.name}{e.cohort && <div className="tiny muted">{e.cohort.name}</div>}</td>
                  <td>{e.source}</td>
                  <td>{e.active ? (e.expiresAt ? `Until ${d.format(e.expiresAt)}` : "Active") : "Revoked"}</td>
                  <td>
                    {e.active && (
                      <form action={revokeAccess}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn-link small">Revoke</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form action={grantAccess} className="cluster">
            <input type="hidden" name="userId" value={u.id} />
            <label htmlFor="productId" className="sr-only">Programme</label>
            <select id="productId" name="productId" className="select" style={{ width: "auto" }}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className="btn btn-ghost btn-s">Grant access</button>
          </form>
          <p className="tiny muted">Lessons completed: {u.progress.length}</p>
        </div>
        <div className="stack">
          <h2 style={{ fontSize: "var(--step-2)" }}>Orders</h2>
          <table className="table">
            <thead><tr><th>Date</th><th>Programme</th><th className="num">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {u.orders.map((o) => (
                <tr key={o.id}><td>{dt.format(o.createdAt)}</td><td>{o.product.name}<div className="tiny muted num">{o.reference}</div></td><td className="num">{formatMoney(o.amount, o.currency)}</td><td>{o.status}</td></tr>
              ))}
              {u.orders.length === 0 && <tr><td colSpan={4} className="muted">No orders.</td></tr>}
            </tbody>
          </table>
          <h2 style={{ fontSize: "var(--step-2)" }}>Requests</h2>
          {u.applications.length === 0 ? <p className="small muted">None.</p> : u.applications.map((a) => (
            <p key={a.id} className="small"><span className="num">{a.reference}</span> · {a.interest} · {a.status} · {d.format(a.createdAt)}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
