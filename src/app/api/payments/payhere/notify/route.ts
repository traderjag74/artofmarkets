import { NextResponse, type NextRequest } from "next/server";
import { verifyNotification } from "@/lib/payments/payhere";
import { fulfilOrder, markOrder, refundOrder, renewMembership, stopMembership } from "@/lib/payments/fulfil";

/**
 * PayHere server-to-server notification (notify_url).
 * status_code: 2 success · 0 pending · -1 cancelled · -2 failed · -3 chargeback
 * Recurring payments add message_type (AUTHORIZATION_SUCCESS, RECURRING_INSTALLMENT_SUCCESS,
 * RECURRING_STOPPED, RECURRING_COMPLETE, …) and subscription_id.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const f: Record<string, string> = {};
  form.forEach((v, k) => (f[k] = String(v)));

  if (!verifyNotification(f)) {
    console.warn("[payhere] rejected notification with bad signature", f.order_id);
    return new NextResponse("invalid signature", { status: 400 });
  }

  const ref = f.order_id;
  const status = f.status_code;
  const type = f.message_type ?? "";
  const eventId = f.payment_id || `${ref}:${type}:${status}`;

  if (type === "RECURRING_INSTALLMENT_SUCCESS") {
    await renewMembership(ref, "payhere", eventId);
  } else if (type === "RECURRING_STOPPED" || type === "RECURRING_COMPLETE") {
    await stopMembership(ref, "payhere", `${ref}:${type}:${f.subscription_id ?? ""}`);
  } else if (status === "2") {
    const amountCents = Math.round(Number(f.payhere_amount) * 100);
    await fulfilOrder({
      reference: ref,
      provider: "payhere",
      eventId,
      providerRef: f.payment_id,
      subscription: f.subscription_id,
      amountCents,
      currency: f.payhere_currency,
      raw: f,
    });
  } else if (status === "-1") {
    await markOrder(ref, "CANCELLED", f);
  } else if (status === "-2") {
    await markOrder(ref, "FAILED", f);
  } else if (status === "-3") {
    await refundOrder(ref, f);
  }
  return new NextResponse("ok");
}
