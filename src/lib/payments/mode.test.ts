import { afterEach, describe, expect, it, vi } from "vitest";
import { paymentMode } from "./index";

afterEach(() => vi.unstubAllEnvs());

function env(nodeEnv: string, provider?: string, allow?: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("PAYMENT_PROVIDER", provider ?? "");
  vi.stubEnv("ALLOW_TEST_PAYMENTS", allow ?? "");
}

describe("paymentMode", () => {
  it("defaults to mock in development", () => {
    env("development");
    expect(paymentMode()).toBe("mock");
  });
  it("defaults to off in production", () => {
    env("production");
    expect(paymentMode()).toBe("off");
  });
  it("refuses mock in production unless explicitly allowed", () => {
    env("production", "mock");
    expect(paymentMode()).toBe("off");
    env("production", "mock", "true");
    expect(paymentMode()).toBe("mock");
  });
  it("uses payhere when set", () => {
    env("production", "payhere");
    expect(paymentMode()).toBe("payhere");
  });
  it("treats unknown values as off", () => {
    env("production", "stripe");
    expect(paymentMode()).toBe("off");
  });
});
