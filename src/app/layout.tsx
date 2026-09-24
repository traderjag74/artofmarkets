import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "@/styles/globals.css";
import { CONFIG } from "@/config/site";
import { appUrl } from "@/lib/env";
import { RiskBar } from "@/components/RiskBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", style: ["normal", "italic"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: `${CONFIG.site.name}: a trading desk that teaches`, template: `%s · ${CONFIG.site.name}` },
  description:
    "Learn how win rate, reward-to-risk and position size decide whether a trading account survives. Honest trading education from people who trade. No income claims.",
  openGraph: { siteName: CONFIG.site.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#F5F3EE", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <RiskBar />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
