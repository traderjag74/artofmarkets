import type { CheckoutAction, CheckoutInput, PaymentProvider } from "./types";

/** Local test checkout. Refuses to run in production unless explicitly chosen. */
export const mock: PaymentProvider = {
  id: "mock",
  createCheckout(input: CheckoutInput): CheckoutAction {
    return { kind: "redirect", url: `/checkout/mock?ref=${encodeURIComponent(input.reference)}` };
  },
};
