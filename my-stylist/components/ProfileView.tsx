"use client";
import { useState } from "react";
import { DRAPES } from "@/lib/color";
import type { AppState } from "@/lib/store";
import { ANALYSIS_STEPS, runAnalysis } from "./analysis";
import { Confidence, DemoNote, DimensionBar, ErrorBox, Section, Swatches } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void; restart: () => void };

// The Color tile is painted in the user's own best color, with readable text on top.
function tileStyle(hex?: string) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return undefined;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { background: hex, color: lum > 0.5 ? "#1B1712" : "#FFFFFF" };
}

export default function ProfileView({ state, update, restart }: Props) {
  const p = state.profile!;
  const m = state.engine?.measurements;
  const tiles = state.engine?.drapeTiles ?? {};
  const [note, setNote] = useState("");
  const [refining, setRefining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refine() {
    setError(null);
    try {
      const out = await runAnalysis(state, setRefining, { note });
      update({ profile: out.profile, engine: out.engine, demo: out.demo });
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setRefining(null);
  }

  const drape = (id: string) => DRAPES.find((d) => d.id === id);

  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker">Your style</div>
        <h1>{p.summary.headline}</h1>
        <p className="lede">{p.summary.style_formula}</p>
        <div className="tiles">
          <a className="tile c1" href="#color" style={tileStyle(p.color.palette.core[0]?.hex)}>
            <span className="kicker">Your color{p.color.is_olive ? " · olive" : ""}</span>
            <div>
              <strong>{p.color.season}</strong>
              <div className="mini">{p.color.palette.core.slice(0, 6).map((c) => <span key={c.hex} style={{ background: c.hex }} />)}</div>
            </div>
          </a>
          <a className="tile c2" href="#body"><span className="kicker">Body</span><strong>{p.body.kibbe_type}</strong></a>
          <a className="tile c3" href="#essence"><span className="kicker">Essence</span><strong>{p.essence.primary}{p.essence.secondary && p.essence.secondary !== "none" ? ` + ${p.essence.secondary}` : ""}</strong></a>
        </div>
      </div>
      <DemoNote show={state.demo} />
      {p.photo_feedback && <div className="notice" style={{ marginTop: 12 }}>{p.photo_feedback}</div>}

      <div id="color" />
      <Section kicker="Color" title={p.color.season}>
        <Confidence level={p.color.confidence} runnerUp={p.color.runner_up} />
        <div className="dims" style={{ margin: "16px 0" }}>
          <DimensionBar dim="hue" value={p.color.dimensions.hue} />
          <DimensionBar dim="value" value={p.color.dimensions.value} />
          <DimensionBar dim="chroma" value={p.color.dimensions.chroma} />
          <DimensionBar dim="contrast" value={p.color.dimensions.contrast} />
        </div>
        <p>{p.color.undertone_explained}</p>
        <details className="more"><summary>Why other apps may have got this wrong</summary><p className="small" style={{ marginTop: 6 }}>{p.color.why_other_apps_may_differ}</p></details>

        <h3 style={{ marginTop: 20 }}>Your palette</h3>
        <div className="stack">
          <div><div className="kicker" style={{ marginBottom: 8 }}>Neutrals</div><Swatches colors={p.color.palette.neutrals} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Core colors</div><Swatches colors={p.color.palette.core} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Accents</div><Swatches colors={p.color.palette.accents} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Colors that work against you</div><Swatches colors={p.color.palette.avoid} avoid /></div>
        </div>
        <details className="more"><summary>Metals, makeup and tan season</summary>
          <div className="stack small" style={{ marginTop: 8 }}>
            <div><strong>Metals:</strong> {p.color.metals}</div>
            <div><strong>Makeup:</strong> {p.color.makeup_hints}</div>
            <div><strong>Tanned vs paler:</strong> {p.color.tan_mode}</div>
          </div>
        </details>
      </Section>

      {Object.keys(tiles).length > 0 && (
        <Section kicker="Virtual draping" title="Your color test">
          <p>{p.color.drape_results.observations}</p>
          <div className="kicker" style={{ margin: "14px 0 8px" }}>Lit you up</div>
          <div className="drapes">
            {p.color.drape_results.best.slice(0, 4).map((id) => tiles[id] && (
              <figure key={id}><img src={tiles[id]} alt={drape(id)?.name} /><figcaption>{drape(id)?.name}</figcaption></figure>
            ))}
          </div>
          <div className="kicker" style={{ margin: "14px 0 8px" }}>Worked against you</div>
          <div className="drapes">
            {p.color.drape_results.worst.slice(0, 4).map((id) => tiles[id] && (
              <figure key={id}><img src={tiles[id]} alt={drape(id)?.name} /><figcaption>{drape(id)?.name}</figcaption></figure>
            ))}
          </div>
          <details style={{ marginTop: 16 }}>
            <summary>See all 16 drapes</summary>
            <div className="drapes" style={{ marginTop: 10 }}>
              {DRAPES.map((d) => tiles[d.id] && (
                <figure key={d.id}><img src={tiles[d.id]} alt={d.name} /><figcaption>{d.name}</figcaption></figure>
              ))}
            </div>
          </details>
        </Section>
      )}

      {m?.skin && (
        <section className="card">
          <details>
            <summary>The science behind your result</summary>
            <dl className="science">
              <dt>Calibration</dt><dd>{m.calibrationNote}</dd>
              <dt>Skin (calibrated)</dt>
              <dd><span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 4, background: m.skin.averageHex, verticalAlign: "middle", marginRight: 6, border: "1px solid var(--line)" }} />{m.skin.averageHex} · L* {m.skin.lab.L} a* {m.skin.lab.a} b* {m.skin.lab.b}</dd>
              <dt>Monk Skin Tone</dt><dd>{m.skin.monk.index} of 10</dd>
              <dt>ITA°</dt><dd>{m.skin.ita}° ({m.skin.itaCategory})</dd>
              <dt>Hue angle</dt><dd>{m.skin.undertone.hueAngle}° · leans {m.skin.undertone.hueLean}</dd>
              <dt>Olive score</dt><dd>{m.skin.undertone.oliveScore} (0 = none, 1 = strongly olive)</dd>
              <dt>Skin evenness</dt><dd>ΔE {m.skin.evenness} across face regions</dd>
              {m.contrast && <><dt>Contrast</dt><dd>{m.contrast.level}{m.contrast.hairToSkin !== null ? ` · hair vs skin ΔL ${m.contrast.hairToSkin}` : ""}</dd></>}
              {m.sunExposure && <><dt>Wrist baseline</dt><dd>{m.sunExposure.reading}</dd></>}
            </dl>
            <p className="muted small" style={{ marginTop: 10 }}>
              CIELAB is the color space scientists use to measure skin. ITA (Individual Typology Angle) is a dermatology standard, and the Monk scale is a 10-shade scale designed to represent all skin tones fairly.
            </p>
          </details>
        </section>
      )}

      <div id="body" />
      <Section kicker="Body · Kibbe" title={p.body.kibbe_type}>
        <Confidence level={p.body.confidence} runnerUp={p.body.runner_up} />
        <div className="grid2" style={{ marginTop: 12 }}>
          <div><h3>Wear</h3><ul>{p.body.lines_that_work.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Skip</h3><ul>{p.body.lines_to_avoid.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <p className="small"><strong>Fabrics:</strong> {p.body.fabrics.join(", ")}</p>
        <details className="more"><summary>Why this type</summary><p className="small" style={{ marginTop: 6 }}>{p.body.reasoning}</p></details>
      </Section>

      <div id="essence" />
      <Section kicker="Essence · Kitchener" title={`${p.essence.primary}${p.essence.secondary && p.essence.secondary !== "none" ? ` + ${p.essence.secondary}` : ""}`}>
        <Confidence level={p.essence.confidence} />
        <div className="row" style={{ margin: "12px 0" }}>{p.essence.keywords.map((k) => <span key={k} className="badge">{k}</span>)}</div>
        <ul>{p.essence.details_that_express_it.map((x) => <li key={x}>{x}</li>)}</ul>
        <details className="more"><summary>Why this essence</summary><p className="small" style={{ marginTop: 6 }}>{p.essence.reasoning}</p></details>
      </Section>

      <Section kicker="Putting it together" title="Your signature">
        <h3>Signature pieces</h3>
        <ul>{p.summary.signature_pieces.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>Prints & textures</h3>
        <ul>{p.summary.prints_and_textures.map((x) => <li key={x}>{x}</li>)}</ul>
        <details className="more"><summary><strong style={{ color: "var(--ink)", fontSize: 16 }}>Brands to explore ({p.summary.brands.length})</strong></summary>
          {p.summary.brands.map((b) => (
            <div className="item" key={b.name}>
              <div className="grow"><strong>{b.name}</strong> <span className="muted small">{b.price}</span><div className="muted small">{b.why}</div></div>
            </div>
          ))}
        </details>
      </Section>

      <details className="card">
        <summary><strong>Doesn't feel right?</strong></summary>
        <p className="muted small" style={{ marginTop: 10 }}>Tell me what feels off and I'll look at the evidence again. I'll only change the answer if the evidence supports it.</p>
        <textarea className="input" rows={3} placeholder="e.g. I've been draped as a Winter in person, and warm colors make me look tired" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" disabled={!note.trim() || refining !== null} onClick={refine}>
            {refining !== null ? ANALYSIS_STEPS[refining] + "…" : "Re-check my analysis"}
          </button>
          <button className="btn ghost" onClick={restart}>Start over with new photos</button>
        </div>
        <div style={{ marginTop: 10 }}><ErrorBox error={error} /></div>
      </details>
    </div>
  );
}
