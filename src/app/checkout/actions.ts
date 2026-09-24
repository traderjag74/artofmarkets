"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasAccess } from "@/lib/access";
import { rateLimit } from "@/lib/rate-limit";
import { newReference } from "@/lib/tokens";
import { currencyForCountry } from "@/lib/money";
import { countryName } from "@/lib/countries";
import { activeProvider, type CheckoutAction } from "@/lib/payments";
import { fulfilOrder, markOrder } from "@/lib/payments/fulfil";

export type CheckoutState = { error?: string; action?: CheckoutAction };

export async function startCheckout(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) return { error: "Please confirm your email address first." };
  if (form.get("terms") !== "on") return { error: "Please accept the terms and refund policy." };
  if (!(await rateLimit(`checkout:${user.id}`, 10, 3600))) return { error: "Too many checkout attempts. Please try again later." };

  const slug = String(form.get("slug") ?? "");
  const product = await db.product.findUnique({ where: { slug } });
  if (!product || !product.active || product.priceUsd === 0) return { error: "This programme isn't available to buy." };
  if (await hasAccess(user.id, slug)) redirect("/dashboard");

  let cohortId: string | null = null;
  if (product.kind === "COHORT") {
    cohortId = String(form.get("cohortId") ?? "");
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, productId: product.id, open: true, startsAt: { gt: new Date() } },
      include: { _count: { select: { enrollments: { where: { active: true } } } } },
    });
    if (!cohort) return { error: "Please choose a cohort." };
    if (cohort._count.enrollments >= cohort.seats) return { error: "That cohort is full. Please choose another date." };
  }

  const currency = currencyForCountry(user.country);
  const amount = currency === "LKR" ? product.priceLkr : product.priceUsd;
  const provider = activeProvider();
  const order = await db.order.create({
    data: {
      reference: newReference("AOM"),
      userId: user.id,
      productId: product.id,
      cohortId,
      amount,
      currency,
      provider: provider.id,
    },
  });
  const [firstName, ...rest] = user.name.split(" ");
  const action = provider.createCheckout({
    reference: order.reference,
    amountCents: amount,
    currency,
    itemName: product.name,
    recurringMonthly: product.kind === "MEMBERSHIP",
    customer: { firstName, lastName: rest.join(" "), email: user.email, country: countryName(user.country) },
  });
  if (action.kind === "redirect") redirect(action.url);
  return { action };
}

/** Local test checkout only (PAYMENT_PROVIDER=mock). */
export async function mockPay(form: FormData): Promise<void> {
  if ((process.env.PAYMENT_PROVIDER ?? "mock") !== "mock") throw new Error("Mock payments are disabled");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const ref = String(form.get("ref") ?? "");
  const order = await db.order.findUnique({ where: { reference: ref } });
  if (!order || order.userId !== user.id) redirect("/dashboard");
  if (form.get("outcome") === "success") {
    await fulfilOrder({ reference: ref, provider: "mock", eventId: `mock-${ref}`, providerRef: `mock-${Date.now()}` });
    redirect(`/checkout/return?ref=${ref}`);
  }
  await markOrder(ref, "FAILED");
  redirect(`/checkout/cancelled?ref=${ref}`);
}
