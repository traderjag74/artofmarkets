import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { markOrder } from "@/lib/payments/fulfil";

export const metadata = { title: "Payment cancelled", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutCancelled({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const user = await requireUser();
  const order = await db.order.findUnique({ where: { reference: ref }, include: { product: true } });
  if (order && order.userId === user.id) await markOrder(ref, "CANCELLED");
  return (
    <section className="section">
      <div className="container form-shell panel stack stack-l" style={{ padding: "var(--s-6)" }}>
        <h1 style={{ fontSize: "var(--step-3)" }}>Payment cancelled</h1>
        <p className="muted">Nothing was charged. If something went wrong or you have a question, we're happy to help.</p>
        <div className="cluster">
          {order && <Link href={`/checkout/${order.product.slug}`} className="btn btn-primary">Try again</Link>}
          <Link href="/apply" className="btn btn-ghost">Talk to the desk</Link>
        </div>
      </div>
    </section>
  );
}
