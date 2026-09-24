import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { productBySlug } from "@/config/site";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasAccess } from "@/lib/access";
import { lessonsFor } from "@/content/courses";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params;
  const info = productBySlug(course);
  const lessons = lessonsFor(course);
  if (!info || lessons.length === 0) notFound();
  const user = await requireUser(`/learn/${course}`);
  if (!(await hasAccess(user.id, course))) redirect(`/academy#${course}`);
  const done = new Set(
    (await db.lessonProgress.findMany({ where: { userId: user.id, courseSlug: course } })).map((p) => p.lessonSlug),
  );
  const next = lessons.find((l) => !done.has(l.slug)) ?? lessons[0];
  const pctDone = Math.round((done.size / lessons.length) * 100);

  return (
    <section className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "52rem" }}>
        <div className="stack stack-l">
          <Link href="/dashboard" className="small">← Dashboard</Link>
          <p className="eyebrow">Step {info.step} · {info.format}</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>{info.name}</h1>
          <p className="lede muted">{info.summary}</p>
          <div className="stack stack-s">
            <div className="progress" aria-hidden="true"><span style={{ width: `${pctDone}%` }} /></div>
            <p className="small muted num">{done.size} of {lessons.length} lessons complete</p>
          </div>
          <Link href={`/learn/${course}/${next.slug}`} className="btn btn-primary" style={{ justifySelf: "start", width: "fit-content" }}>
            {done.size === 0 ? "Start the first lesson" : done.size === lessons.length ? "Review from the start" : "Continue"}
          </Link>
        </div>
        <ol className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lessons.map((l, i) => (
            <li key={l.slug} className="card cluster" style={{ justifyContent: "space-between" }}>
              <div className="stack stack-s">
                <p className="eyebrow num">Lesson {i + 1} · {l.minutes} min</p>
                <Link href={`/learn/${course}/${l.slug}`} style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-1)", color: "var(--c-ink)" }}>{l.title}</Link>
                <p className="small muted">{l.summary}</p>
              </div>
              {done.has(l.slug) ? <span className="badge badge-accent">Done</span> : <span className="badge">To do</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
