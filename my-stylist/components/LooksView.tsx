"use client";
import { useState } from "react";
import type { Look, Looks } from "@/lib/schemas";
import { api, uid, type AppState, type ShoppingItem } from "@/lib/store";
import { getTrends } from "./trends";
import { DemoNote, ErrorBox, TrendBadge } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void };

const brief = (l: Look) => ({ title: l.title, vibe: l.vibe, items: l.items.map((i) => `${i.color_name} ${i.name}`) });

export default function LooksView({ state, update }: Props) {
  const [request, setRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learned, setLearned] = useState("");
  const [added, setAdded] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const trends = await getTrends(state, update);
      const { result, demo } = await api<Looks>("/api/looks", {
        profile: state.profile,
        liked: state.liked.slice(-20).map(brief),
        disliked: state.disliked.slice(-20).map(brief),
        request,
        trends,
        count: 4,
      });
      const seen = new Set(state.looks.map((l) => l.id));
      const fresh = result.looks.map((l) => (seen.has(l.id) ? { ...l, id: `${l.id}-${uid()}` } : l));
      update({ looks: [...fresh, ...state.looks].slice(0, 30), demo: state.demo || demo });
      setLearned(result.learned_preferences);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  }

  function rate(look: Look, liked: boolean) {
    const without = (arr: Look[]) => arr.filter((l) => l.id !== look.id);
    update({
      liked: liked ? [...without(state.liked), look] : without(state.liked),
      disliked: liked ? without(state.disliked) : [...without(state.disliked), look],
    });
  }

  const key = (look: Look, name: string) => `${look.id}::${name}`;
  function toggleOwned(look: Look, name: string) {
    const k = key(look, name);
    update({ owned: state.owned.includes(k) ? state.owned.filter((x) => x !== k) : [...state.owned, k] });
  }

  function addMissing(look: Look, basicsOnly: boolean) {
    const existing = new Set(state.shopping.map((s) => s.name.toLowerCase()));
    const items: ShoppingItem[] = look.items
      .filter((i) => !state.owned.includes(key(look, i.name)) && (!basicsOnly || i.is_basic) && !existing.has(i.name.toLowerCase()))
      .map((i) => ({ id: uid(), name: i.name, color_hex: i.color_hex, is_basic: i.is_basic, thrift_search_terms: i.thrift_search_terms, from: look.title, bought: false }));
    update({ shopping: [...state.shopping, ...items] });
    setAdded(`${items.length} item${items.length === 1 ? "" : "s"} added to your shopping list`);
    setTimeout(() => setAdded(null), 2500);
  }

  return (
    <div>
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Outfit ideas</div>
        <h1>Looks made for you</h1>
        <p className="lede">Love or pass on each look and I'll learn your taste. Tick off what you already own, and I'll put the missing pieces on your shopping list.</p>
      </div>
      <DemoNote show={state.demo} />
      <div className="card stack">
        <input className="input" placeholder="Optional: what for? e.g. office, wedding guest, beach trip" value={request} onChange={(e) => setRequest(e.target.value)} />
        <button className="btn accent block" onClick={generate} disabled={busy}>{busy ? "Styling…" : state.looks.length ? "Get more looks" : "Style me"}</button>
        <ErrorBox error={error} />
        {learned && <p className="muted small" style={{ margin: 0 }}><strong>What I've learned:</strong> {learned}</p>}
        <p className="muted small" style={{ margin: 0 }}>{state.liked.length} loved · {state.disliked.length} passed</p>
      </div>
      {added && <div className="notice" role="status">{added}</div>}

      {state.looks.map((look) => {
        const liked = state.liked.some((l) => l.id === look.id);
        const disliked = state.disliked.some((l) => l.id === look.id);
        return (
          <article key={look.id} className="card" style={{ opacity: disliked ? 0.55 : 1 }}>
            <div className="row between">
              <div className="kicker">{look.occasion}</div>
              <TrendBadge status={look.trend_status} />
            </div>
            <h2>{look.title}</h2>
            <p className="muted">{look.vibe}</p>
            <div className="row" style={{ gap: 6, margin: "6px 0 12px" }}>
              {look.items.map((i) => <span key={i.name} title={i.color_name} style={{ width: 34, height: 34, borderRadius: 10, background: i.color_hex, border: "1px solid var(--line)" }} />)}
            </div>
            <div>
              {look.items.map((i) => (
                <label key={i.name} className="item" style={{ cursor: "pointer" }}>
                  <span className="chip" style={{ background: i.color_hex }} />
                  <span className="grow">
                    {i.name} {i.is_basic && <span className="badge" style={{ marginLeft: 4 }}>basic</span>}
                    <div className="muted small">{i.color_name}</div>
                  </span>
                  <span className="muted small">I own it</span>
                  <input type="checkbox" className="check" checked={state.owned.includes(key(look, i.name))} onChange={() => toggleOwned(look, i.name)} />
                </label>
              ))}
            </div>
            <details style={{ marginTop: 12 }}>
              <summary>Why this works for you</summary>
              <div className="stack small" style={{ marginTop: 8 }}>
                <div><strong>Color:</strong> {look.why_it_works.color}</div>
                <div><strong>Body lines:</strong> {look.why_it_works.body}</div>
                <div><strong>Essence:</strong> {look.why_it_works.essence}</div>
                <div className="muted"><strong>Trend check:</strong> {look.trend_note}</div>
              </div>
            </details>
            <div className="row" style={{ marginTop: 14 }}>
              <button className={`btn sm ${liked ? "accent" : "ghost"}`} onClick={() => rate(look, true)} aria-pressed={liked}>♥ Love it</button>
              <button className={`btn sm ${disliked ? "" : "ghost"}`} onClick={() => rate(look, false)} aria-pressed={disliked}>✕ Not me</button>
              <button className="btn sm ghost" onClick={() => addMissing(look, true)}>+ Missing basics to list</button>
              <button className="linkish small" onClick={() => addMissing(look, false)}>add everything I don't own</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
