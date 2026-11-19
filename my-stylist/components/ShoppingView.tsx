"use client";
import { useState } from "react";
import { uid, type AppState } from "@/lib/store";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void };

export default function ShoppingView({ state, update }: Props) {
  const [copied, setCopied] = useState(false);
  const list = state.shopping;
  const groups = [
    { title: "Wardrobe basics", items: list.filter((i) => i.is_basic && !i.bought) },
    { title: "Statement pieces", items: list.filter((i) => !i.is_basic && !i.bought) },
    { title: "Found it", items: list.filter((i) => i.bought) },
  ];

  const set = (id: string, patch: Partial<(typeof list)[number]>) =>
    update({ shopping: list.map((i) => (i.id === id ? { ...i, ...patch } : i)) });

  const [name, setName] = useState("");
  const [hex, setHex] = useState<string | null>(null);
  const [basic, setBasic] = useState(true);
  const [terms, setTerms] = useState("");
  const [more, setMore] = useState(false);
  const p = state.profile?.color.palette;
  const swatches = p ? [...p.neutrals, ...p.core, ...p.accents].filter((c, i, a) => a.findIndex((x) => x.hex === c.hex) === i) : [];

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    update({
      shopping: [
        { id: uid(), name: n, color_hex: hex ?? "#E5DDD2", is_basic: basic, thrift_search_terms: terms.trim() || n.toLowerCase(), from: "added by you", bought: false },
        ...list,
      ],
    });
    setName(""); setTerms(""); setHex(null); setMore(false);
  }

  async function copy() {
    const text = list.filter((i) => !i.bought).map((i) => `• ${i.name} (search: ${i.thrift_search_terms})`).join("\n");
    try { await navigator.clipboard.writeText(`Maven shopping list\n${text}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  return (
    <div>
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Shopping list</div>
        <h1>Take this thrifting</h1>
        <p className="lede">Pieces that complete your looks, in your colors. Each has search terms that work on resale apps and help you scan the racks.</p>
      </div>
      <form className="card stack" onSubmit={addItem} style={{ marginTop: 12 }}>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input className="input" placeholder="Add an item, e.g. camel trench coat" value={name} onChange={(e) => setName(e.target.value)} aria-label="Item name" />
          <button className="btn accent" type="submit" disabled={!name.trim()}>Add</button>
        </div>
        <button type="button" className="linkish small" style={{ alignSelf: "flex-start" }} onClick={() => setMore(!more)}>{more ? "Fewer options" : "Color, type and search terms (optional)"}</button>
        {more && (
          <div className="stack">
            {swatches.length > 0 && (
              <div>
                <div className="kicker" style={{ marginBottom: 8 }}>Color from your palette</div>
                <div className="pick">
                  {swatches.map((c) => (
                    <button key={c.hex} type="button" title={c.name} aria-label={c.name} aria-pressed={hex === c.hex} className={hex === c.hex ? "on" : ""} style={{ background: c.hex }} onClick={() => setHex(hex === c.hex ? null : c.hex)} />
                  ))}
                </div>
              </div>
            )}
            <div className="row">
              <button type="button" className={`btn sm ${basic ? "" : "ghost"}`} onClick={() => setBasic(true)}>Wardrobe basic</button>
              <button type="button" className={`btn sm ${basic ? "ghost" : ""}`} onClick={() => setBasic(false)}>Statement piece</button>
            </div>
            <input className="input" placeholder="Search terms or a note, e.g. wool, under $40" value={terms} onChange={(e) => setTerms(e.target.value)} aria-label="Search terms or note" />
          </div>
        )}
      </form>
      {list.length === 0 ? (
        <div className="card flat"><p className="muted" style={{ margin: 0 }}>Nothing here yet. Add your own items above, or add missing pieces from your outfit ideas and outfit checks.</p></div>
      ) : (
        <>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn sm ghost" onClick={copy}>{copied ? "Copied" : "Copy list"}</button>
            <button className="linkish small" onClick={() => update({ shopping: list.filter((i) => !i.bought) })}>clear found items</button>
          </div>
          {groups.map((g) => g.items.length > 0 && (
            <section key={g.title} className="card">
              <h3>{g.title}</h3>
              {g.items.map((i) => (
                <div className="item" key={i.id}>
                  <input type="checkbox" className="check" checked={i.bought} onChange={() => set(i.id, { bought: !i.bought })} aria-label={`Mark ${i.name} found`} />
                  <span className="chip" style={{ background: i.color_hex }} />
                  <span className="grow" style={{ textDecoration: i.bought ? "line-through" : "none" }}>
                    {i.name}
                    <div className="muted small">Search: “{i.thrift_search_terms}” · {i.from === "added by you" ? "added by you" : `for ${i.from}`}</div>
                  </span>
                  <button className="linkish small" onClick={() => update({ shopping: list.filter((x) => x.id !== i.id) })} aria-label={`Remove ${i.name}`}>remove</button>
                </div>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
