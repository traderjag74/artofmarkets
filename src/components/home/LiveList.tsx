import type { LiveSession } from "@prisma/client";

const fmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Colombo",
  timeZoneName: "short",
});

export function LiveList({ sessions }: { sessions: LiveSession[] }) {
  if (sessions.length === 0) {
    return <p className="muted">The next sessions will be announced soon. Subscribe on YouTube to get notified.</p>;
  }
  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0, marginBottom: 0 }}>
      {sessions.map((s) => (
        <li key={s.id} className="card-flat stack stack-s">
          <p className="eyebrow num">{fmt.format(s.startsAt)}</p>
          <h3 style={{ fontSize: "var(--step-1)" }}>{s.title}</h3>
          <p className="small muted">{s.description}</p>
          <a href={s.youtubeUrl} rel="noopener" className="small">Set a reminder on YouTube →</a>
        </li>
      ))}
    </ul>
  );
}
