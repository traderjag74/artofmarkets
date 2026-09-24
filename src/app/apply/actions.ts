"use server";

import { db } from "@/lib/db";
import { clientIp, getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { newReference } from "@/lib/tokens";
import { applicationSchema, fieldErrors } from "@/lib/validation";
import { sendAdminNotice, sendApplicationReceived } from "@/lib/email";
import { profileFromQuery } from "@/lib/sim/engine";
import { CONFIG } from "@/config/site";

export type ApplyState = { errors?: Record<string, string>; reference?: string; email?: string };

export async function applyAction(_: ApplyState, form: FormData): Promise<ApplyState> {
  const raw = { ...Object.fromEntries(form), markets: form.getAll("markets") };
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (!(await rateLimit(`apply:${await clientIp()}`, 5, 3600))) {
    return { errors: { form: "You've sent several requests already. We'll be in touch; please try again later if needed." } };
  }

  const sim = d.sim ? profileFromQuery(Object.fromEntries(new URLSearchParams(d.sim)), CONFIG.simulator.limits) : null;
  const user = await getCurrentUser();
  const reference = newReference("REQ");
  await db.application.create({
    data: {
      reference,
      userId: user?.id,
      name: d.name,
      email: d.email,
      country: d.country,
      experience: d.experience,
      markets: d.markets,
      hoursPerWeek: d.hoursPerWeek,
      goal: d.goal,
      contactMoment: d.contactMoment,
      interest: d.interest,
      message: d.message || null,
      simProfile: sim ?? undefined,
      riskAck: true,
    },
  });
  await sendApplicationReceived(d.email, d.name, reference, d.contactMoment);
  await sendAdminNotice(`New request ${reference}: ${d.interest}`, [
    `${d.name} <${d.email}>, ${d.country}. ${d.experience}. Markets: ${d.markets.join(", ")}.`,
    `Goal: ${d.goal}. Contact: ${d.contactMoment}.`,
  ]);
  return { reference, email: d.email };
}
