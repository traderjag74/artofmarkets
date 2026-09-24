import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { refundOrderAction } from "../actions";
import { dt } from "../fmt";

const STATUSES: OrderStatus[] = ["PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await db.order.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { user: true, product: true, cohort: true },
  });
  return (
    <div className="stack stack-l">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "var(--step-3)" }}>Orders</h1>
        <div className="cluster small">
          <Link href="/admin/orders">All</Link>
          {STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`}>{s.toLowerCase()}</Link>)}
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Created</th><th>Ref.</th><th>Student</th><th>Programme</th><th className="num">Amount</th><th>Provider</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{dt.format(o.createdAt)}</td>
                <td className="num">{o.reference}</td>
                <td><Link href={`/admin/students/${o.userId}`}>{o.user.name}</Link></td>
                <td>{o.product.name}{o.cohort && <div className="tiny muted">{o.cohort.name}</div>}</td>
                <td className="num">{formatMoney(o.amount, o.currency)}</td>
                <td>{o.provider}{o.providerRef && <div className="tiny muted num">{o.providerRef}</div>}</td>
                <td><span className={`badge ${o.status === "PAID" ? "badge-accent" : o.status === "REFUNDED" || o.status === "FAILED" ? "badge-loss" : ""}`}>{o.status}</span></td>
                <td>
                  {o.status === "PAID" && (
                    <form action={refundOrderAction}>
                      <input type="hidden" name="reference" value={o.reference} />
                      <button className="btn-link small" title="Marks the order refunded and removes access. Issue the actual refund in the PayHere merchant portal.">Mark refunded</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} className="muted">No orders.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="tiny muted">"Mark refunded" removes the student's access. Send the money back in the PayHere merchant portal.</p>
    </div>
  );
}
