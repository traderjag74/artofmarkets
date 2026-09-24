import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return (
    <section className="section">
      <div className="container form-shell stack stack-l">
        <div className="stack stack-s">
          <p className="eyebrow">Student login</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>Welcome back</h1>
        </div>
        <LoginForm next={next} />
        <p className="small muted">
          New here? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create a free account</Link> and start with the Foundations module.
        </p>
      </div>
    </section>
  );
}
