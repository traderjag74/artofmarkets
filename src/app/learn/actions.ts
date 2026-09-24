"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasAccess } from "@/lib/access";
import { lessonsFor } from "@/content/courses";

export async function toggleLessonComplete(form: FormData): Promise<void> {
  const user = await requireUser();
  const courseSlug = String(form.get("course"));
  const lessonSlug = String(form.get("lesson"));
  if (!lessonsFor(courseSlug).some((l) => l.slug === lessonSlug)) return;
  if (!(await hasAccess(user.id, courseSlug))) return;
  const key = { userId_courseSlug_lessonSlug: { userId: user.id, courseSlug, lessonSlug } };
  if (form.get("done") === "1") {
    await db.lessonProgress.upsert({ where: key, create: { userId: user.id, courseSlug, lessonSlug }, update: {} });
  } else {
    await db.lessonProgress.deleteMany({ where: { userId: user.id, courseSlug, lessonSlug } });
  }
  revalidatePath(`/learn/${courseSlug}`);
}
