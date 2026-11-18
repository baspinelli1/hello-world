"use client";
import { useState } from "react";
import { DRAPES } from "@/lib/color";
import type { AppState } from "@/lib/store";
import { ANALYSIS_STEPS, runAnalysis } from "./analysis";
import { Confidence, DemoNote, DimensionBar, ErrorBox, Section, Swatches } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void; restart: () => void };

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
      <div style={{ padding: "28px 0 6px" }}>
        <div className="kicker">Your style profile</div>
        <h1>{p.summary.headline}</h1>
        <p className="lede">{p.summary.style_formula}</p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="badge accent">{p.color.season}</span>
          <span className="badge accent">{p.body.kibbe_type}</span>
          <span className="badge accent">{p.essence.primary}{p.essence.secondary && p.essence.secondary !== "none" ? ` + ${p.essence.secondary}` : ""}</span>
          {p.color.is_olive && <span className="badge good">Olive complexion</span>}
        </div>
      </div>
      <DemoNote show={state.demo} />
      {p.photo_feedback && <div className="notice" style={{ marginTop: 12 }}>{p.photo_feedback}</div>}

      <Section kicker="Color analysis" title={p.color.season}>
        <Confidence level={p.color.confidence} runnerUp={p.color.runner_up} />
        <div className="dims" style={{ margin: "16px 0" }}>
          <DimensionBar dim="hue" value={p.color.dimensions.hue} />
          <DimensionBar dim="value" value={p.color.dimensions.value} />
          <DimensionBar dim="chroma" value={p.color.dimensions.chroma} />
          <DimensionBar dim="contrast" value={p.color.dimensions.contrast} />
        </div>
        <p>{p.color.undertone_explained}</p>
        <p className="muted small"><strong>Why other apps may have got this wrong:</strong> {p.color.why_other_apps_may_differ}</p>

        <h3 style={{ marginTop: 20 }}>Your palette</h3>
        <div className="stack">
          <div><div className="kicker" style={{ marginBottom: 8 }}>Neutrals</div><Swatches colors={p.color.palette.neutrals} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Core colors</div><Swatches colors={p.color.palette.core} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Accents</div><Swatches colors={p.color.palette.accents} /></div>
          <div><div className="kicker" style={{ marginBottom: 8 }}>Colors that work against you</div><Swatches colors={p.color.palette.avoid} avoid /></div>
        </div>
        <div className="grid2" style={{ marginTop: 16 }}>
          <div className="card flat small" style={{ margin: 0 }}><strong>Metals</strong><br />{p.color.metals}</div>
          <div className="card flat small" style={{ margin: 0 }}><strong>Makeup</strong><br />{p.color.makeup_hints}</div>
        </div>
        <div className="card flat small"><strong>☀️ Tan season vs paler months</strong><br />{p.color.tan_mode}</div>
      </Section>

      {Object.keys(tiles).length > 0 && (
        <Section kicker="Virtual draping" title="What the drapes showed">
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

      <Section kicker="Body lines · Kibbe" title={p.body.kibbe_type}>
        <Confidence level={p.body.confidence} runnerUp={p.body.runner_up} />
        <p style={{ marginTop: 10 }}>{p.body.reasoning}</p>
        <div className="grid2">
          <div><h3>Lines that work</h3><ul>{p.body.lines_that_work.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Lines that fight you</h3><ul>{p.body.lines_to_avoid.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <p className="small"><strong>Fabrics:</strong> {p.body.fabrics.join(", ")}</p>
      </Section>

      <Section kicker="Style essence · Kitchener" title={`${p.essence.primary}${p.essence.secondary && p.essence.secondary !== "none" ? ` + ${p.essence.secondary}` : ""}`}>
        <Confidence level={p.essence.confidence} />
        <p style={{ marginTop: 10 }}>{p.essence.reasoning}</p>
        <div className="row">{p.essence.keywords.map((k) => <span key={k} className="badge">{k}</span>)}</div>
        <ul>{p.essence.details_that_express_it.map((x) => <li key={x}>{x}</li>)}</ul>
      </Section>

      <Section kicker="Putting it together" title="Your signature">
        <h3>Signature pieces</h3>
        <ul>{p.summary.signature_pieces.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>Prints & textures</h3>
        <ul>{p.summary.prints_and_textures.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>Brands to explore</h3>
        {p.summary.brands.map((b) => (
          <div className="item" key={b.name}>
            <div className="grow"><strong>{b.name}</strong> <span className="muted small">{b.price}</span><div className="muted small">{b.why}</div></div>
          </div>
        ))}
      </Section>

      <section className="card">
        <h3>Doesn't feel right?</h3>
        <p className="muted small">Tell me what feels off and I'll look at the evidence again. I'll only change the answer if the evidence supports it.</p>
        <textarea className="input" rows={3} placeholder="e.g. I've been draped as a Winter in person, and warm colors make me look tired" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" disabled={!note.trim() || refining !== null} onClick={refine}>
            {refining !== null ? ANALYSIS_STEPS[refining] + "…" : "Re-check my analysis"}
          </button>
          <button className="btn ghost" onClick={restart}>Start over with new photos</button>
        </div>
        <div style={{ marginTop: 10 }}><ErrorBox error={error} /></div>
      </section>
    </div>
  );
}
