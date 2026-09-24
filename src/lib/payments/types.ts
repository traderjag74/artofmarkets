export type CheckoutInput = {
  reference: string;
  amountCents: number;
  currency: "USD" | "LKR";
  itemName: string;
  recurringMonthly: boolean;
  customer: { firstName: string; lastName: string; email: string; country: string };
};

export type CheckoutAction =
  | { kind: "redirect"; url: string }
  | { kind: "form"; action: string; fields: Record<string, string> };

export interface PaymentProvider {
  id: string;
  createCheckout(input: CheckoutInput): CheckoutAction;
}
