import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container stack stack-l center" style={{ maxWidth: "36rem" }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "var(--step-4)" }}>This page doesn't exist.</h1>
        <p className="muted">It may have moved. The simulator and the academy are good places to start.</p>
        <div className="cluster" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-primary">Home</Link>
          <Link href="/academy" className="btn btn-ghost">Academy</Link>
        </div>
      </div>
    </section>
  );
}
