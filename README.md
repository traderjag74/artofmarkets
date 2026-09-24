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

## Go live (Vercel + Neon/Supabase + PayHere + Resend)

1. **Database:** create a Postgres database on Neon or Supabase and copy its connection string.
2. **Vercel:** import this repo and set these environment variables:
   `APP_URL=https://artofmarkets.com`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PAYMENT_PROVIDER=payhere`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX=true` (switch to `false` after testing), `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
   Set the build command to `npx prisma migrate deploy && npm run build`.
3. **Seed once:** run `DATABASE_URL=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed` locally against the production database.
4. **PayHere:** open a merchant account (<https://www.payhere.lk>), add `artofmarkets.com` as an approved domain, and copy the Merchant ID and the domain's Merchant Secret. Apply for **recurring payments** for the monthly membership. Test in the sandbox with PayHere's test cards first.
5. **Resend:** verify the `artofmarkets.com` domain (SPF and DKIM DNS records) and create an API key.
6. **Domain:** point artofmarkets.com to Vercel.

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
