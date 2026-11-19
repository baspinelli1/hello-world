"use client";
// Free color analysis: guided selfie -> on-device measurement -> hair/eyes ->
// side-by-side draping -> reveal. No AI, no network.
import { useCallback, useEffect, useRef, useState } from "react";
import { rgbToLab, hexToRgb, type Calibration, type ColorMeasurements } from "@/lib/color";
import { GUIDE, guideFromTaps, liveCheck, readFace, ROUNDS, scoreMeasured, type Box, type Vote } from "@/lib/freeColor";
import { filesToDataUrls, loadImage, renderDrapes } from "@/lib/image";
import { SEASONS } from "@/lib/learn";
import { QUESTIONS, rankSeasons, type MeasuredColor } from "@/lib/quiz";
import { ErrorBox } from "./ui";

export type GuidedResult = {
  measured: MeasuredColor;
  measurements: ColorMeasurements;
  calibration: Calibration | null;
  tiles: Record<string, string>;
  photo: string;
};

type Guide = { face: Box; paper: Box; regions: Record<string, Box> };
/** A color photo kept on the phone so the analysis can be finished later. */
export type SavedColorPhoto = { photo: string; guide: Guide; date: string };

type Props = {
  onDone: (r: GuidedResult) => void;
  onExit: () => void;
  saved?: SavedColorPhoto | null;
  onSave?: (s: SavedColorPhoto) => void;
};
type Step = "intro" | "camera" | "fallback" | "hair" | "eyes" | "drape" | "reveal";

const HAIR = QUESTIONS.find((q) => q.id === "hair")!;
const EYES = QUESTIONS.find((q) => q.id === "eyes")!;

function pixelsOf(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  c.width = c.height = 0;
  return d;
}

export default function GuidedColor({ onDone, onExit, saved, onSave }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [reading, setReading] = useState<{ m: ColorMeasurements; cal: Calibration | null; face: Box } | null>(null);
  const [hair, setHair] = useState<number | null>(null);
  const [eyes, setEyes] = useState<number | null>(null);
  const [tiles, setTiles] = useState<Record<string, string>>({});
  const [round, setRound] = useState(0);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [flip] = useState(() => ROUNDS.map(() => Math.random() < 0.5));
  const [result, setResult] = useState<GuidedResult | null>(null);

  // ----- analysis of a captured photo -----
  const analyze = useCallback(async (dataUrl: string, guide: Guide) => {
    setError(null);
    const img = await loadImage(dataUrl);
    const r = readFace(pixelsOf(img), guide);
    if (r.problem || !r.measurements.skin) {
      setError(r.problem ?? "Something went wrong reading the photo. Please try again.");
      return false;
    }
    const drapeList = ROUNDS.flatMap((x) => [x.a, x.b]);
    const t = renderDrapes(img, guide.face, r.calibration, drapeList, 360).tiles;
    setTiles(t);
    setPhoto(dataUrl);
    setReading({ m: r.measurements, cal: r.calibration, face: guide.face });
    onSave?.({ photo: dataUrl, guide, date: new Date().toISOString() });
    setStep("hair");
    return true;
  }, [onSave]);

  async function finishDraping(finalVotes: Record<string, Vote>, eyeIdx: number) {
    if (!reading || hair === null || !photo) return;
    const hOpt = HAIR.options[hair], eOpt = EYES.options[eyeIdx];
    const measured = scoreMeasured(reading.m, {
      hairValue: Math.max(-1, Math.min(1, (hOpt.color?.value ?? 0) / 2)),
      hairHue: Math.max(-1, Math.min(1, (hOpt.color?.hue ?? 0) / 2)),
      eyeChroma: Math.max(-1, Math.min(1, (eOpt.color?.chroma ?? 0) / 2)),
      hairL: rgbToLab(hexToRgb(hOpt.swatch ?? "#555555")).L,
    }, finalVotes);
    const season = SEASONS.find((s) => s.slug === rankSeasons(measured.h, measured.v, measured.c)[0].slug)!;
    const img = await loadImage(photo);
    const reveal = renderDrapes(img, reading.face, reading.cal, [
      { id: "best", hex: season.palette[0].hex },
      { id: "worst", hex: season.avoid[0].hex },
    ], 360).tiles;
    setResult({ measured, measurements: reading.m, calibration: reading.cal, tiles: { ...tiles, ...reveal }, photo });
    setStep("reveal");
  }

  // ----- screens -----
  if (step === "intro") {
    return (
      <div className="stack" style={{ paddingTop: 20 }}>
        <span className="badge part c1">Color</span>
        <h2 style={{ fontSize: 32 }}>Let's find your colors</h2>
        <p className="muted">One selfie with white paper, then a quick draping session where you compare colors on your own face.</p>
        {saved && (
          <button className="choice primary" style={{ flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 14 }} onClick={() => analyze(saved.photo, saved.guide)}>
            <img src={saved.photo} alt="" style={{ width: 64, height: 84, objectFit: "cover", borderRadius: 12, border: "2px solid var(--ink)", flex: "none" }} />
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <strong>Use my photo from earlier</strong>
              <span className="small">Taken {when(saved.date)}. Pick up where you left off.</span>
            </span>
          </button>
        )}
        <button className={`choice${saved ? "" : " primary"}`} onClick={() => setStep("camera")}>
          <strong>Take the photo now</strong>
          <span className={`small${saved ? " muted" : ""}`}>Guided selfie facing a window in daylight, with white paper in the box.</span>
        </button>
        <button className="choice" onClick={() => setStep("fallback")}>
          <strong>Upload a photo I took earlier</strong>
          <span className="small muted">A daylight selfie with white paper beside your face. You'll tap 3 spots on it.</span>
        </button>
        <ErrorBox error={error} />
        <div className="notice small">
          🌙 <strong>No daylight right now?</strong> Take the photo during the day and come back any time. This phone keeps it, so you can finish the draping at night.
        </div>
        <details className="small">
          <summary className="muted">Tips for the photo</summary>
          <div className="stack" style={{ marginTop: 8 }}>
            <div>☀️ Face a window in daylight (no direct sun)</div>
            <div>📄 Plain white printer paper, flat, next to your cheek</div>
            <div>✨ Bare face if you can, hair off your face</div>
          </div>
        </details>
        <button className="linkish small" style={{ alignSelf: "center" }} onClick={onExit}>← Back</button>
      </div>
    );
  }

  if (step === "camera") {
    return <Camera onCapture={(url) => analyze(url, GUIDE)} onFallback={() => setStep("fallback")} error={error} onBack={() => setStep("intro")} />;
  }

  if (step === "fallback") {
    return <TapToMark onReady={analyze} error={error} onBack={() => { setError(null); setStep("intro"); }} />;
  }

  if (step === "hair" || step === "eyes") {
    const q = step === "hair" ? HAIR : EYES;
    return (
      <div style={{ paddingTop: 14 }}>
        <span className="badge part c1">Color</span>
        <h2 style={{ fontSize: 30, marginTop: 12 }}>{q.text}</h2>
        {q.help && <p className="muted">{q.help}</p>}
        <div className="answers">
          {q.options.map((o, i) => (
            <button key={o.label} className="answer" onClick={() => {
              if (step === "hair") { setHair(i); setStep("eyes"); }
              else { setEyes(i); setStep("drape"); }
            }}>
              {o.swatch && <span className="sw" style={{ background: o.swatch }} />}<span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "drape") {
    const r = ROUNDS[round];
    const sides = flip[round] ? [r.b, r.a] : [r.a, r.b];
    const choose = (v: Vote) => {
      const next = { ...votes, [r.id]: v };
      setVotes(next);
      if (round + 1 < ROUNDS.length) setRound(round + 1);
      else finishDraping(next, eyes ?? 0);
    };
    return (
      <div style={{ paddingTop: 14 }}>
        <div className="row between">
          <button className="linkish small" onClick={() => (round === 0 ? setStep("eyes") : setRound(round - 1))}>← Back</button>
          <span className="muted small">Round {round + 1} of {ROUNDS.length}</span>
        </div>
        <div className="progress"><span style={{ width: `${(round / ROUNDS.length) * 100}%` }} /></div>
        <h2 style={{ fontSize: 28 }}>Which looks better on you?</h2>
        <p className="muted small">Look at your <strong>face, not the color</strong>: smoother skin, brighter eyes, softer shadows under the eyes and around the mouth.</p>
        <div className="pair">
          {sides.map((d) => (
            <button key={d.id} className="drapebtn" onClick={() => choose(d === r.a ? "a" : "b")}>
              <img src={tiles[d.id]} alt={d.name} />
              <span>{d.name}</span>
            </button>
          ))}
        </div>
        <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => choose("same")}>Can't tell</button>
      </div>
    );
  }

  // reveal
  const s = result ? SEASONS.find((x) => x.slug === rankSeasons(result.measured.h, result.measured.v, result.measured.c)[0].slug)! : null;
  return (
    <div className="stack" style={{ paddingTop: 20 }}>
      <span className="badge part c1">Your colors</span>
      <h2 style={{ fontSize: 34 }}>{s?.name}</h2>
      <p className="muted">{s?.tagline}. Here's the difference on your own face:</p>
      {result && s && (
        <div className="pair">
          <figure className="drapebtn static"><img src={result.tiles.best} alt="" /><span>✓ {s.palette[0].name}</span></figure>
          <figure className="drapebtn static"><img src={result.tiles.worst} alt="" /><span>✕ {s.avoid[0].name}</span></figure>
        </div>
      )}
      <p className="small muted">Next: a few quick questions about your body lines and style essence.</p>
      <button className="btn accent block" onClick={() => result && onDone(result)}>Continue</button>
    </div>
  );

}

function when(iso: string) {
  const d = new Date(iso), now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toDateString() === now.toDateString() ? `today at ${time}` : `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`;
}

// ---------- Camera with live guide ----------
function Camera({ onCapture, onFallback, onBack, error }: { onCapture: (url: string) => Promise<boolean>; onFallback: () => void; onBack: () => void; error: string | null }) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; message: string; paperOk: boolean }>({ ok: false, message: "Starting camera…", paperOk: false });
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1440 }, height: { ideal: 1920 } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (video.current) { video.current.srcObject = stream; await video.current.play().catch(() => {}); }
      } catch {
        setFailed("The camera isn't available. You can use a photo you already have instead.");
      }
    })();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // Draw the current frame, cropped to 3:4 and mirrored to match what you see.
  const frame = useCallback((W: number, H: number) => {
    const v = video.current;
    if (!v || !v.videoWidth) return null;
    const vw = v.videoWidth, vh = v.videoHeight;
    let sx = 0, sy = 0, cw = vw, ch = vh;
    if (vw / vh > 3 / 4) { cw = vh * 0.75; sx = (vw - cw) / 2; } else { ch = vw / 0.75; sy = (vh - ch) / 2; }
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.translate(W, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, cw, ch, 0, 0, W, H);
    return c;
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const c = frame(90, 120);
      if (!c) return;
      const d = c.getContext("2d")!.getImageData(0, 0, 90, 120);
      setStatus(liveCheck(d));
      c.width = c.height = 0;
    }, 450);
    return () => clearInterval(t);
  }, [frame]);

  async function capture() {
    const c = frame(960, 1280);
    if (!c) return;
    setBusy(true);
    const url = c.toDataURL("image/jpeg", 0.92);
    c.width = c.height = 0;
    const ok = await onCapture(url);
    if (ok) streamRef.current?.getTracks().forEach((t) => t.stop());
    setBusy(false);
  }

  if (failed) {
    return (
      <div className="stack" style={{ paddingTop: 20 }}>
        <ErrorBox error={failed} />
        <button className="btn accent block" onClick={onFallback}>Use a photo instead</button>
        <button className="linkish small" style={{ alignSelf: "center" }} onClick={onBack}>← Back</button>
      </div>
    );
  }

  const o = GUIDE.oval, p = GUIDE.paper;
  return (
    <div style={{ paddingTop: 10 }}>
      <div className="row between"><button className="linkish small" onClick={onBack}>← Back</button><span className="muted small">Face in the oval · paper in the box</span></div>
      <div className="viewfinder">
        <video ref={video} playsInline muted autoPlay />
        <svg viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden>
          <defs><mask id="m"><rect width="300" height="400" fill="white" /><ellipse cx={o.cx * 300} cy={o.cy * 400} rx={o.rx * 300} ry={o.ry * 400} fill="black" /><rect x={p.x * 300} y={p.y * 400} width={p.w * 300} height={p.h * 400} rx="6" fill="black" /></mask></defs>
          <rect width="300" height="400" fill="rgba(0,0,0,0.35)" mask="url(#m)" />
          <ellipse cx={o.cx * 300} cy={o.cy * 400} rx={o.rx * 300} ry={o.ry * 400} fill="none" stroke="#fff" strokeWidth="2.5" />
          <rect x={p.x * 300} y={p.y * 400} width={p.w * 300} height={p.h * 400} rx="6" fill="none" stroke={status.paperOk ? "#6FCB9F" : "#fff"} strokeWidth="2.5" strokeDasharray={status.paperOk ? "0" : "6 5"} />
          <text x={(p.x + p.w / 2) * 300} y={(p.y + p.h) * 400 + 16} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle">PAPER</text>
        </svg>
        <div className={`vf-status${status.ok ? " ok" : ""}`}>{status.ok ? "✓ " : ""}{status.message}</div>
      </div>
      <ErrorBox error={error} />
      <button className="btn accent block" style={{ marginTop: 12 }} disabled={busy} onClick={capture}>{busy ? "Measuring…" : status.ok ? "Take photo" : "Take photo anyway"}</button>
      <button className="linkish small" style={{ display: "block", margin: "12px auto 0" }} onClick={onFallback}>Use a photo I already have</button>
    </div>
  );
}

// ---------- Fallback: existing photo + three taps ----------
const TAPS = ["Tap the middle of your forehead", "Tap the bottom of your chin", "Tap the white paper"];

function TapToMark({ onReady, onBack, error }: { onReady: (url: string, guide: { face: Box; paper: Box; regions: Record<string, Box> }) => Promise<boolean>; onBack: () => void; error: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState(0.75);
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);
  const [note, setNote] = useState<string | null>(null);

  async function pick(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []).slice(0, 1);
    input.value = "";
    if (!files.length) return;
    setNote("Adding photo…");
    const { urls } = await filesToDataUrls(files, { maxSide: 1280, quality: 0.92 });
    if (!urls[0]) { setNote("That photo couldn't be read. Try another."); return; }
    const img = await loadImage(urls[0]);
    setAspect(img.naturalWidth / img.naturalHeight);
    setUrl(urls[0]); setTaps([]); setNote(null);
  }

  async function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (!url || taps.length >= 3) return;
    const r = e.currentTarget.getBoundingClientRect();
    const next = [...taps, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }];
    setTaps(next);
    if (next.length === 3) {
      const ok = await onReady(url, guideFromTaps(next[0], next[1], next[2], aspect));
      if (!ok) setTaps([]);
    }
  }

  return (
    <div className="stack" style={{ paddingTop: 14 }}>
      <button className="linkish small" style={{ alignSelf: "flex-start" }} onClick={onBack}>← Back</button>
      <h2>Use a photo</h2>
      <p className="muted small">A daylight selfie with plain white paper next to your face works best.</p>
      <label className="drop">
        <input type="file" accept="image/*" onChange={(e) => pick(e.currentTarget)} />
        <strong>{note ?? (url ? "Choose a different photo" : "Choose photo")}</strong>
      </label>
      {url && (
        <>
          <div className="notice"><strong>{taps.length < 3 ? `${taps.length + 1}/3 · ${TAPS[taps.length]}` : "Measuring…"}</strong></div>
          <div className="tapper" onClick={tap}>
            <img src={url} alt="Your photo" />
            {taps.map((t, i) => <span key={i} className="tapdot" style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}>{i + 1}</span>)}
          </div>
          {taps.length > 0 && <button className="linkish small" onClick={() => setTaps([])}>Start taps over</button>}
        </>
      )}
      <ErrorBox error={error} />
    </div>
  );
}
