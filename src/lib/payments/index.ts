import type { PaymentProvider } from "./types";
import { payhere } from "./payhere";
import { mock } from "./mock";

const providers: Record<string, PaymentProvider> = { payhere, mock };

export function activeProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? "mock";
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown PAYMENT_PROVIDER "${id}"`);
  return provider;
}

export type { PaymentProvider, CheckoutAction, CheckoutInput } from "./types";
