import { db } from "@/lib/db";
import { createCohort, toggleCohort } from "../actions";
import { d } from "../fmt";

export default async function Cohorts() {
  const [cohorts, products] = await Promise.all([
    db.cohort.findMany({ orderBy: { startsAt: "desc" }, include: { product: true, _count: { select: { enrollments: { where: { active: true } } } } } }),
    db.product.findMany({ where: { kind: "COHORT" } }),
  ]);
  return (
    <div className="stack stack-xl">
      <h1 style={{ fontSize: "var(--step-3)" }}>Cohorts</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Dates</th><th className="num">Enrolled</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.id}>
                <td className="num">{c.code}</td>
                <td>{c.name}<div className="tiny muted">{c.product.name}</div></td>
                <td>{d.format(c.startsAt)} – {d.format(c.endsAt)}</td>
                <td className="num">{c._count.enrollments} / {c.seats}</td>
                <td>{c.open ? "Open" : "Closed"}</td>
                <td>
                  <form action={toggleCohort}><input type="hidden" name="id" value={c.id} /><button className="btn-link small">{c.open ? "Close sales" : "Reopen"}</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createCohort} className="card form" style={{ maxWidth: "40rem" }}>
        <h2 style={{ fontSize: "var(--step-2)" }}>Add a cohort</h2>
        <div className="grid grid-2" style={{ ["--gap" as string]: "var(--s-4)" }}>
          <label className="field"><span>Programme</span><select name="productId" className="select">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="field"><span>Code</span><input name="code" className="input" placeholder="SB-2027-05" required /></label>
          <label className="field"><span>Name</span><input name="name" className="input" placeholder="May 2027 cohort" required /></label>
          <label className="field"><span>Seats</span><input name="seats" type="number" min={1} defaultValue={24} className="input" required /></label>
          <label className="field"><span>Starts</span><input name="startsAt" type="date" className="input" required /></label>
          <label className="field"><span>Ends</span><input name="endsAt" type="date" className="input" required /></label>
        </div>
        <button className="btn btn-primary" style={{ justifySelf: "start" }}>Add cohort</button>
      </form>
    </div>
  );
}
