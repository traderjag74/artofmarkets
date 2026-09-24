import { z } from "zod";
import { CONFIG } from "@/config/site";
import { COUNTRY_CODES } from "./countries";

export const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
export const password = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That password is too long");
export const country = z.string().refine((c) => COUNTRY_CODES.has(c), "Choose your country");
const oneOf = (list: readonly string[], msg: string) => z.string().refine((v) => list.includes(v), msg);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email,
  password,
  country,
  riskAck: z.literal("on", { message: "Please confirm you understand the risks" }),
  marketingOptIn: z.string().optional(),
  next: z.string().optional(),
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password"), next: z.string().optional() });

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email,
  country,
  experience: oneOf(CONFIG.experienceLevels, "Choose your experience level"),
  markets: z.array(oneOf(CONFIG.markets, "Unknown market")).min(1, "Choose at least one market"),
  hoursPerWeek: oneOf(CONFIG.hoursPerWeek, "Choose how much time you have"),
  goal: oneOf(CONFIG.goals, "Choose your main goal"),
  contactMoment: oneOf(CONFIG.contactMoments, "Choose when we should contact you"),
  interest: oneOf(["intro-call", ...CONFIG.products.map((p) => p.slug)], "Choose what you're interested in"),
  message: z.string().trim().max(2000).optional(),
  riskAck: z.literal("on", { message: "Please confirm you understand the risks" }),
  sim: z.string().optional(),
});

/** Turns a ZodError into { field: firstMessage } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
