import "server-only";
import { db } from "./db";

/** True when the user may open this programme's material. */
export async function hasAccess(userId: string, productSlug: string): Promise<boolean> {
  if (productSlug === "foundations") return true; // free for every registered user
  const e = await db.enrollment.findFirst({
    where: { userId, product: { slug: productSlug }, active: true },
  });
  if (!e) return false;
  return !e.expiresAt || e.expiresAt > new Date();
}

export async function activeEnrollments(userId: string) {
  const rows = await db.enrollment.findMany({
    where: { userId, active: true },
    include: { product: true, cohort: true },
    orderBy: { createdAt: "asc" },
  });
  const now = new Date();
  return rows.filter((e) => !e.expiresAt || e.expiresAt > now);
}
