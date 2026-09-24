import "server-only";
import { db } from "./db";
import { appUrl } from "./env";
import { CONFIG } from "@/config/site";

type Mail = { to: string; subject: string; template: string; heading: string; paragraphs: string[]; cta?: { label: string; href: string } };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Plain, table-free email that renders acceptably in every client. */
function render(mail: Mail): { html: string; text: string } {
  const p = mail.paragraphs.map((t) => `<p style="margin:0 0 16px">${escapeHtml(t)}</p>`).join("");
  const cta = mail.cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(mail.cta.href)}" style="background:#1F6F6B;color:#F5F3EE;padding:12px 20px;border-radius:4px;text-decoration:none;display:inline-block">${escapeHtml(mail.cta.label)}</a></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#F5F3EE;font-family:Georgia,serif;color:#1E2328">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#5B6570;margin:0 0 24px">${escapeHtml(CONFIG.site.name)}</p>
<h1 style="font-size:24px;font-weight:500;margin:0 0 20px">${escapeHtml(mail.heading)}</h1>
<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6">${p}${cta}</div>
<hr style="border:0;border-top:1px solid #E8E4DB;margin:32px 0 16px">
<p style="font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#5B6570;margin:0">${escapeHtml(CONFIG.risk.short)}<br>${escapeHtml(CONFIG.site.company)} · ${escapeHtml(CONFIG.site.address)}</p>
</div></body></html>`;
  const text = [mail.heading, "", ...mail.paragraphs, ...(mail.cta ? ["", `${mail.cta.label}: ${mail.cta.href}`] : []), "", "—", CONFIG.risk.short].join("\n");
  return { html, text };
}

/**
 * Sends through Resend when RESEND_API_KEY is set. Without a key the message is
 * only stored (status LOGGED) and can be read in Admin → Emails, which keeps
 * local development and previews working without an email account.
 * Email failures never break the user flow; they are recorded instead.
 */
export async function sendEmail(mail: Mail): Promise<void> {
  const { html, text } = render(mail);
  const key = process.env.RESEND_API_KEY;
  let status: "SENT" | "LOGGED" | "FAILED" = "LOGGED";
  let providerId: string | undefined;
  let error: string | undefined;

  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? `${CONFIG.site.name} <${CONFIG.site.email}>`,
          to: [mail.to],
          reply_to: process.env.EMAIL_REPLY_TO || undefined,
          subject: mail.subject,
          html,
          text,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok) {
        status = "SENT";
        providerId = body.id;
      } else {
        status = "FAILED";
        error = body.message ?? `HTTP ${res.status}`;
      }
    } catch (e) {
      status = "FAILED";
      error = e instanceof Error ? e.message : String(e);
    }
  }

  // Once delivered, don't keep live login/reset links in the log. Without a provider (LOGGED),
  // the stored copy is the only way to use the link, so it's kept as-is.
  const redact = (s: string) => (status === "SENT" ? s.replace(/token=[\w-]+/g, "token=[redacted]") : s);
  await db.emailLog.create({
    data: { to: mail.to, subject: mail.subject, template: mail.template, html: redact(html), text: redact(text), status, providerId, error },
  });
  if (status === "FAILED") console.error(`[email] ${mail.template} to ${mail.to} failed: ${error}`);
}

// ── Templates ────────────────────────────────────────────────────────────────

export function sendVerifyEmail(to: string, name: string, token: string) {
  return sendEmail({
    to,
    subject: "Confirm your email address",
    template: "verify-email",
    heading: `Welcome, ${name}`,
    paragraphs: [
      "Please confirm your email address. It keeps your account secure and lets us send your receipts and cohort details.",
      "The link works for 48 hours.",
      "Your free Foundations module is already open in your dashboard.",
    ],
    cta: { label: "Confirm email address", href: `${appUrl()}/verify-email?token=${token}` },
  });
}

export function sendPasswordReset(to: string, token: string) {
  return sendEmail({
    to,
    subject: "Reset your password",
    template: "reset-password",
    heading: "Reset your password",
    paragraphs: [
      "Someone asked to reset the password for this account. If that was you, use the link below. It works for one hour and only once.",
      "If it wasn't you, you can ignore this email. Your password stays the same.",
    ],
    cta: { label: "Choose a new password", href: `${appUrl()}/reset-password?token=${token}` },
  });
}

export function sendOrderConfirmation(to: string, name: string, product: string, reference: string, amount: string, cohort?: string | null) {
  return sendEmail({
    to,
    subject: `Receipt ${reference}: ${product}`,
    template: "order-paid",
    heading: `You're enrolled in ${product}`,
    paragraphs: [
      `Thank you, ${name}. We've received your payment of ${amount}.`,
      `Order reference: ${reference}.`,
      ...(cohort ? [`Cohort: ${cohort}. We'll email the session calendar and joining links a week before the start date.`] : []),
      "Everything you've enrolled in is in your dashboard. If you have a question, just reply to this email.",
      "Refunds follow our refund policy on the website.",
    ],
    cta: { label: "Go to your dashboard", href: `${appUrl()}/dashboard` },
  });
}

export function sendApplicationReceived(to: string, name: string, reference: string, contactMoment: string) {
  return sendEmail({
    to,
    subject: `We received your request (${reference})`,
    template: "application-received",
    heading: `Thanks, ${name}`,
    paragraphs: [
      `We've received your request. Reference: ${reference}.`,
      `A member of the desk will contact you within two working days. You asked for: ${contactMoment}.`,
      "The call is about your goals and which programme fits, if any. We will not give you personal investment advice or ask how much money you plan to trade.",
      "While you wait, the free Foundations module is a good place to start.",
    ],
    cta: { label: "Open Foundations", href: `${appUrl()}/register?next=/learn/foundations` },
  });
}

export function sendAdminNotice(subject: string, lines: string[]) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return Promise.resolve();
  return sendEmail({ to, subject, template: "admin-notice", heading: subject, paragraphs: lines, cta: { label: "Open admin", href: `${appUrl()}/admin` } });
}
