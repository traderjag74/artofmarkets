import { createHash } from "node:crypto";
import { appUrl } from "../env";
import type { CheckoutAction, CheckoutInput, PaymentProvider } from "./types";

/**
 * PayHere (Sri Lanka). Hosted checkout: the browser POSTs a signed form to
 * PayHere, PayHere calls our notify_url server-to-server with the result.
 * Docs: https://support.payhere.lk/api-&-mobile-sdk/checkout-api
 */

const md5 = (s: string) => createHash("md5").update(s).digest("hex").toUpperCase();

export function amountString(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function checkoutHash(merchantId: string, orderId: string, amount: string, currency: string, secret: string): string {
  return md5(merchantId + orderId + amount + currency + md5(secret));
}

/** Signature PayHere puts on every notification (md5sig). */
export function notifySignature(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  secret: string,
): string {
  return md5(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + md5(secret));
}

function credentials() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !secret) throw new Error("PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET must be set");
  return { merchantId, secret };
}

export function verifyNotification(fields: Record<string, string>): boolean {
  const { merchantId, secret } = credentials();
  if (fields.merchant_id !== merchantId) return false;
  const expected = notifySignature(
    fields.merchant_id,
    fields.order_id ?? "",
    fields.payhere_amount ?? "",
    fields.payhere_currency ?? "",
    fields.status_code ?? "",
    secret,
  );
  return expected === (fields.md5sig ?? "").toUpperCase();
}

export const payhere: PaymentProvider = {
  id: "payhere",
  createCheckout(input: CheckoutInput): CheckoutAction {
    const { merchantId, secret } = credentials();
    const sandbox = process.env.PAYHERE_SANDBOX !== "false";
    const amount = amountString(input.amountCents);
    const fields: Record<string, string> = {
      merchant_id: merchantId,
      return_url: `${appUrl()}/checkout/return?ref=${input.reference}`,
      cancel_url: `${appUrl()}/checkout/cancelled?ref=${input.reference}`,
      notify_url: `${appUrl()}/api/payments/payhere/notify`,
      order_id: input.reference,
      items: input.itemName,
      currency: input.currency,
      amount,
      first_name: input.customer.firstName,
      last_name: input.customer.lastName || "-",
      email: input.customer.email,
      phone: "0000000000",
      address: "-",
      city: "-",
      country: input.customer.country || "Sri Lanka",
      hash: checkoutHash(merchantId, input.reference, amount, input.currency, secret),
    };
    if (input.recurringMonthly) {
      fields.recurrence = "1 Month";
      fields.duration = "Forever";
    }
    return {
      kind: "form",
      action: sandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout",
      fields,
    };
  },
};
