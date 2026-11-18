import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="shell">
      <header className="masthead">
        <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>My <em>Stylist</em></Link>
        <Link href="/learn" className="kicker" style={{ textDecoration: "none" }}>Learn</Link>
      </header>
      {children}
      <p style={{ marginTop: 36 }}><Link href="/" className="btn ghost sm" style={{ textDecoration: "none" }}>← Back to my style</Link></p>
    </main>
  );
}
