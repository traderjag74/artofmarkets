import type { Metadata } from "next";
import Link from "next/link";
import { NOTES } from "@/content/notes";

export const metadata: Metadata = { title: "Desk notes", description: "Notes from the desk on risk, process and reviewing trades. No trade calls." };

export default function NotesPage() {
  return (
    <section className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "48rem" }}>
        <div className="stack stack-s">
          <p className="eyebrow">Desk notes</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>From the journal</h1>
          <p className="lede muted">Short notes on process, risk and review. Never trade calls.</p>
        </div>
        <ul className="stack stack-l" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {NOTES.map((n) => (
            <li key={n.slug} className="stack stack-s rule-top" style={{ paddingTop: "var(--s-5)" }}>
              <p className="eyebrow num">{n.date} · {n.author}</p>
              <h2 style={{ fontSize: "var(--step-2)" }}><Link href={`/notes/${n.slug}`} style={{ color: "var(--c-ink)" }}>{n.title}</Link></h2>
              <p className="muted">{n.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
