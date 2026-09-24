import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONFIG } from "@/config/site";

const C = CONFIG.site;
const UPDATED = "24 September 2026";

type Doc = { title: string; Body: () => React.ReactNode };

const DOCS: Record<string, Doc> = {
  "risk-disclosure": {
    title: "Risk disclosure",
    Body: () => (
      <>
        <p>Trading forex, crypto-assets, equities and futures involves substantial risk of loss and is not suitable for everyone. Please read this page before you trade or buy any of our programmes.</p>
        <h2>Most retail traders lose money</h2>
        <p>Studies by regulators consistently find that most retail traders of leveraged products lose money. The European Securities and Markets Authority, for example, found that 74–89% of retail accounts trading contracts for difference lost money. Education can improve your process; it cannot remove this risk.</p>
        <h2>Leverage</h2>
        <p>Leveraged products let you control a position larger than your deposit. A small price move against you can cause losses larger than you expect, and with some products larger than your deposit.</p>
        <h2>Crypto-assets</h2>
        <p>Crypto-assets are highly volatile, largely unregulated in many countries, and exchanges can fail or be hacked. You can lose everything you put in.</p>
        <h2>Simulated and hypothetical results</h2>
        <p>{CONFIG.risk.hypothetical}</p>
        <h2>Education, not advice</h2>
        <p>{C.name} provides general trading education. Nothing we publish, teach or say in live sessions is personal financial advice, a recommendation to buy or sell any instrument, or an invitation to invest with us. We do not manage client money. {CONFIG.risk.regulator ? `${C.company} is regulated by ${CONFIG.risk.regulator.name}, licence ${CONFIG.risk.regulator.licence}.` : `[PLACEHOLDER: regulatory status to be confirmed by counsel] ${C.company} is not licensed by the Securities and Exchange Commission of Sri Lanka as an investment adviser.`}</p>
        <h2>Sri Lankan residents</h2>
        <p>The Central Bank of Sri Lanka has publicly warned that engaging in foreign exchange trading and remitting funds abroad for that purpose without its approval may breach the Foreign Exchange Act, and that electronic fund transfer cards may not be used for payments related to crypto-asset transactions. It has also warned the public about the risks of crypto-assets. You are responsible for complying with the laws that apply to you.</p>
        <h2>Other countries</h2>
        <p>Rules differ by country. Use only brokers and exchanges authorised where you live, and check what you are permitted to trade.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of use",
    Body: () => (
      <>
        <p className="notice">[DRAFT for legal review] These terms are a starting template and must be reviewed by a Sri Lankan lawyer before launch.</p>
        <h2>1. Who we are</h2>
        <p>This website is operated by {C.company} (registration {C.companyRegNo}), {C.address} ("we", "us"). Contact: {C.email}.</p>
        <h2>2. Educational service only</h2>
        <p>We provide general trading education. We do not provide investment advice, portfolio management, signals or brokerage services, and nothing on the site is an offer to invest with us.</p>
        <h2>3. Your account</h2>
        <p>You must be 18 or older. Keep your password confidential; you are responsible for activity under your account. Course access is personal and may not be shared or resold.</p>
        <h2>4. Payments</h2>
        <p>Prices are shown before payment in USD or LKR. Payments are processed by our payment provider; we do not see or store your full card details. Memberships renew monthly until cancelled.</p>
        <h2>5. Refunds</h2>
        <p>See the refund policy.</p>
        <h2>6. Intellectual property</h2>
        <p>Course material is ours or licensed to us. You may use it for your own learning. You may not copy, publish or distribute it.</p>
        <h2>7. No guarantee of results</h2>
        <p>We do not promise or imply any trading results. Your trading decisions, and their outcomes, are your own.</p>
        <h2>8. Liability</h2>
        <p>To the extent the law allows, we are not liable for trading losses or indirect losses. Nothing limits liability that cannot be limited by law.</p>
        <h2>9. Changes and law</h2>
        <p>We may update these terms; the version on this page applies. These terms are governed by the laws of Sri Lanka.</p>
        <p className="small muted">Last updated {UPDATED}.</p>
      </>
    ),
  },
  privacy: {
    title: "Privacy policy",
    Body: () => (
      <>
        <p className="notice">[DRAFT for legal review] Written with Sri Lanka's Personal Data Protection Act, No. 9 of 2022, in mind. Have it reviewed before launch, especially for EU/UK visitors.</p>
        <h2>What we collect</h2>
        <ul>
          <li>Account data: name, email, country, password (stored only as a secure hash).</li>
          <li>Learning data: programmes, lesson progress.</li>
          <li>Payment data: order amounts and references. Card details are handled by our payment provider (PayHere) and never reach our servers.</li>
          <li>Enquiries: the answers you give on the intro-call form, and any simulator settings you chose to send.</li>
          <li>Technical data needed to run and secure the site, such as IP addresses for rate limiting.</li>
        </ul>
        <h2>What we don't collect</h2>
        <p>We don't ask for your capital, account balances or trading account details. We don't use advertising trackers.</p>
        <h2>Why we use it</h2>
        <p>To provide your account and courses, take payments, answer enquiries, send service emails (receipts, cohort details), and, only if you opted in, tell you about new sessions and cohorts.</p>
        <h2>Who we share it with</h2>
        <p>Service providers that run the site for us: hosting and database, email delivery (Resend), and payments (PayHere). We don't sell personal data.</p>
        <h2>How long we keep it</h2>
        <p>Account data while your account is open. Payment records for as long as tax law requires. Enquiries for up to two years.</p>
        <h2>Your rights</h2>
        <p>You can access, correct or delete your data. Most of this is available in your account settings, including deleting your account. For anything else, email {C.email}.</p>
        <p className="small muted">Last updated {UPDATED}.</p>
      </>
    ),
  },
  refunds: {
    title: "Refund policy",
    Body: () => (
      <>
        <ul>
          <li><strong>Self-paced courses:</strong> full refund within 14 days of purchase if you have completed less than a third of the lessons.</li>
          <li><strong>Cohorts:</strong> full refund up to 7 days before the cohort starts. After that, you can move once to a later cohort at no cost.</li>
          <li><strong>Memberships:</strong> cancel any time; access continues until the end of the month you paid for. We don't refund part-months.</li>
        </ul>
        <p>To ask for a refund, email {C.email} with your order reference. Refunds go back to the original payment method, usually within 10 working days.</p>
        <p className="small muted">Last updated {UPDATED}.</p>
      </>
    ),
  },
  complaints: {
    title: "Complaints",
    Body: () => (
      <>
        <p>If something isn't right, we want to know. Email {C.email} with "Complaint" in the subject and, if relevant, your order reference.</p>
        <ol>
          <li>We acknowledge your complaint within 2 working days.</li>
          <li>We aim to give a full answer within 15 working days.</li>
          <li>If you're not satisfied, you can ask for the complaint to be reviewed by a director of {C.company}.</li>
        </ol>
        <p>[PLACEHOLDER: add any external dispute-resolution body that applies, once confirmed by counsel.]</p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const d = DOCS[(await params).page];
  return d ? { title: d.title } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ page: string }> }) {
  const doc = DOCS[(await params).page];
  if (!doc) notFound();
  const Body = doc.Body;
  return (
    <article className="section">
      <div className="container stack stack-l" style={{ maxWidth: "44rem" }}>
        <p className="eyebrow">Legal</p>
        <h1 style={{ fontSize: "var(--step-4)" }}>{doc.title}</h1>
        <div className="lesson"><Body /></div>
      </div>
    </article>
  );
}
