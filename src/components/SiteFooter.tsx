import Link from "next/link";
import { CONFIG } from "@/config/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container-wide stack stack-l">
        <div className="footer-cols">
          <div className="stack stack-s">
            <span className="brand"><Logo size={24} /> {CONFIG.site.name}</span>
            <p className="muted">{CONFIG.site.tagline}</p>
          </div>
          <div>
            <p className="eyebrow">Learn</p>
            <ul>
              <li><Link href="/#simulator">Edge simulator</Link></li>
              <li><Link href="/academy">Academy</Link></li>
              <li><Link href="/learn/foundations">Free Foundations module</Link></li>
              <li><Link href="/live">Live sessions</Link></li>
              <li><Link href="/notes">Desk notes</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Company</p>
            <ul>
              <li><Link href="/about">About the desk</Link></li>
              <li><Link href="/apply">Book an intro call</Link></li>
              <li><a href={`mailto:${CONFIG.site.email}`}>{CONFIG.site.email}</a></li>
              <li><a href={CONFIG.site.youtube} rel="noopener">YouTube</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Legal</p>
            <ul>
              <li><Link href="/legal/risk-disclosure">Risk disclosure</Link></li>
              <li><Link href="/legal/terms">Terms of use</Link></li>
              <li><Link href="/legal/privacy">Privacy policy</Link></li>
              <li><Link href="/legal/refunds">Refund policy</Link></li>
              <li><Link href="/legal/complaints">Complaints</Link></li>
            </ul>
          </div>
        </div>
        <div id="risk-disclosure" className="stack stack-s disclaimer rule-top" style={{ paddingTop: "var(--s-5)" }}>
          <p><strong>Risk disclosure.</strong> Trading forex, crypto-assets, equities and futures involves substantial risk of loss and is not suitable for everyone. Leveraged products can lose money faster than you deposit it. Most retail traders lose money. Only trade with money you can afford to lose. Past performance, and hypothetical or simulated performance, is not a reliable indicator of future results.</p>
          <p><strong>Education, not advice.</strong> {CONFIG.site.name} provides general trading education. Nothing on this site, in our courses or in our live sessions is personal financial advice, a recommendation to buy or sell any instrument, or an invitation to invest with us. We do not manage client money. {CONFIG.risk.regulator ? `${CONFIG.site.company} is regulated by ${CONFIG.risk.regulator.name}, licence ${CONFIG.risk.regulator.licence}.` : `[PLACEHOLDER: regulatory status to be confirmed by counsel] ${CONFIG.site.company} is not licensed by the Securities and Exchange Commission of Sri Lanka as an investment adviser.`}</p>
          <p><strong>Sri Lankan residents.</strong> The Central Bank of Sri Lanka has warned that foreign exchange trading and remitting funds abroad for such trading without its approval may breach the Foreign Exchange Act, and that payment cards may not be used for crypto-asset transactions. Check the rules that apply to you before you trade.</p>
          <p>© {year} {CONFIG.site.company} · Reg. {CONFIG.site.companyRegNo} · {CONFIG.site.address}</p>
        </div>
      </div>
    </footer>
  );
}
