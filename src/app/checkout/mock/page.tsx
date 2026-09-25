import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { mockPay } from "../actions";
import { paymentMode } from "@/lib/payments";

export const metadata = { title: "Test payment", robots: { index: false } };

export default async function MockCheckout({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  if (paymentMode() !== "mock") notFound();
  const { ref = "" } = await searchParams;
  const user = await requireUser();
  const order = await db.order.findUnique({ where: { reference: ref }, include: { product: true } });
  if (!order || order.userId !== user.id) notFound();
  return (
    <section className="section">
      <div className="container form-shell panel stack stack-l" style={{ padding: "var(--s-6)" }}>
        <p className="badge badge-loss">Test mode</p>
        <h1 style={{ fontSize: "var(--step-3)" }}>Simulated payment page</h1>
        <p className="muted">This page stands in for the payment provider in development. No money moves.</p>
        <dl className="grid" style={{ gridTemplateColumns: "auto 1fr", gap: "var(--s-2) var(--s-4)" }}>
          <dt className="muted small">Order</dt><dd className="num">{order.reference}</dd>
          <dt className="muted small">Item</dt><dd>{order.product.name}</dd>
          <dt className="muted small">Amount</dt><dd className="num">{formatMoney(order.amount, order.currency)}</dd>
        </dl>
        <form action={mockPay} className="cluster">
          <input type="hidden" name="ref" value={order.reference} />
          <button className="btn btn-primary" name="outcome" value="success">Simulate successful payment</button>
          <button className="btn btn-ghost" name="outcome" value="fail">Simulate declined card</button>
        </form>
      </div>
    </section>
  );
}
