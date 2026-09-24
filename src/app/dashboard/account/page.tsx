import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { DeleteForm, PasswordForm, ProfileForm } from "./AccountForms";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/dashboard/account");
  return (
    <section className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "40rem" }}>
        <div className="stack stack-s">
          <Link href="/dashboard" className="small">← Dashboard</Link>
          <h1 style={{ fontSize: "var(--step-4)" }}>Account</h1>
        </div>
        <div className="panel stack stack-l" style={{ padding: "var(--s-6)" }}>
          <h2 style={{ fontSize: "var(--step-2)" }}>Profile</h2>
          <ProfileForm user={{ name: user.name, email: user.email, country: user.country, experience: user.experience, marketingOptIn: user.marketingOptIn }} />
        </div>
        <div className="panel stack stack-l" style={{ padding: "var(--s-6)" }}>
          <h2 style={{ fontSize: "var(--step-2)" }}>Password</h2>
          <PasswordForm />
        </div>
        <div className="panel stack stack-l" style={{ padding: "var(--s-6)" }}>
          <h2 style={{ fontSize: "var(--step-2)" }}>Delete account</h2>
          <DeleteForm />
        </div>
      </div>
    </section>
  );
}
