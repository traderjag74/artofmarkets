import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasAccess } from "@/lib/access";
import { currencyForCountry, formatMoney } from "@/lib/money";
import { productBySlug } from "@/config/site";
import { CheckoutForm } from "./CheckoutForm";
import { ResendVerification } from "@/components/ResendVerification";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" });

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = productBySlug(slug);
  const product = await db.product.findUnique({ where: { slug } });
  if (!info || !product || !product.active) notFound();
  const user = await requireUser(`/checkout/${slug}`);
  if (product.priceUsd === 0) redirect(`/learn/${slug}`);
  if (await hasAccess(user.id, slug)) redirect("/dashboard?already=1");

  const currency = currencyForCountry(user.country);
  const price = currency === "LKR" ? product.priceLkr : product.priceUsd;
  const priceLabel = `${formatMoney(price, currency)}${product.kind === "MEMBERSHIP" ? " / month" : ""}`;

  let cohorts: { id: string; label: string; full: boolean }[] | null = null;
  if (product.kind === "COHORT") {
    const rows = await db.cohort.findMany({
      where: { productId: product.id, open: true, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { enrollments: { where: { active: true } } } } },
    });
    cohorts = rows.map((c) => {
      const left = c.seats - c._count.enrollments;
      return { id: c.id, full: left <= 0, label: `${c.name} · starts ${dateFmt.format(c.startsAt)} · ${left > 0 ? `${left} seats left` : "full"}` };
    });
  }
  const mock = (process.env.PAYMENT_PROVIDER ?? "mock") === "mock";
  const providerNote = mock
    ? "Test mode: no real payment will be taken."
    : `You'll be taken to PayHere's secure page to pay by card in ${currency}.${product.kind === "MEMBERSHIP" ? " The membership renews monthly until you cancel." : ""}`;

  return (
    <section className="section">
      <div className="container split">
        <div className="stack stack-l">
          <p className="eyebrow">Checkout</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>{info.name}</h1>
          <p className="lede muted">{info.summary}</p>
          <dl className="grid" style={{ gridTemplateColumns: "auto 1fr", gap: "var(--s-2) var(--s-4)", margin: 0 }}>
            <dt className="muted small">Format</dt><dd className="small" style={{ margin: 0 }}>{info.format}</dd>
            <dt className="muted small">Length</dt><dd className="small" style={{ margin: 0 }}>{info.length}</dd>
            <dt className="muted small">Price</dt><dd className="num" style={{ margin: 0 }}>{priceLabel}</dd>
          </dl>
          <p className="small muted">Not sure yet? <Link href={`/apply?interest=${slug}`}>Ask the desk a question first</Link>.</p>
        </div>
        <div className="panel" style={{ padding: "var(--s-6)" }}>
          {cohorts && cohorts.every((c) => c.full) ? (
            <p>All upcoming cohorts are full. <Link href={`/apply?interest=${slug}`}>Join the waiting list</Link>.</p>
          ) : !user.emailVerifiedAt ? (
            <div className="stack">
              <p className="notice notice-risk">Please confirm your email address before paying. We sent a link to <strong>{user.email}</strong>.</p>
              <ResendVerification />
            </div>
          ) : (
            <CheckoutForm slug={slug} cohorts={cohorts} priceLabel={priceLabel} providerNote={providerNote} />
          )}
        </div>
      </div>
    </section>
  );
}
