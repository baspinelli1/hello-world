"use client";
import { useState } from "react";
import { filesToDataUrls } from "@/lib/image";
import type { Critique } from "@/lib/schemas";
import { api, uid, type AppState, type JournalEntry } from "@/lib/store";
import { getTrends } from "./trends";
import { DemoNote, ErrorBox, TrendBadge } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void };

const OVERALL: Record<Critique["overall"], [string, string]> = {
  great_match: ["Made for you", "good"],
  works_with_tweaks: ["Works with a few tweaks", "accent"],
  fun_but_fighting_your_features: ["Fun, but fighting your features", "warn"],
};

export function CritiqueCard({ c, onAdd }: { c: Critique; onAdd?: (basicsOnly: boolean) => void }) {
  const [label, cls] = OVERALL[c.overall];
  return (
    <div className="stack">
      <div className="row between"><span className={`badge ${cls}`}>{label}</span><TrendBadge status={c.trend_check.status} /></div>
      <p className="muted">{c.what_i_see}</p>
      {(["color", "body", "essence"] as const).map((k) => (
        <div key={k}>
          <div className="kicker">{k === "body" ? "Body lines" : k}</div>
          <strong>{c[k].verdict}</strong>
          <p className="small" style={{ marginTop: 4 }}>{c[k].detail}</p>
        </div>
      ))}
      <div className="card flat small" style={{ margin: 0 }}>
        <div className="kicker" style={{ marginBottom: 4 }}>Trend or classic?</div>
        {c.trend_check.explanation}
      </div>
      <div>
        <h3>Make it yours</h3>
        <ul>{c.make_it_yours.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      {c.missing_items.length > 0 && (
        <div>
          <h3>Pieces to recreate it your way</h3>
          {c.missing_items.map((i) => (
            <div className="item" key={i.name}>
              <span className="chip" style={{ background: i.color_hex }} />
              <span className="grow">{i.name} {i.is_basic && <span className="badge">basic</span>}<div className="muted small">Search: {i.thrift_search_terms}</div></span>
            </div>
          ))}
          {onAdd && (
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn sm ghost" onClick={() => onAdd(true)}>+ Basics to shopping list</button>
              <button className="linkish small" onClick={() => onAdd(false)}>add all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckView({ state, update }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<JournalEntry | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  async function check() {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const trends = await getTrends(state, update);
      const { result, demo } = await api<Critique>("/api/critique", { profile: state.profile, image, context, trends });
      const entry: JournalEntry = { id: uid(), image, context, critique: result, date: new Date().toISOString() };
      setCurrent(entry);
      update({ journal: [entry, ...state.journal].slice(0, 50), demo: state.demo || demo });
      setImage(null);
      setContext("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  function addItems(entry: JournalEntry, basicsOnly: boolean) {
    const existing = new Set(state.shopping.map((s) => s.name.toLowerCase()));
    const items = entry.critique.missing_items
      .filter((i) => (!basicsOnly || i.is_basic) && !existing.has(i.name.toLowerCase()))
      .map((i) => ({ ...i, id: uid(), from: "Outfit check", bought: false }));
    update({ shopping: [...state.shopping, ...items] });
    setAdded(`${items.length} item${items.length === 1 ? "" : "s"} added to your shopping list`);
    setTimeout(() => setAdded(null), 2500);
  }

  return (
    <div>
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Outfit check</div>
        <h1>Will this work on me?</h1>
        <p className="lede">Send a photo of an outfit you're wearing, one in a shop, or a screenshot of inspiration. You'll get the why, not just a yes or no.</p>
      </div>
      <DemoNote show={state.demo} />
      <div className="card stack">
        <label className="drop">
          <input type="file" accept="image/*" onChange={async (e) => {
            const input = e.currentTarget;
            const files = Array.from(input.files ?? []).slice(0, 1);
            input.value = "";
            if (!files.length) return;
            setError(null);
            const { urls } = await filesToDataUrls(files);
            if (urls[0]) setImage(urls[0]); else setError("That photo couldn't be read. Try another, or a screenshot of it.");
          }} />
          {image ? <img src={image} alt="Outfit" style={{ maxHeight: 280, margin: "0 auto", borderRadius: 12 }} /> : <><strong>Add an outfit photo</strong><div className="muted small">On you, on a hanger, or a screenshot</div></>}
        </label>
        <input className="input" placeholder="Optional: anything to add? e.g. for a winter wedding" value={context} onChange={(e) => setContext(e.target.value)} />
        <button className="btn accent block" disabled={!image || busy} onClick={check}>{busy ? "Looking closely…" : "Check this outfit"}</button>
        <ErrorBox error={error} />
      </div>
      {added && <div className="notice" role="status">{added}</div>}
      {current && (
        <article className="card">
          <img src={current.image} alt="" style={{ maxHeight: 320, margin: "0 auto 12px", borderRadius: 12 }} />
          <CritiqueCard c={current.critique} onAdd={(b) => addItems(current, b)} />
        </article>
      )}
      {state.journal.filter((j) => j.id !== current?.id).length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Your outfit journal</h2>
          {state.journal.filter((j) => j.id !== current?.id).map((j) => (
            <details key={j.id} className="card">
              <summary className="row" style={{ listStyle: "none" }}>
                <img src={j.image} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />
                <span className="grow" style={{ flex: 1 }}>{OVERALL[j.critique.overall][0]}<div className="muted small">{new Date(j.date).toLocaleDateString()}</div></span>
              </summary>
              <div style={{ marginTop: 12 }}><CritiqueCard c={j.critique} onAdd={(b) => addItems(j, b)} /></div>
            </details>
          ))}
        </>
      )}
    </div>
  );
}
