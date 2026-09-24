import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { productBySlug } from "@/config/site";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hasAccess } from "@/lib/access";
import { lessonsFor } from "@/content/courses";
import { toggleLessonComplete } from "../../actions";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course, lesson } = await params;
  const info = productBySlug(course);
  const lessons = lessonsFor(course);
  const idx = lessons.findIndex((l) => l.slug === lesson);
  if (!info || idx < 0) notFound();
  const user = await requireUser(`/learn/${course}/${lesson}`);
  if (!(await hasAccess(user.id, course))) redirect(`/academy#${course}`);
  const current = lessons[idx];
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const done = !!(await db.lessonProgress.findUnique({
    where: { userId_courseSlug_lessonSlug: { userId: user.id, courseSlug: course, lessonSlug: lesson } },
  }));
  const Body = current.Body;

  return (
    <article className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "44rem" }}>
        <header className="stack stack-l">
          <Link href={`/learn/${course}`} className="small">← {info.name}</Link>
          <p className="eyebrow num">Lesson {idx + 1} of {lessons.length} · {current.minutes} min</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>{current.title}</h1>
          <p className="lede muted">{current.summary}</p>
        </header>
        <div className="lesson">
          <Body />
        </div>
        <p className="disclaimer notice">General education only. Examples are illustrative and use historical or hypothetical figures; they are not recommendations to trade any instrument.</p>
        <form action={toggleLessonComplete} className="cluster" style={{ justifyContent: "space-between" }}>
          <input type="hidden" name="course" value={course} />
          <input type="hidden" name="lesson" value={lesson} />
          <input type="hidden" name="done" value={done ? "0" : "1"} />
          <button className={`btn ${done ? "btn-ghost" : "btn-primary"}`}>{done ? "Mark as not done" : "Mark lesson complete"}</button>
          <div className="cluster">
            {prev && <Link href={`/learn/${course}/${prev.slug}`} className="btn btn-ghost btn-s">← Previous</Link>}
            {next ? (
              <Link href={`/learn/${course}/${next.slug}`} className="btn btn-ghost btn-s">Next lesson →</Link>
            ) : (
              <Link href={course === "foundations" ? "/academy#risk-and-process" : "/academy#strategy-building"} className="btn btn-ghost btn-s">What's next →</Link>
            )}
          </div>
        </form>
      </div>
    </article>
  );
}
