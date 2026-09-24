"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { destroyAllSessions, getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { country, fieldErrors } from "@/lib/validation";
import { newToken } from "@/lib/tokens";
import type { FormState } from "@/app/(auth)/actions";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  country,
  experience: z.string().max(50).optional(),
  marketingOptIn: z.string().optional(),
});

export async function updateProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      experience: parsed.data.experience || null,
      marketingOptIn: parsed.data.marketingOptIn === "on",
    },
  });
  return { ok: "Saved." };
}

/**
 * Deletes personal data. Paid orders are kept (anonymised) because we must
 * keep financial records; everything else linked to the person is removed.
 */
export async function deleteAccountAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") return { errors: { form: "Admin accounts can't be deleted here." } };
  if (!(await verifyPassword(String(form.get("password") ?? ""), user.passwordHash))) {
    return { errors: { password: "That's not your password" } };
  }
  await db.$transaction([
    db.lessonProgress.deleteMany({ where: { userId: user.id } }),
    db.authToken.deleteMany({ where: { userId: user.id } }),
    db.application.updateMany({ where: { userId: user.id }, data: { userId: null, name: "Deleted user", email: "deleted@invalid", message: null } }),
    db.enrollment.updateMany({ where: { userId: user.id }, data: { active: false } }),
    db.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@invalid`,
        name: "Deleted user",
        country: null,
        experience: null,
        marketingOptIn: false,
        passwordHash: await hashPassword(newToken()),
      },
    }),
  ]);
  await destroyAllSessions(user.id);
  redirect("/?deleted=1");
}
