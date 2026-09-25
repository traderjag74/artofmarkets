# Art of Markets — artofmarkets.com

Website and student platform for Art of Markets, a Sri Lanka–based trading desk that teaches trading.

The site teaches one idea: **win rate × reward-to-risk × position size decides whether an account survives**. Visitors explore it in the edge simulator at the top of the home page. The settings they choose carry over to the intro-call form, and from there they move on to the academy.

## What's in it

| Area | What it does |
|---|---|
| **Public site** | Home page with the edge simulator (Monte Carlo, Canvas), an expectancy grid, the academy path, how the desk trades, a Three.js volatility surface, and a trust section on a GLSL shader background. Also: academy, live sessions (YouTube), desk notes, about, legal pages |
| **Accounts** | Register, log in, email verification, forgot/reset password, change password, profile, delete account (personal data anonymised; payment records kept) |
| **Learning** | The free Foundations module (5 lessons) and the paid Risk & Process course (6 lessons), with per-lesson progress. Cohort and membership content is delivered live |
| **Payments** | Order → hosted checkout → signed webhook → enrolment → receipt email. PayHere (LKR + USD cards, monthly recurring for the membership) plus a mock provider for testing. Webhook retries are handled safely: each notification is processed once |
| **Email** | Resend (verify, reset, receipt, intro-call confirmation, admin notices). Without an API key, emails are stored and can be read under Admin → Emails |
| **Admin** | Overview (students, revenue, open requests), students (search, CSV export, grant/revoke access), orders (mark refunded), intro-call requests (status and notes, with the visitor's simulator profile), cohorts, live sessions, email log |

**Stack:** Next.js 15 (App Router, server actions), React 19, TypeScript, Prisma 6 + PostgreSQL, Three.js, and plain CSS built on design tokens (`src/styles/globals.css`).

## Run it locally

```bash
cp .env.example .env              # defaults work with a local Postgres
npm install
npx prisma migrate dev            # create tables
npm run db:seed                   # products, cohorts, admin user, sample live sessions
npm run dev                       # http://localhost:3000
npm test                          # simulator engine + PayHere signature tests
```

Log in as the admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. With `PAYMENT_PROVIDER=mock`, checkout goes to a test page where you can simulate a successful or declined payment.

## Go live on artofmarkets.com

Every push to `main` deploys automatically. Vercel runs `npm run vercel-build`, which applies database migrations, syncs products and cohorts from CONFIG, creates the admin account the first time, and builds the site.

1. **Database (Neon):** create a project in region *AWS Asia Pacific (Singapore)*. Copy two connection strings: the **pooled** one (for `DATABASE_URL`) and the **direct** one (for `DIRECT_URL`).
2. **Vercel:** import `traderjag74/artofmarkets` and add these environment variables (Production):

   | Variable | Value |
   |---|---|
   | `APP_URL` | `https://artofmarkets.com` |
   | `DATABASE_URL` / `DIRECT_URL` | from Neon |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your admin login (password ≥ 12 characters) |
   | `PAYMENT_PROVIDER` | `off` until PayHere is approved, then `payhere` |
   | `PAYHERE_MERCHANT_ID` / `PAYHERE_MERCHANT_SECRET` / `PAYHERE_SANDBOX` | from PayHere (`true` while testing) |
   | `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_REPLY_TO` | from Resend |

   Functions run in Singapore (`vercel.json`), next to the database. A commercial site needs Vercel's Pro plan.
3. **Domain:** in Vercel → Project → Settings → Domains, add `artofmarkets.com` and `www.artofmarkets.com`, then create the DNS records Vercel shows at your domain registrar.
4. **Email (Resend):** add the domain `artofmarkets.com` and create the DNS records it shows (SPF, DKIM). Once it's verified, create an API key and set `RESEND_API_KEY`.
5. **Payments (PayHere):** apply for a business merchant account (you need your company registration), add `artofmarkets.com` as a domain, and apply for recurring billing for the membership. Test with `PAYHERE_SANDBOX=true` and PayHere's test cards, then switch to the live credentials and `PAYHERE_SANDBOX=false`.

`PAYMENT_PROVIDER` controls checkout:
- `off`: paid programmes show "opening soon" with an intro-call button. This is the default in production.
- `payhere`: real card payments.
- `mock`: fake payments for testing. In production this also needs `ALLOW_TEST_PAYMENTS=true`, so nobody gets free access by accident.

## Where to change things

- **`src/config/site.ts` (CONFIG):** every business assumption lives here: prices (USD and LKR), programmes, cohort dates, simulator defaults and presets, ruin threshold, risk-warning text, regulator details, proof numbers, instructors, testimonials and form options. After changing products or cohorts, run `npm run db:seed` again.
- **`src/content/`:** lesson text, desk notes, the cohort plan, membership contents and the FAQ.
- **`src/app/legal/[page]/page.tsx`:** risk disclosure, terms, privacy, refunds and complaints.

## Placeholders to replace before launch

Everything below is marked in the code:
- company name, registration number and address
- instructors and their bios
- proof numbers (years trading, students taught, review score)
- testimonials
- regulator status wording
- dispute-resolution body in the complaints page
- prices and cohort dates (research-based suggestions)
- the YouTube channel URL

## Compliance notes (read before launch)

This site is built to make no claims the firm couldn't substantiate. **Have a Sri Lankan securities lawyer review it before launch.**

- **No income or return claims anywhere.** Testimonials are only about the teaching, and each one is labelled as an individual experience. There is no lifestyle imagery.
- **A risk warning is always visible** (the sticky bar), with the full disclosure in the footer and on `/legal/risk-disclosure`.
- **Every simulated result sits next to hypothetical-performance wording** in the style of CFTC Rule 4.41.
- **The site states it offers education, not advice.** It gives no signals, does not recommend brokers and takes no referral commissions. Forms never ask about capital or account size.
- **Sri Lanka:** the Central Bank of Sri Lanka has warned that forex trading and sending money abroad for it without CBSL approval may breach the Foreign Exchange Act, and that payment cards may not be used for crypto. The site says so in the footer, the disclosure and the Foundations lesson. Confirm with counsel whether teaching forex and crypto to Sri Lankan residents needs extra safeguards, and whether any SEC Sri Lanka licensing applies.
- **YouTube live sessions:** keep them to reviews of closed trades on historical charts, plus Q&A. Streaming live trade calls can amount to regulated investment advice in many countries. India's SEBI, for example, now bars unregistered educators from using live market prices. The live page says how sessions are run.
- **Global audience:** the UK FCA treats any communication that invites or induces investment as a financial promotion, and the US FTC has acted against trading educators over earnings claims (Warrior Trading, 2022). Keep all copy, including social media and affiliate copy, inside these rules.

## Research behind the product ladder

Four steps, from free to monthly:
1. **Free:** Foundations, the simulator and YouTube lives.
2. **Self-paced course:** Risk & Process.
3. **Live cohort:** Strategy Building, with capped seats.
4. **Monthly membership:** Desk Mentorship.

Cohort courses in this market commonly sell for $2,000–5,000 and self-paced courses for $497–1,997. Alumni subscriptions are often priced at 10–20% of the main course. The prices in CONFIG sit well below those benchmarks, to suit a South Asian and global audience, and are paid in LKR through PayHere for Sri Lanka. Signals, copy trading and broker referral deals were left out deliberately, for regulatory and independence reasons.

## Static preview (private claude.ai link)

`preview-build/` turns the running site into one self-contained HTML page for sharing a clickable preview before deployment. It snapshots every page and remounts the interactive parts (simulator, grid, 3D surface, shader) from an esbuild bundle. Forms don't submit in the preview.

```bash
npm run build && npm start   # site running on :3000, seeded, with a demo student and the admin
./node_modules/.bin/esbuild preview-build/entry.tsx --bundle --minify --format=iife --jsx=automatic \
  --alias:next/link=./preview-build/link-shim.tsx --define:process.env.NODE_ENV='"production"' --outfile=<dir>/bundle.js
# write <dir>/snap.json with the page snapshots (see preview-build/assemble.mjs for the shape), then:
node preview-build/assemble.mjs <dir>
```
