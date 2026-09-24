"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "Overview"],
  ["/admin/students", "Students"],
  ["/admin/orders", "Orders"],
  ["/admin/requests", "Requests"],
  ["/admin/cohorts", "Cohorts"],
  ["/admin/live", "Live sessions"],
  ["/admin/emails", "Emails"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin">
      {items.map(([href, label]) => (
        <Link key={href} href={href} aria-current={(href === "/admin" ? path === href : path.startsWith(href)) ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
