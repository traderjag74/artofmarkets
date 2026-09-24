import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <section className="section">
      <div className="container form-shell stack stack-l">
        <h1 style={{ fontSize: "var(--step-4)" }}>Choose a new password</h1>
        <ResetForm token={token} />
      </div>
    </section>
  );
}
