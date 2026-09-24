import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create a free account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return (
    <section className="section">
      <div className="container split">
        <div className="stack stack-l">
          <p className="eyebrow">Free account</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>Start with Foundations</h1>
          <p className="lede">Five lessons on how markets actually work: who takes the other side of your trade, how orders fill, and what trading really costs.</p>
          <ul className="stack stack-s muted">
            <li>No card needed. Nothing to cancel.</li>
            <li>Your progress is saved to your account.</li>
            <li>Upgrade to a paid programme only if and when it suits you.</li>
          </ul>
          <p className="small muted">Already have an account? <Link href="/login">Log in</Link>.</p>
        </div>
        <div className="panel" style={{ padding: "var(--s-6)" }}>
          <RegisterForm next={next} />
        </div>
      </div>
    </section>
  );
}
