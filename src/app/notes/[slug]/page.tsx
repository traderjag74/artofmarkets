import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONFIG } from "@/config/site";
import { NOTES, noteBySlug } from "@/content/notes";

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = noteBySlug((await params).slug);
  return n ? { title: n.title, description: n.summary } : {};
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const note = noteBySlug((await params).slug);
  if (!note) notFound();
  const author = CONFIG.instructors.find((i) => i.name === note.author);
  const Body = note.Body;
  return (
    <article className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "42rem" }}>
        <header className="stack stack-l">
          <Link href="/notes" className="small">← Desk notes</Link>
          <p className="eyebrow num">{note.date}</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>{note.title}</h1>
          <p className="lede muted">{note.summary}</p>
        </header>
        <div className="lesson"><Body /></div>
        <aside className="card stack stack-s" aria-label="About the author">
          <p className="eyebrow">Written by</p>
          <p><strong>{note.author}</strong>, {note.authorRole}</p>
          {author && <p className="small muted">{author.bio}</p>}
        </aside>
        <p className="disclaimer">General education, not financial advice. Any figures are historical or illustrative.</p>
      </div>
    </article>
  );
}
