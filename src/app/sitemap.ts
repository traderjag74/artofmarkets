import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";
import { NOTES } from "@/content/notes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const pages = ["", "/academy", "/live", "/notes", "/about", "/apply", "/register", "/legal/risk-disclosure", "/legal/terms", "/legal/privacy", "/legal/refunds", "/legal/complaints"];
  return [...pages.map((p) => ({ url: `${base}${p}` })), ...NOTES.map((n) => ({ url: `${base}/notes/${n.slug}`, lastModified: n.date }))];
}
