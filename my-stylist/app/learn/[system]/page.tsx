import Link from "next/link";
import { notFound } from "next/navigation";
import YouBadge from "@/components/YouBadge";
import { entries, learnHref, SEASONS, SYSTEMS, type SystemId } from "@/lib/learn";

export const dynamicParams = false;
export function generateStaticParams() {
  return (Object.keys(SYSTEMS) as SystemId[]).map((system) => ({ system }));
}

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  return { title: `${SYSTEMS[system as SystemId]?.title ?? "Learn"} · My Stylist` };
}

export default async function SystemPage({ params }: { params: Promise<{ system: string }> }) {
  const { system } = (await params) as { system: SystemId };
  const info = SYSTEMS[system];
  if (!info) notFound();
  const tileClass = system === "seasons" ? "c1" : system === "kibbe" ? "c2" : "c3";

  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker"><Link href="/learn" style={{ color: "inherit" }}>Learn</Link> · {info.kicker}</div>
        <h1>{info.title}</h1>
        <p className="lede">{info.intro}</p>
        <div className="notice" style={{ marginTop: 12 }}>{info.note}</div>
      </div>

      {system === "seasons" ? (
        (["Spring", "Summer", "Autumn", "Winter"] as const).map((family) => (
          <section key={family} style={{ marginTop: 24 }}>
            <h2>{family}</h2>
            {SEASONS.filter((s) => s.family === family).map((s) => (
              <Link key={s.slug} href={learnHref("seasons", s.slug)} className="card row between" style={{ textDecoration: "none", color: "inherit", margin: "10px 0", flexWrap: "nowrap" }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0 }}>{s.name} <YouBadge system="seasons" slug={s.slug} /></h3>
                  <div className="muted small">{s.tagline}</div>
                  <div className="strip" style={{ marginTop: 8 }}>{s.palette.map((c) => <span key={c.hex} style={{ background: c.hex }} />)}</div>
                </div>
                <span aria-hidden style={{ fontSize: 22 }}>→</span>
              </Link>
            ))}
          </section>
        ))
      ) : (
        <div className="typegrid">
          {entries(system).map((e) => (
            <Link key={e.slug} href={learnHref(system, e.slug)} className={`tile ${tileClass}`}>
              <span className="kicker">{e.tagline}</span>
              <strong style={{ fontSize: 20 }}>{e.name} <YouBadge system={system} slug={e.slug} /></strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
