import Link from "next/link";
import { CONFIG } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { Logo } from "./Logo";

const links = [
  { href: "/#simulator", label: "Simulator" },
  { href: "/academy", label: "Academy" },
  { href: "/live", label: "Live sessions" },
  { href: "/notes", label: "Desk notes" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="site-header">
      <div className="container-wide">
        <Link href="/" className="brand" aria-label={`${CONFIG.site.name} home`}>
          <Logo />
          <span>{CONFIG.site.name}</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <div className="nav-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>
          {user ? (
            <details className="menu">
              <summary className="btn btn-ghost btn-s">{user.name.split(" ")[0]}</summary>
              <div className="menu-panel">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/dashboard/account">Account</Link>
                {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
                <span className="menu-mobile-only" style={{ display: "contents" }}>
                  {links.map((l) => (
                    <Link key={l.href} href={l.href}>{l.label}</Link>
                  ))}
                </span>
                <form action={logoutAction}>
                  <button type="submit">Log out</button>
                </form>
              </div>
            </details>
          ) : (
            <div className="cluster" style={{ ["--gap" as string]: "var(--s-2)" }}>
              <Link href="/login" className="nav-links">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-s">Start free</Link>
              <details className="menu menu-mobile-only">
                <summary className="btn btn-ghost btn-s" aria-label="Menu">Menu</summary>
                <div className="menu-panel">
                  {links.map((l) => (
                    <Link key={l.href} href={l.href}>{l.label}</Link>
                  ))}
                  <Link href="/login">Log in</Link>
                </div>
              </details>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
