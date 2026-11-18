import Link from "next/link";
import { notFound } from "next/navigation";
import { DimensionBar, Swatches } from "@/components/ui";
import { tileStyle } from "@/lib/color";
import YouBadge from "@/components/YouBadge";
import { entries, learnHref, SYSTEMS, type SeasonEntry, type SystemId, type TypeEntry } from "@/lib/learn";

export const dynamicParams = false;
export function generateStaticParams() {
  return (Object.keys(SYSTEMS) as SystemId[]).flatMap((system) => entries(system).map((e) => ({ system, slug: e.slug })));
}

async function get(params: Promise<{ system: string; slug: string }>) {
  const { system, slug } = await params;
  const s = system as SystemId;
  const entry = SYSTEMS[s] ? entries(s).find((e) => e.slug === slug) : undefined;
  return { system: s, entry };
}

export async function generateMetadata({ params }: { params: Promise<{ system: string; slug: string }> }) {
  const { system, entry } = await get(params);
  return { title: entry ? `${entry.name} (${SYSTEMS[system].kicker}) · My Stylist` : "My Stylist" };
}

export default async function EntryPage({ params }: { params: Promise<{ system: string; slug: string }> }) {
  const { system, entry } = await get(params);
  if (!entry) notFound();
  const info = SYSTEMS[system];
  const season = system === "seasons" ? (entry as SeasonEntry) : null;
  const type = season ? null : (entry as TypeEntry);
  const all = entries(system);
  const tileClass = system === "seasons" ? "c1" : system === "kibbe" ? "c2" : "c3";

  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker"><Link href="/learn" style={{ color: "inherit" }}>Learn</Link> · <Link href={`/learn/${system}`} style={{ color: "inherit" }}>{info.title}</Link></div>
      </div>
      <div className={`tile ${tileClass}`} style={season ? { ...tileStyle(season.palette[0].hex), minHeight: 170 } : { minHeight: 170 }}>
        <span className="kicker">{season ? `${season.family} family` : info.kicker} <YouBadge system={system} slug={entry.slug} /></span>
        <div>
          <strong style={{ fontSize: 40 }}>{entry.name}</strong>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{entry.tagline}</div>
        </div>
      </div>
      <p className="lede" style={{ marginTop: 18 }}>{entry.about}</p>

      {season && (
        <>
          <section className="card">
            <h3>Where it sits</h3>
            <div className="dims" style={{ marginTop: 12 }}>
              <DimensionBar dim="hue" value={season.dims.hue} />
              <DimensionBar dim="value" value={season.dims.value} />
              <DimensionBar dim="chroma" value={season.dims.chroma} />
              <DimensionBar dim="contrast" value={season.dims.contrast} />
            </div>
          </section>
          <section className="card">
            <h3>Signature colors</h3>
            <Swatches colors={season.palette} />
            <h3 style={{ marginTop: 18 }}>Tricky colors</h3>
            <Swatches colors={season.avoid} avoid />
            <p className="muted small" style={{ marginTop: 12 }}>Your personal palette in the app is built from your own measurements, so it can differ a little from this general one.</p>
          </section>
          <section className="card">
            <h3>Styling tips</h3>
            <ul>{season.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        </>
      )}

      {type && (
        <>
          <div className="row" style={{ marginTop: 4 }}>{type.keywords.map((k) => <span key={k} className="badge">{k}</span>)}</div>
          <div className="grid2" style={{ marginTop: 6 }}>
            <section className="card"><h3>Wear</h3><ul>{type.wear.map((t) => <li key={t}>{t}</li>)}</ul></section>
            <section className="card"><h3>Skip</h3><ul>{type.skip.map((t) => <li key={t}>{t}</li>)}</ul></section>
          </div>
        </>
      )}

      <section style={{ marginTop: 18 }}>
        <div className="kicker" style={{ marginBottom: 8 }}>Close neighbours</div>
        <div className="row">
          {entry.neighbours.map((slug) => {
            const n = all.find((e) => e.slug === slug);
            return n ? <Link key={slug} href={learnHref(system, slug)} className="btn ghost sm" style={{ textDecoration: "none" }}>{n.name}</Link> : null;
          })}
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>Neighbours share a lot. If you're between two, both will have colors or shapes that work for you.</p>
      </section>
    </div>
  );
}
