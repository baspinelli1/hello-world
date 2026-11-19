"use client";
import { useState } from "react";
import { filesToDataUrls } from "@/lib/image";
import type { Inspo } from "@/lib/schemas";
import { api, type AppState } from "@/lib/store";
import { getTrends } from "./trends";
import { DemoNote, ErrorBox } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void };

const VERDICT: Record<string, [string, string]> = {
  made_for_you: ["Made for you", "good"],
  adapt_it: ["Adapt it", "accent"],
  admire_from_afar: ["Admire from afar", "warn"],
};

export default function InspoView({ state, update }: Props) {
  const [board, setBoard] = useState(state.inspo?.board ?? "");
  const [images, setImages] = useState<string[]>(state.inspo?.images ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const result = state.inspo?.result ?? null;

  async function loadBoard() {
    setBusy("Reading your board…");
    setError(null);
    try {
      const res = await fetch("/api/pinterest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: board }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setImages(json.images);
      update({ inspo: { board, images: json.images, result: null } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that board.");
    }
    setBusy(null);
  }

  async function addScreenshots(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []).slice(0, 12);
    input.value = "";
    if (!files.length) return;
    setBusy(`Adding 1 of ${files.length}…`);
    setError(null);
    const { urls, failed } = await filesToDataUrls(files, { maxSide: 900, quality: 0.82, onProgress: (d, t) => d < t && setBusy(`Adding ${d + 1} of ${t}…`) });
    setBusy(null);
    if (failed) setError(`${failed} image${failed > 1 ? "s" : ""} couldn't be read.`);
    const next = [...images, ...urls].slice(0, 20);
    setImages(next);
    update({ inspo: { board, images: next, result: null } });
  }

  async function read() {
    setBusy("Finding your patterns…");
    setError(null);
    try {
      const trends = await getTrends(state, update);
      const { result, demo } = await api<Inspo>("/api/inspo", {
        profile: state.profile,
        trends,
        images: images.map((src) => (src.startsWith("data:") ? { dataUrl: src } : { url: src })),
      });
      update({ inspo: { board, images, result }, demo: state.demo || demo });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(null);
  }

  return (
    <div>
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Inspiration</div>
        <h1>What your saves say about you</h1>
        <p className="lede">Paste a public Pinterest board link, or add screenshots of looks you love. I'll find your patterns and show how to make them work for you.</p>
      </div>
      <DemoNote show={state.demo} />
      <div className="card stack">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input className="input" placeholder="pinterest.com/yourname/boardname" value={board} onChange={(e) => setBoard(e.target.value)} />
          <button className="btn" disabled={!board || !!busy} onClick={loadBoard}>Load</button>
        </div>
        <label className="drop" style={{ padding: 14 }}>
          <input type="file" accept="image/*" multiple onChange={(e) => addScreenshots(e.currentTarget)} />
          <strong>Or add screenshots</strong>
        </label>
        <ErrorBox error={error} />
        {images.length > 0 && (
          <button className="btn accent block" disabled={!!busy} onClick={read}>{busy ?? `Read my ${images.length} saves`}</button>
        )}
        {busy && images.length === 0 && <p className="muted small">{busy}</p>}
      </div>

      {result && (
        <section className="card stack">
          <h2>Your patterns</h2>
          <div className="row">{result.patterns.map((p) => <span key={p} className="badge accent">{p}</span>)}</div>
          <p>{result.what_this_says}</p>
          <p><strong>How it fits your profile:</strong> {result.alignment}</p>
          <div className="card flat small" style={{ margin: 0 }}><div className="kicker" style={{ marginBottom: 4 }}>Trend or classic?</div>{result.trend_vs_classic}</div>
        </section>
      )}

      {images.length > 0 && (
        <div className="pins" style={{ marginTop: 16 }}>
          {images.map((src, i) => {
            const pin = result?.pins.find((p) => p.index === i);
            return (
              <figure key={src.slice(-40) + i} title={pin?.note}>
                <img src={src} alt={`Saved look ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" />
                {pin && <span className={`badge ${VERDICT[pin.verdict][1]}`}>{VERDICT[pin.verdict][0]}</span>}
                {pin && <figcaption className="muted small" style={{ marginTop: 4 }}>{pin.note}</figcaption>}
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
