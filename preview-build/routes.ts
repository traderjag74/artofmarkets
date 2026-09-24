/** Maps a site path to a plain hash token used by the static preview. */
export function toToken(href: string): string {
  if (!href.startsWith("/")) return "home";
  const path = href.split(/[?#]/)[0];
  const exact: Record<string, string> = {
    "/": "home", "/academy": "academy", "/apply": "apply", "/live": "live", "/notes": "notes", "/about": "about",
    "/register": "register", "/login": "login", "/forgot-password": "login", "/dashboard": "dashboard",
    "/dashboard/account": "account", "/learn/foundations": "foundations", "/learn/risk-and-process": "course",
    "/admin": "admin", "/admin/requests": "admin-requests", "/admin/orders": "admin-orders", "/admin/students": "admin-students",
  };
  if (exact[path]) return exact[path];
  if (path.startsWith("/notes/")) return "note-" + path.slice(7);
  if (path.startsWith("/legal/")) return "legal-" + path.slice(7);
  if (path.startsWith("/learn/foundations/")) return "foundations-lesson";
  if (path.startsWith("/learn/risk-and-process/")) return "lesson";
  if (path.startsWith("/checkout/")) return "checkout";
  if (path.startsWith("/admin")) return "admin";
  return "home";
}
