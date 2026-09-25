import type { PaymentProvider } from "./types";
import { payhere } from "./payhere";
import { mock } from "./mock";

const providers: Record<string, PaymentProvider> = { payhere, mock };

export type PaymentMode = "payhere" | "mock" | "off";

/**
 * Which checkout is active.
 * - "payhere": real card payments.
 * - "mock": fake payments for testing. In production it only runs when
 *   ALLOW_TEST_PAYMENTS=true, so a missing setting can never give away access.
 * - "off": paid programmes show "enrolment opens soon"; everything else works.
 * Unset defaults to "mock" in development and "off" in production.
 */
export function paymentMode(): PaymentMode {
  const prod = process.env.NODE_ENV === "production";
  const id = process.env.PAYMENT_PROVIDER || (prod ? "off" : "mock");
  if (id === "payhere") return "payhere";
  if (id === "mock") return !prod || process.env.ALLOW_TEST_PAYMENTS === "true" ? "mock" : "off";
  if (id !== "off") console.error(`Unknown PAYMENT_PROVIDER "${id}"; payments are off`);
  return "off";
}

export function activeProvider(): PaymentProvider {
  const mode = paymentMode();
  if (mode === "off") throw new Error("Payments are switched off (PAYMENT_PROVIDER)");
  return providers[mode];
}

export type { PaymentProvider, CheckoutAction, CheckoutInput } from "./types";
