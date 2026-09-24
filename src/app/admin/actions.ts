"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { refundOrder } from "@/lib/payments/fulfil";

export async function setApplicationStatus(form: FormData) {
  await requireAdmin();
  const status = z.enum(["NEW", "CONTACTED", "ENROLLED", "CLOSED"]).parse(form.get("status"));
  await db.application.update({
    where: { id: String(form.get("id")) },
    data: { status, adminNote: String(form.get("adminNote") ?? "").slice(0, 2000) || null },
  });
  revalidatePath("/admin/requests");
}

export async function refundOrderAction(form: FormData) {
  await requireAdmin();
  await refundOrder(String(form.get("reference")), { refundedBy: "admin", at: new Date().toISOString() });
  revalidatePath("/admin/orders");
}

export async function grantAccess(form: FormData) {
  await requireAdmin();
  const userId = String(form.get("userId"));
  const productId = String(form.get("productId"));
  await db.enrollment.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, source: "ADMIN" },
    update: { active: true, expiresAt: null },
  });
  revalidatePath(`/admin/students/${userId}`);
}

export async function revokeAccess(form: FormData) {
  await requireAdmin();
  await db.enrollment.update({ where: { id: String(form.get("id")) }, data: { active: false } });
  revalidatePath(`/admin/students/${String(form.get("userId"))}`);
}

const cohortSchema = z.object({
  productId: z.string().min(1),
  code: z.string().trim().min(3).max(30),
  name: z.string().trim().min(3).max(100),
  startsAt: z.string().date(),
  endsAt: z.string().date(),
  seats: z.coerce.number().int().min(1).max(500),
});

export async function createCohort(form: FormData) {
  await requireAdmin();
  const c = cohortSchema.parse(Object.fromEntries(form));
  await db.cohort.create({
    data: { ...c, startsAt: new Date(`${c.startsAt}T13:30:00Z`), endsAt: new Date(`${c.endsAt}T13:30:00Z`) },
  });
  revalidatePath("/admin/cohorts");
}

export async function toggleCohort(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const c = await db.cohort.findUniqueOrThrow({ where: { id } });
  await db.cohort.update({ where: { id }, data: { open: !c.open } });
  revalidatePath("/admin/cohorts");
}

const liveSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(1000),
  startsAt: z.string().min(10),
  youtubeUrl: z.string().url().refine((u) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(u), "Must be a YouTube link"),
});

export async function createLive(form: FormData) {
  await requireAdmin();
  const l = liveSchema.parse(Object.fromEntries(form));
  // datetime-local input is entered in Sri Lanka time (UTC+05:30)
  await db.liveSession.create({ data: { ...l, startsAt: new Date(`${l.startsAt}:00+05:30`) } });
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath("/");
}

export async function toggleLive(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const l = await db.liveSession.findUniqueOrThrow({ where: { id } });
  await db.liveSession.update({ where: { id }, data: { published: !l.published } });
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath("/");
}

export async function deleteLive(form: FormData) {
  await requireAdmin();
  await db.liveSession.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath("/");
}
