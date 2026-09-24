export type Currency = "USD" | "LKR";

export function formatMoney(cents: number, currency: Currency | string): string {
  if (cents === 0) return "Free";
  const value = cents / 100;
  if (currency === "LKR") {
    return `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

/** Sri Lankan visitors pay in LKR; everyone else in USD. */
export function currencyForCountry(country?: string | null): Currency {
  return country === "LK" ? "LKR" : "USD";
}
