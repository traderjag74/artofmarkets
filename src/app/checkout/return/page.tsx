import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Payment status", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutReturn({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const user = await requireUser();
  const order = await db.order.findUnique({ where: { reference: ref }, include: { product: true, cohort: true } });
  if (!order || order.userId !== user.id) {
    return <section className="section"><div className="container form-shell"><p>We couldn't find that order. <Link href="/dashboard">Go to your dashboard</Link>.</p></div></section>;
  }
  const paid = order.status === "PAID";
  const pending = order.status === "PENDING";
  return (
    <section className="section">
      {/* The provider's server notification can arrive a few seconds after the browser returns. */}
      {pending && <meta httpEquiv="refresh" content="4" />}
      <div className="container form-shell panel stack stack-l" style={{ padding: "var(--s-6)" }}>
        {paid ? (
          <>
            <p className="badge badge-accent">Payment received</p>
            <h1 style={{ fontSize: "var(--step-3)" }}>You're enrolled in {order.product.name}.</h1>
            <p>Reference <span className="num">{order.reference}</span> · {formatMoney(order.amount, order.currency)}. A receipt is on its way to {user.email}.</p>
            {order.cohort && <p className="muted">Cohort: {order.cohort.name}. Joining links arrive by email a week before the start.</p>}
            <Link href="/dashboard" className="btn btn-primary">Go to your dashboard</Link>
          </>
        ) : pending ? (
          <>
            <p className="badge">Confirming</p>
            <h1 style={{ fontSize: "var(--step-3)" }}>Confirming your payment…</h1>
            <p className="muted">This usually takes a few seconds. This page refreshes by itself. If nothing changes within a few minutes, email us with reference <span className="num">{order.reference}</span>.</p>
          </>
        ) : (
          <>
            <p className="badge badge-loss">Not completed</p>
            <h1 style={{ fontSize: "var(--step-3)" }}>The payment didn't go through.</h1>
            <p className="muted">No money was taken for order <span className="num">{order.reference}</span>. You can try again.</p>
            <Link href={`/checkout/${order.product.slug}`} className="btn btn-primary">Try again</Link>
          </>
        )}
      </div>
    </section>
  );
}
