import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/config/site";

export const metadata: Metadata = { title: "About the desk", description: "Who we are, how we trade, how we make money, and what we will never do." };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container stack stack-xl" style={{ maxWidth: "46rem" }}>
        <div className="stack stack-l">
          <p className="eyebrow">About</p>
          <h1 style={{ fontSize: "var(--step-4)" }}>A small trading desk that teaches.</h1>
          <p className="lede muted">{CONFIG.site.name} is a proprietary desk based in {CONFIG.site.address}. We trade our own capital in futures, forex, equities and crypto-assets, and we teach the process we use.</p>
        </div>
        <div className="lesson">
          <h2>How we make money</h2>
          <p>From two things: our own trading, and course fees. We don't take referral commissions from brokers or exchanges, we don't sell signals, and we don't manage anyone else's money. That keeps what we teach independent of what you trade or where.</p>
          <h2>What we'll never do</h2>
          <ul>
            <li>Promise or imply that you will make money.</li>
            <li>Post selected winning trades or income screenshots.</li>
            <li>Tell you what to buy or sell, or give advice about your personal situation.</li>
            <li>Ask how much capital you have.</li>
          </ul>
          <h2>Why we publish no performance (yet)</h2>
          <p>Performance numbers only mean something if they're complete, independently verified and shown with their drawdowns. Until we can publish ours that way, we publish none. If that changes, it'll be on this page with the verifier named.</p>
          <h2>The people</h2>
          {CONFIG.instructors.map((i) => (
            <p key={i.name}><strong>{i.name}</strong>, {i.role}. {i.bio}</p>
          ))}
          <h2>Company details</h2>
          <p>{CONFIG.site.company} · Registration {CONFIG.site.companyRegNo} · {CONFIG.site.address} · <a href={`mailto:${CONFIG.site.email}`}>{CONFIG.site.email}</a></p>
        </div>
        <div className="cluster">
          <Link href="/apply" className="btn btn-primary">Talk to the desk</Link>
          <Link href="/legal/risk-disclosure" className="btn btn-ghost">Read the risk disclosure</Link>
        </div>
      </div>
    </section>
  );
}
