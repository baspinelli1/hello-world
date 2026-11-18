"use client";
import { useState } from "react";
import { fileToDataUrl } from "@/lib/image";
import type { AppState } from "@/lib/store";
import { ANALYSIS_STEPS, runAnalysis } from "./analysis";
import { ErrorBox } from "./ui";

type Props = { state: AppState; update: (patch: Partial<AppState>) => void };

export default function Onboarding({ state, update }: Props) {
  const [step, setStep] = useState<"welcome" | "height" | "photos" | "calibrate" | "analyzing">("welcome");
  const [unit, setUnit] = useState<"ftin" | "cm">("ftin");
  const [ft, setFt] = useState(""), [inch, setInch] = useState(""), [cm, setCm] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [wrist, setWrist] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);

  const height = unit === "cm" ? (cm ? `${cm} cm` : "") : ft ? `${ft}'${inch || 0}"` : "";

  async function addGallery(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const urls = await Promise.all(Array.from(files).slice(0, 12).map((f) => fileToDataUrl(f)));
    setGallery((g) => [...g, ...urls].slice(0, 10));
    setBusy(false);
  }

  async function single(files: FileList | null, set: (v: string) => void) {
    if (files?.[0]) set(await fileToDataUrl(files[0], 1600, 0.92));
  }

  async function analyze() {
    setStep("analyzing");
    setError(null);
    // Calibration photos go first so the engine prefers them.
    const photos = [selfie, wrist, ...gallery].filter((p): p is string => !!p);
    const next = { ...state, height, photos };
    try {
      const out = await runAnalysis(next, setProgress);
      setMissing(out.missing);
      update({ height, photos, profile: out.profile, engine: out.engine, demo: out.demo });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (step === "welcome") {
    return (
      <div className="stack" style={{ paddingTop: 36 }}>
        <div className="hero-dots" aria-hidden><span /><span /><span /></div>
        <h1>Find the style made for you.</h1>
        <p className="lede">Your colors, your body lines and your style essence, from a few photos. About two minutes.</p>
        <div className="card flat stack small">
          <div><strong>1.</strong> Your height</div>
          <div><strong>2.</strong> 6–10 photos from your camera roll</div>
          <div><strong>3.</strong> One selfie holding white paper, for true-to-life color</div>
        </div>
        <button className="btn accent block" onClick={() => setStep("height")}>Start</button>
      </div>
    );
  }

  if (step === "height") {
    return (
      <div className="stack" style={{ paddingTop: 28 }}>
        <div className="kicker">Step 1 of 3</div>
        <h2>How tall are you?</h2>
        <p className="muted">Height shapes your vertical line, one of the biggest clues to your body type.</p>
        <div className="row">
          <button className={`btn sm ${unit === "ftin" ? "" : "ghost"}`} onClick={() => setUnit("ftin")}>ft / in</button>
          <button className={`btn sm ${unit === "cm" ? "" : "ghost"}`} onClick={() => setUnit("cm")}>cm</button>
        </div>
        {unit === "ftin" ? (
          <div className="grid2">
            <input className="input" inputMode="numeric" placeholder="Feet" value={ft} onChange={(e) => setFt(e.target.value.replace(/\D/g, ""))} aria-label="Feet" />
            <input className="input" inputMode="numeric" placeholder="Inches" value={inch} onChange={(e) => setInch(e.target.value.replace(/\D/g, ""))} aria-label="Inches" />
          </div>
        ) : (
          <input className="input" inputMode="numeric" placeholder="Centimetres" value={cm} onChange={(e) => setCm(e.target.value.replace(/\D/g, ""))} aria-label="Centimetres" />
        )}
        <button className="btn accent block" disabled={!height} onClick={() => setStep("photos")}>Continue</button>
      </div>
    );
  }

  if (step === "photos") {
    return (
      <div className="stack" style={{ paddingTop: 28 }}>
        <div className="kicker">Step 2 of 3</div>
        <h2>Add photos of yourself</h2>
        <p className="muted">
          Any mix of selfies and full-length shots. Include at least one full-length photo. I'll sort out which are useful and skip filtered or dim ones.
        </p>
        <label className="drop">
          <input type="file" accept="image/*" multiple onChange={(e) => addGallery(e.target.files)} />
          <strong>{busy ? "Adding…" : "Choose from camera roll"}</strong>
          <div className="muted small">{gallery.length}/10 added</div>
        </label>
        {gallery.length > 0 && (
          <div className="thumbs">
            {gallery.map((src, i) => (
              <button key={i} onClick={() => setGallery((g) => g.filter((_, j) => j !== i))} style={{ border: 0, padding: 0, background: "none", cursor: "pointer" }} aria-label="Remove photo">
                <img src={src} alt="" className="thumb" />
              </button>
            ))}
          </div>
        )}
        {gallery.length > 0 && <p className="muted small">Tap a photo to remove it.</p>}
        <button className="btn accent block" disabled={gallery.length < 2} onClick={() => setStep("calibrate")}>Continue</button>
      </div>
    );
  }

  if (step === "calibrate") {
    return (
      <div className="stack" style={{ paddingTop: 28 }}>
        <div className="kicker">Step 3 of 3 · the accuracy step</div>
        <h2>One selfie with white paper</h2>
        <p className="muted">
          Phone cameras shift skin color. A plain white sheet of paper next to your face lets me correct that, the way professional analysts calibrate.
        </p>
        <div className="card flat small stack">
          <div>☀️ Face a window in daylight, no direct sun</div>
          <div>📄 Hold plain white paper beside your cheek</div>
          <div>✨ Bare face if you can, hair pulled back</div>
        </div>
        <label className="drop">
          <input type="file" accept="image/*" capture="user" onChange={(e) => single(e.target.files, setSelfie)} />
          {selfie ? <img src={selfie} alt="Calibration selfie" style={{ maxHeight: 220, margin: "0 auto", borderRadius: 12 }} /> : <strong>Take calibration selfie</strong>}
        </label>
        <details>
          <summary>Optional: inner-wrist photo (separates tan from undertone)</summary>
          <p className="muted small" style={{ marginTop: 8 }}>
            Your inner wrist rarely sees sun, so it shows your baseline color. Photograph it with the same white paper beside it, in the same light.
          </p>
          <label className="drop">
            <input type="file" accept="image/*" capture="environment" onChange={(e) => single(e.target.files, setWrist)} />
            {wrist ? <img src={wrist} alt="Wrist" style={{ maxHeight: 160, margin: "0 auto", borderRadius: 12 }} /> : <strong>Add wrist photo</strong>}
          </label>
        </details>
        <button className="btn accent block" onClick={analyze}>{selfie ? "Analyze me" : "Skip and analyze (less accurate color)"}</button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ paddingTop: 36 }}>
      <div className="kicker">Working</div>
      <h2>Building your style profile</h2>
      <p className="muted">This takes a minute or two. It's doing what a stylist would do over a long appointment.</p>
      <ul className="steps">
        {ANALYSIS_STEPS.map((s, i) => (
          <li key={s} className={i < progress ? "done" : i === progress && !error ? "now" : ""}>
            <span className="dot" /> {s}
          </li>
        ))}
      </ul>
      {missing.length > 0 && <div className="notice">For better accuracy, add: {missing.join(", ")}.</div>}
      <ErrorBox error={error} />
      {error && (
        <div className="row">
          <button className="btn" onClick={analyze}>Try again</button>
          <button className="btn ghost" onClick={() => setStep("photos")}>Change photos</button>
        </div>
      )}
    </div>
  );
}
