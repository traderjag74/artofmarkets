import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dt } from "../../fmt";

export default async function EmailView({ params }: { params: Promise<{ id: string }> }) {
  const e = await db.emailLog.findUnique({ where: { id: (await params).id } });
  if (!e) notFound();
  return (
    <div className="stack stack-l">
      <Link href="/admin/emails" className="small">← Emails</Link>
      <h1 style={{ fontSize: "var(--step-2)" }}>{e.subject}</h1>
      <p className="small muted">To {e.to} · {dt.format(e.createdAt)} · {e.status}</p>
      <iframe title="Email preview" srcDoc={e.html} sandbox="" style={{ width: "100%", height: "70vh", border: "var(--border)", borderRadius: "var(--radius-m)", background: "white" }} />
    </div>
  );
}
