import type { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { db } from "@/lib/db";
import { countryName } from "@/lib/countries";
import { setApplicationStatus } from "../actions";
import { dt } from "../fmt";

const STATUSES: ApplicationStatus[] = ["NEW", "CONTACTED", "ENROLLED", "CLOSED"];

type Sim = { winRate: number; avgWinR: number; riskPct: number; trades: number };

export default async function Requests({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "NEW" } = await searchParams;
  const filter = STATUSES.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : undefined;
  const apps = await db.application.findMany({ where: filter ? { status: filter } : {}, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="stack stack-l">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "var(--step-3)" }}>Intro-call requests</h1>
        <div className="cluster small">
          {STATUSES.map((s) => <Link key={s} href={`/admin/requests?status=${s}`} aria-current={s === filter ? "page" : undefined}>{s.toLowerCase()}</Link>)}
          <Link href="/admin/requests?status=all">all</Link>
        </div>
      </div>
      {apps.length === 0 && <p className="muted">Nothing here.</p>}
      {apps.map((a) => {
        const sim = a.simProfile as Sim | null;
        return (
          <div key={a.id} className="card grid grid-2">
            <div className="stack stack-s">
              <p className="eyebrow num">{a.reference} · {dt.format(a.createdAt)}</p>
              <h2 style={{ fontSize: "var(--step-1)" }}>{a.name}</h2>
              <p className="small"><a href={`mailto:${a.email}?subject=Your%20request%20${a.reference}`}>{a.email}</a> · {countryName(a.country)}</p>
              <p className="small">Interest: <strong>{a.interest}</strong> · {a.experience} · {a.hoursPerWeek}</p>
              <p className="small">Markets: {a.markets.join(", ")}</p>
              <p className="small">Goal: {a.goal}</p>
              <p className="small">Contact: {a.contactMoment}</p>
              {a.message && <p className="small notice">{a.message}</p>}
              {sim && <p className="small muted num">Simulator: {Math.round(sim.winRate * 100)}% · {sim.avgWinR.toFixed(1)}R · risk {sim.riskPct}% · {sim.trades} trades</p>}
            </div>
            <form action={setApplicationStatus} className="form" style={{ gap: "var(--s-3)" }}>
              <input type="hidden" name="id" value={a.id} />
              <label className="field">
                <span className="small">Status</span>
                <select name="status" defaultValue={a.status} className="select">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="small">Internal note</span>
                <textarea name="adminNote" defaultValue={a.adminNote ?? ""} className="textarea" style={{ minHeight: "5rem" }} />
              </label>
              <button className="btn btn-ghost btn-s" style={{ justifySelf: "start" }}>Save</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
