import { describe, expect, it } from "vitest";
import { amountString, checkoutHash, notifySignature } from "./payhere";
import { createHash } from "node:crypto";

const md5 = (s: string) => createHash("md5").update(s).digest("hex").toUpperCase();

describe("payhere signatures", () => {
  it("formats amounts with two decimals", () => {
    expect(amountString(4490000)).toBe("44900.00");
    expect(amountString(14900)).toBe("149.00");
  });
  it("builds the checkout hash per PayHere's formula", () => {
    expect(checkoutHash("1211149", "AOM-1", "149.00", "USD", "secret")).toBe(md5("1211149AOM-1149.00USD" + md5("secret")));
  });
  it("builds the notify signature per PayHere's formula", () => {
    expect(notifySignature("1211149", "AOM-1", "149.00", "USD", "2", "secret")).toBe(md5("1211149AOM-1149.00USD2" + md5("secret")));
  });
});
