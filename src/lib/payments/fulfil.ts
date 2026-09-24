import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import { CONFIG } from "@/config/site";
import { formatMoney } from "../money";
import { sendAdminNotice, sendOrderConfirmation } from "../email";

const DAY = 86400_000;

function membershipExpiry(from: Date): Date {
  return new Date(from.getTime() + (CONFIG.membershipDays + CONFIG.membershipGraceDays) * DAY);
}

/**
 * Record a provider event once. Returns false if we have already processed it,
 * which makes every handler below safe against provider retries.
 */
async function claimEvent(provider: string, eventId: string, orderId: string, type: string): Promise<boolean> {
  try {
    await db.paymentEvent.create({ data: { provider, eventId, orderId, type } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false;
    throw e;
  }
}

/** First successful payment for an order: mark paid, enrol, send receipt. */
export async function fulfilOrder(opts: {
  reference: string;
  provider: string;
  eventId: string;
  providerRef?: string;
  subscription?: string;
  amountCents?: number;
  currency?: string;
  raw?: unknown;
}): Promise<"fulfilled" | "duplicate" | "not-found" | "mismatch"> {
  const order = await db.order.findUnique({
    where: { reference: opts.reference },
    include: { product: true, user: true, cohort: true },
  });
  if (!order) return "not-found";
  if (
    (opts.amountCents !== undefined && opts.amountCents !== order.amount) ||
    (opts.currency !== undefined && opts.currency !== order.currency)
  ) {
    await db.order.update({ where: { id: order.id }, data: { rawEvent: (opts.raw ?? null) as Prisma.InputJsonValue } });
    await sendAdminNotice(`Payment amount mismatch on ${order.reference}`, [
      `Expected ${order.amount} ${order.currency}, received ${opts.amountCents} ${opts.currency}. The order was not fulfilled.`,
    ]);
    return "mismatch";
  }
  if (!(await claimEvent(opts.provider, opts.eventId, order.id, "paid"))) return "duplicate";
  if (order.status === "PAID") return "duplicate";

  const now = new Date();
  const isMembership = order.product.kind === "MEMBERSHIP";
  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: now,
        providerRef: opts.providerRef,
        subscription: opts.subscription,
        rawEvent: (opts.raw ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    }),
    db.enrollment.upsert({
      where: { userId_productId: { userId: order.userId, productId: order.productId } },
      create: {
        userId: order.userId,
        productId: order.productId,
        cohortId: order.cohortId,
        source: "ORDER",
        orderId: order.id,
        expiresAt: isMembership ? membershipExpiry(now) : null,
      },
      update: {
        active: true,
        cohortId: order.cohortId,
        source: "ORDER",
        orderId: order.id,
        expiresAt: isMembership ? membershipExpiry(now) : null,
      },
    }),
  ]);

  const amount = formatMoney(order.amount, order.currency);
  await sendOrderConfirmation(order.user.email, order.user.name, order.product.name, order.reference, amount, order.cohort?.name);
  await sendAdminNotice(`New enrolment: ${order.product.name}`, [
    `${order.user.name} <${order.user.email}> paid ${amount}. Reference ${order.reference}.`,
  ]);
  return "fulfilled";
}

/** A recurring membership instalment succeeded: extend access. */
export async function renewMembership(reference: string, provider: string, eventId: string): Promise<void> {
  const order = await db.order.findUnique({ where: { reference } });
  if (!order) return;
  if (!(await claimEvent(provider, eventId, order.id, "renewal"))) return;
  await db.enrollment.updateMany({
    where: { userId: order.userId, productId: order.productId },
    data: { active: true, expiresAt: membershipExpiry(new Date()) },
  });
}

/** Membership stopped by the customer or the provider: access runs until expiry. */
export async function stopMembership(reference: string, provider: string, eventId: string): Promise<void> {
  const order = await db.order.findUnique({ where: { reference }, include: { user: true, product: true } });
  if (!order) return;
  if (!(await claimEvent(provider, eventId, order.id, "stopped"))) return;
  await sendAdminNotice(`Membership stopped: ${order.reference}`, [`${order.user.email} · ${order.product.name}`]);
}

export async function markOrder(reference: string, status: "FAILED" | "CANCELLED", raw?: unknown): Promise<void> {
  await db.order.updateMany({
    where: { reference, status: "PENDING" },
    data: { status, rawEvent: (raw ?? undefined) as Prisma.InputJsonValue | undefined },
  });
}

/** Chargeback or admin refund: revoke access that came from this order. */
export async function refundOrder(reference: string, raw?: unknown): Promise<void> {
  const order = await db.order.findUnique({ where: { reference } });
  if (!order) return;
  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED", rawEvent: (raw ?? undefined) as Prisma.InputJsonValue | undefined },
    }),
    db.enrollment.updateMany({ where: { orderId: order.id }, data: { active: false } }),
  ]);
}
