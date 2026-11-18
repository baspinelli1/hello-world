"use client";
import { useState } from "react";
import type { AppState } from "@/lib/store";

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

  async function copy() {
    const text = list.filter((i) => !i.bought).map((i) => `• ${i.name} (search: ${i.thrift_search_terms})`).join("\n");
    try { await navigator.clipboard.writeText(`My Stylist shopping list\n${text}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  return (
    <div>
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Shopping list</div>
        <h1>Take this thrifting</h1>
        <p className="lede">Pieces that complete your looks, in your colors. Each has search terms that work on resale apps and help you scan the racks.</p>
      </div>
      {list.length === 0 ? (
        <div className="card flat"><p className="muted" style={{ margin: 0 }}>Nothing here yet. Add missing pieces from your outfit ideas or outfit checks.</p></div>
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
                    <div className="muted small">Search: “{i.thrift_search_terms}” · for {i.from}</div>
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
