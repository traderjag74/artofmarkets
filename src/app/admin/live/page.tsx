import { db } from "@/lib/db";
import { CONFIG } from "@/config/site";
import { createLive, deleteLive, toggleLive } from "../actions";
import { dt } from "../fmt";

export default async function LiveAdmin() {
  const sessions = await db.liveSession.findMany({ orderBy: { startsAt: "desc" } });
  return (
    <div className="stack stack-xl">
      <h1 style={{ fontSize: "var(--step-3)" }}>Live sessions</h1>
      <p className="notice">Keep live sessions educational: review closed trades, use historical charts, no live trade calls or signals. See the compliance notes in the README.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>When (Sri Lanka)</th><th>Title</th><th>Link</th><th>Shown</th><th></th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{dt.format(s.startsAt)}</td>
                <td>{s.title}</td>
                <td><a href={s.youtubeUrl} rel="noopener">YouTube</a></td>
                <td>{s.published ? "Yes" : "Hidden"}</td>
                <td className="cluster">
                  <form action={toggleLive}><input type="hidden" name="id" value={s.id} /><button className="btn-link small">{s.published ? "Hide" : "Show"}</button></form>
                  <form action={deleteLive}><input type="hidden" name="id" value={s.id} /><button className="btn-link small loss">Delete</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createLive} className="card form" style={{ maxWidth: "40rem" }}>
        <h2 style={{ fontSize: "var(--step-2)" }}>Add a live session</h2>
        <label className="field"><span>Title</span><input name="title" className="input" required /></label>
        <label className="field"><span>Description</span><textarea name="description" className="textarea" required /></label>
        <div className="grid grid-2" style={{ ["--gap" as string]: "var(--s-4)" }}>
          <label className="field"><span>Starts (Sri Lanka time)</span><input name="startsAt" type="datetime-local" className="input" required /></label>
          <label className="field"><span>YouTube link</span><input name="youtubeUrl" type="url" className="input" defaultValue={CONFIG.site.youtube} required /></label>
        </div>
        <button className="btn btn-primary" style={{ justifySelf: "start" }}>Add session</button>
      </form>
    </div>
  );
}
