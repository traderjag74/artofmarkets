import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote, and neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const users = await db.user.findMany({
    where: { role: "STUDENT", NOT: { email: { endsWith: "@invalid" } } },
    orderBy: { createdAt: "asc" },
    include: { enrollments: { where: { active: true }, include: { product: true } } },
  });
  const rows = [
    ["joined", "name", "email", "country", "email_verified", "marketing_opt_in", "programmes"],
    ...users.map((u) => [
      u.createdAt.toISOString(),
      u.name,
      u.email,
      u.country,
      u.emailVerifiedAt ? "yes" : "no",
      u.marketingOptIn ? "yes" : "no",
      u.enrollments.map((e) => e.product.slug).join(" "),
    ]),
  ];
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="students-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
