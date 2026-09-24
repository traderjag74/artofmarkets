"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clientIp,
  createSession,
  destroyAllSessions,
  destroySession,
  getCurrentUser,
  hashPassword,
  safeNext,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { newToken, sha256 } from "@/lib/tokens";
import { sendPasswordReset, sendVerifyEmail } from "@/lib/email";
import { email as emailSchema, fieldErrors, loginSchema, password as passwordSchema, registerSchema } from "@/lib/validation";

export type FormState = { errors?: Record<string, string>; ok?: string; values?: Record<string, string> };

const HOUR = 3600_000;

async function issueToken(userId: string, type: "VERIFY_EMAIL" | "RESET_PASSWORD", hours: number) {
  const token = newToken();
  await db.authToken.create({
    data: { userId, type, tokenHash: sha256(token), expiresAt: new Date(Date.now() + hours * HOUR) },
  });
  return token;
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  const values = { name: raw.name ?? "", email: raw.email ?? "", country: raw.country ?? "" };
  if (!(await rateLimit(`register:${await clientIp()}`, 10, 3600))) {
    return { errors: { form: "Too many attempts. Please try again in an hour." }, values };
  }
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const d = parsed.data;

  if (await db.user.findUnique({ where: { email: d.email } })) {
    return { errors: { email: "An account with this email already exists. Log in instead." }, values };
  }

  const foundations = await db.product.findUnique({ where: { slug: "foundations" } });
  const user = await db.user.create({
    data: {
      name: d.name,
      email: d.email,
      country: d.country,
      passwordHash: await hashPassword(d.password),
      marketingOptIn: d.marketingOptIn === "on",
      riskAckAt: new Date(),
      enrollments: foundations ? { create: { productId: foundations.id, source: "FREE" } } : undefined,
    },
  });
  const token = await issueToken(user.id, "VERIFY_EMAIL", 48);
  await sendVerifyEmail(user.email, user.name, token);
  await createSession(user.id);
  redirect(safeNext(d.next, "/dashboard?welcome=1"));
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  const values = { email: raw.email ?? "" };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const { email, password, next } = parsed.data;

  const ip = await clientIp();
  if (!(await rateLimit(`login:${ip}`, 20, 900)) || !(await rateLimit(`login:${email}`, 8, 900))) {
    return { errors: { form: "Too many attempts. Please wait 15 minutes and try again." }, values };
  }
  const user = await db.user.findUnique({ where: { email } });
  // Same message whether the email or the password is wrong.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { errors: { form: "That email and password don't match." }, values };
  }
  await createSession(user.id);
  redirect(safeNext(next, user.role === "ADMIN" ? "/admin" : "/dashboard"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(form.get("email"));
  if (!parsed.success) return { errors: { email: "Enter a valid email address" } };
  if (!(await rateLimit(`forgot:${await clientIp()}`, 5, 3600))) {
    return { errors: { form: "Too many requests. Please try again later." } };
  }
  const user = await db.user.findUnique({ where: { email: parsed.data } });
  if (user) {
    const token = await issueToken(user.id, "RESET_PASSWORD", 1);
    await sendPasswordReset(user.email, token);
  }
  // Never reveal whether an account exists.
  return { ok: "If an account exists for that address, we've sent a reset link. It works for one hour." };
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const parsed = passwordSchema.safeParse(form.get("password"));
  if (!parsed.success) return { errors: { password: parsed.error.issues[0].message } };
  if (form.get("password") !== form.get("confirm")) return { errors: { confirm: "The passwords don't match" } };

  const row = await db.authToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.type !== "RESET_PASSWORD" || row.usedAt || row.expiresAt < new Date()) {
    return { errors: { form: "This reset link has expired or was already used. Request a new one." } };
  }
  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(parsed.data) } }),
    db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  await destroyAllSessions(row.userId);
  await createSession(row.userId);
  redirect("/dashboard?reset=1");
}

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) return { ok: "Your email is already confirmed." };
  if (!(await rateLimit(`verify:${user.id}`, 3, 3600))) return { errors: { form: "Please wait a while before requesting another email." } };
  const token = await issueToken(user.id, "VERIFY_EMAIL", 48);
  await sendVerifyEmail(user.email, user.name, token);
  return { ok: `We've sent a new link to ${user.email}.` };
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(await verifyPassword(String(form.get("current") ?? ""), user.passwordHash))) {
    return { errors: { current: "That's not your current password" } };
  }
  const parsed = passwordSchema.safeParse(form.get("password"));
  if (!parsed.success) return { errors: { password: parsed.error.issues[0].message } };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data) } });
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return { ok: "Password changed. Other devices have been logged out." };
}
