import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CONFIG } from "../src/config/site";

const db = new PrismaClient();

async function main() {
  // Products and cohorts come from CONFIG so prices live in one place.
  for (const p of CONFIG.products) {
    await db.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, name: p.name, kind: p.kind, priceUsd: p.priceUsd, priceLkr: p.priceLkr },
      update: { name: p.name, kind: p.kind, priceUsd: p.priceUsd, priceLkr: p.priceLkr },
    });
  }
  for (const c of CONFIG.cohorts) {
    const product = await db.product.findUniqueOrThrow({ where: { slug: c.product } });
    const data = {
      productId: product.id,
      name: c.name,
      startsAt: new Date(`${c.startsAt}T13:30:00Z`),
      endsAt: new Date(`${c.endsAt}T13:30:00Z`),
      seats: c.seats,
    };
    await db.cohort.upsert({ where: { code: c.code }, create: { code: c.code, ...data }, update: data });
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      await db.user.create({
        data: { email, name: "Desk admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12), emailVerifiedAt: new Date() },
      });
      console.log(`Created admin ${email}`);
    } else if (existing.role !== "ADMIN") {
      await db.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Promoted ${email} to admin`);
    }
  }

  if ((await db.liveSession.count()) === 0) {
    const day = 86400_000;
    const now = Date.now();
    await db.liveSession.createMany({
      data: [
        {
          title: "Weekly desk review: how we sized last week's trades",
          description: "Post-session review of closed trades from last week, including the losers. Prices shown are historical.",
          startsAt: new Date(now + 3 * day),
          youtubeUrl: CONFIG.site.youtube,
        },
        {
          title: "Live Q&A: the edge simulator and expectancy",
          description: "Bring your win rate and average R. We walk through what the numbers say, using the simulator on screen.",
          startsAt: new Date(now + 10 * day),
          youtubeUrl: CONFIG.site.youtube,
        },
      ],
    });
  }
  console.log("Seed complete");
}

main().finally(() => db.$disconnect());
