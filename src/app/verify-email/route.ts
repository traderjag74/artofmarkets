import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/tokens";
import { appUrl } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const row = token ? await db.authToken.findUnique({ where: { tokenHash: sha256(token) } }) : null;
  if (!row || row.type !== "VERIFY_EMAIL" || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl()}/dashboard?verify=expired`);
  }
  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }),
    db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.redirect(`${appUrl()}/dashboard?verified=1`);
}
