import Link from "next/link";
import { CONFIG } from "@/config/site";

export function RiskBar() {
  const r = CONFIG.risk;
  return (
    <div className="risk-bar" role="note" aria-label="Risk warning">
      <p>
        {r.lossRatePct !== null ? `${r.lossRatePct}% of retail accounts lose money. ` : ""}
        {r.short} <Link href="/legal/risk-disclosure">Read the risk disclosure</Link>
      </p>
    </div>
  );
}
