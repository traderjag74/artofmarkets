import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { countryName } from "@/lib/countries";
import { d } from "../fmt";

export default async function Students({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }
    : {};
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { enrollments: { where: { active: true }, include: { product: true } } },
  });
  return (
    <div className="stack stack-l">
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "var(--step-3)" }}>Students</h1>
        <div className="cluster">
          <form className="cluster" role="search">
            <label htmlFor="q" className="sr-only">Search students</label>
            <input id="q" name="q" defaultValue={q} placeholder="Name or email" className="input" style={{ width: "16rem" }} />
            <button className="btn btn-ghost btn-s">Search</button>
          </form>
          <a href="/admin/students/export" className="btn btn-ghost btn-s">Export CSV</a>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Joined</th><th>Name</th><th>Email</th><th>Country</th><th>Programmes</th><th>Verified</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{d.format(u.createdAt)}</td>
                <td><Link href={`/admin/students/${u.id}`}>{u.name}</Link> {u.role === "ADMIN" && <span className="badge">Admin</span>}</td>
                <td>{u.email}</td>
                <td>{countryName(u.country)}</td>
                <td>{u.enrollments.map((e) => e.product.name).join(", ")}</td>
                <td>{u.emailVerifiedAt ? "Yes" : "No"}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="muted">No students found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
