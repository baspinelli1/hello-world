import Link from "next/link";
import { ESSENCES, KIBBE, SEASONS, SYSTEMS } from "@/lib/learn";

export const metadata = { title: "Learn · Maven" };

export default function LearnHub() {
  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker">Learn</div>
        <h1>The style toolkit</h1>
        <p className="lede">The three systems pro stylists use, explained simply. Know the why, then wear whatever you like.</p>
      </div>
      <div className="tiles">
        <Link className="tile c1" href="/learn/seasons">
          <span className="kicker">{SEASONS.length} seasons</span>
          <div><strong>{SYSTEMS.seasons.title}</strong>
            <div className="mini">{SEASONS.map((s) => <span key={s.slug} style={{ background: s.palette[0].hex }} />).slice(0, 8)}</div>
          </div>
        </Link>
        <Link className="tile c2" href="/learn/kibbe"><span className="kicker">{KIBBE.length} types</span><strong>{SYSTEMS.kibbe.title}</strong></Link>
        <Link className="tile c3" href="/learn/essences"><span className="kicker">{ESSENCES.length} essences</span><strong>{SYSTEMS.essences.title}</strong></Link>
      </div>
      <Link href="/learn/how-it-works" className="card row between" style={{ textDecoration: "none", color: "inherit" }}>
        <div><div className="kicker">The science</div><h3 style={{ margin: 0 }}>How Maven analyzes you</h3></div>
        <span aria-hidden style={{ fontSize: 22 }}>→</span>
      </Link>
      <Link href="/learn/trends" className="card row between" style={{ textDecoration: "none", color: "inherit" }}>
        <div><div className="kicker">Shop smarter</div><h3 style={{ margin: 0 }}>Trends vs classics</h3></div>
        <span aria-hidden style={{ fontSize: 22 }}>→</span>
      </Link>
    </div>
  );
}
