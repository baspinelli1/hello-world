// Free, on-device color analysis: a guided selfie (face in an oval, white
// paper in a box) is measured with fixed sampling spots, then combined with
// the user's own side-by-side drape choices. No AI and no network needed.
import {
  applyCalibration, buildMeasurements, calibrationFromPaper, labToLch, rgbToLab, robustMedian,
  type Calibration, type ColorMeasurements, type RGB,
} from "./color";
import type { MeasuredColor } from "./quiz";

export type Box = { x: number; y: number; w: number; h: number };
export type Pixels = { data: Uint8ClampedArray; width: number; height: number };

/** Guide geometry, as fractions of a 3:4 portrait frame. */
export const GUIDE = {
  oval: { cx: 0.5, cy: 0.42, rx: 0.23, ry: 0.3 },
  paper: { x: 0.77, y: 0.3, w: 0.2, h: 0.32 } as Box,
  face: { x: 0.27, y: 0.12, w: 0.46, h: 0.6 } as Box,
  regions: {
    forehead: { x: 0.44, y: 0.19, w: 0.12, h: 0.05 },
    left_cheek: { x: 0.33, y: 0.43, w: 0.08, h: 0.07 },
    right_cheek: { x: 0.59, y: 0.43, w: 0.08, h: 0.07 },
    chin: { x: 0.46, y: 0.64, w: 0.08, h: 0.04 },
  } as Record<string, Box>,
};

/** Regions derived from three taps (forehead, chin, paper) for photos taken without the guide. */
export function guideFromTaps(forehead: { x: number; y: number }, chin: { x: number; y: number }, paper: { x: number; y: number }, aspect: number) {
  // aspect = image width / height. Face height is forehead-to-chin plus some margin.
  const fh = Math.max(0.1, (chin.y - forehead.y) * 1.25);
  const fw = (fh * 0.78) / aspect;
  const cx = (forehead.x + chin.x) / 2;
  const top = forehead.y - fh * 0.12;
  const at = (fx: number, fy: number, w: number, h: number): Box => ({ x: cx + fx * fw - (w * fw) / 2, y: top + fy * fh - (h * fh) / 2, w: w * fw, h: h * fh });
  return {
    face: { x: cx - fw / 2, y: top, w: fw, h: fh } as Box,
    paper: { x: paper.x - 0.04 / aspect, y: paper.y - 0.04, w: 0.08 / aspect, h: 0.08 } as Box,
    regions: {
      forehead: at(0, 0.14, 0.26, 0.08),
      left_cheek: at(-0.25, 0.52, 0.17, 0.11),
      right_cheek: at(0.25, 0.52, 0.17, 0.11),
      chin: at(0, 0.86, 0.17, 0.06),
    } as Record<string, Box>,
  };
}

export function sampleBox(px: Pixels, box: Box, shrink = 0.15): RGB | null {
  const x0 = Math.max(0, Math.floor((box.x + box.w * shrink) * px.width));
  const x1 = Math.min(px.width, Math.ceil((box.x + box.w * (1 - shrink)) * px.width));
  const y0 = Math.max(0, Math.floor((box.y + box.h * shrink) * px.height));
  const y1 = Math.min(px.height, Math.ceil((box.y + box.h * (1 - shrink)) * px.height));
  const out: RGB[] = [];
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 3000)));
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const i = (y * px.width + x) * 4;
    out.push([px.data[i], px.data[i + 1], px.data[i + 2]]);
  }
  return robustMedian(out);
}

/**
 * Paper is bright by nature, so unlike skin we keep near-white pixels and only
 * drop fully blown-out ones (all channels at the ceiling).
 */
export function samplePaper(px: Pixels, box: Box): RGB | null {
  const s = 0.2;
  const x0 = Math.max(0, Math.floor((box.x + box.w * s) * px.width)), x1 = Math.min(px.width, Math.ceil((box.x + box.w * (1 - s)) * px.width));
  const y0 = Math.max(0, Math.floor((box.y + box.h * s) * px.height)), y1 = Math.min(px.height, Math.ceil((box.y + box.h * (1 - s)) * px.height));
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 3000)));
  const ch: [number[], number[], number[]] = [[], [], []];
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const i = (y * px.width + x) * 4;
    const r = px.data[i], g = px.data[i + 1], b = px.data[i + 2];
    if (r >= 253 && g >= 253 && b >= 253) continue;
    ch[0].push(r); ch[1].push(g); ch[2].push(b);
  }
  if (ch[0].length < 8) return null;
  const med = (a: number[]) => a.sort((p, q) => p - q)[Math.floor(a.length / 2)];
  return [med(ch[0]), med(ch[1]), med(ch[2])];
}

/** Live check used while the camera is open. */
export function liveCheck(px: Pixels): { ok: boolean; message: string; paperOk: boolean; lightOk: boolean } {
  const face = sampleBox(px, { x: 0.35, y: 0.3, w: 0.3, h: 0.3 }, 0);
  const paper = samplePaper(px, GUIDE.paper);
  const faceL = face ? rgbToLab(face).L : 0;
  const lightOk = faceL > 28;
  let paperOk = false;
  if (paper) {
    const lab = rgbToLab(paper);
    const spread = Math.max(...paper) - Math.min(...paper);
    paperOk = lab.L > faceL + 8 && lab.L > 55 && spread < 70;
  }
  if (!lightOk) return { ok: false, message: "Too dark. Face a window.", paperOk, lightOk };
  if (!paperOk) return { ok: false, message: "Hold white paper inside the box.", paperOk, lightOk };
  return { ok: true, message: "Looks good. Hold still and tap the button.", paperOk, lightOk };
}

export type FaceReading = {
  calibration: Calibration | null;
  measurements: ColorMeasurements;
  problem: string | null; // set when the skin samples don't look like skin
};

/** Measure skin from the guide regions, after correcting with the paper. */
export function readFace(px: Pixels, guide: { paper: Box; regions: Record<string, Box> }): FaceReading {
  const paper = samplePaper(px, guide.paper);
  let calibration: Calibration | null = null;
  if (paper) {
    const lab = rgbToLab(paper);
    if (lab.L > 50 && Math.max(...paper) - Math.min(...paper) < 80) calibration = calibrationFromPaper(paper);
  }
  const raw = Object.entries(guide.regions)
    .map(([region, box]) => ({ region, rgb: sampleBox(px, box) }))
    .filter((r): r is { region: string; rgb: RGB } => !!r.rgb)
    .map((r) => ({ region: r.region, rgb: applyCalibration(r.rgb, calibration) }));

  // Keep only samples that look like skin, then drop one outlier (stray hair, shadow).
  let skin = raw.filter(({ rgb }) => {
    const lch = labToLch(rgbToLab(rgb));
    return lch.h > 15 && lch.h < 100 && lch.C > 3 && lch.C < 55 && lch.L > 10 && lch.L < 95;
  });
  if (skin.length >= 3) {
    const labs = skin.map((r) => rgbToLab(r.rgb));
    const mean = { L: avg(labs.map((l) => l.L)), a: avg(labs.map((l) => l.a)), b: avg(labs.map((l) => l.b)) };
    const dist = labs.map((l) => Math.hypot(l.L - mean.L, l.a - mean.a, l.b - mean.b));
    const worst = dist.indexOf(Math.max(...dist));
    if (dist[worst] > 12) skin = skin.filter((_, i) => i !== worst);
  }
  const measurements = buildMeasurements({ calibration, skinRegions: skin });
  let problem: string | null = null;
  if (skin.length < 2) problem = "I couldn't find your skin in the outline. Line your face up with the oval and try again.";
  else if (!calibration) problem = "I couldn't find the white paper. Hold it flat inside the box, out of shadow.";
  else if (measurements.skin && measurements.skin.evenness > 22) problem = "The light on your face is uneven. Face a window straight on and try again.";
  return { calibration, measurements, problem };
}

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const clamp = (x: number) => Math.max(-1, Math.min(1, x));

// ---------- Side-by-side draping ----------
// Each round isolates one question, like a professional draping session.
// Effects are what picking that side says about you.
export type DrapeRound = {
  id: string;
  question: string;
  a: { id: string; hex: string; name: string; fx: { hue?: number; value?: number; chroma?: number } };
  b: { id: string; hex: string; name: string; fx: { hue?: number; value?: number; chroma?: number } };
};

export const ROUNDS: DrapeRound[] = [
  { id: "temp1", question: "Warm or cool?", a: { id: "A", hex: "#C2185B", name: "cool fuchsia", fx: { hue: -1 } }, b: { id: "B", hex: "#E8613C", name: "warm coral", fx: { hue: 1 } } },
  { id: "light", question: "Light or deep?", a: { id: "E", hex: "#F4C6CF", name: "pastel pink", fx: { value: -1 } }, b: { id: "F", hex: "#6B1D34", name: "burgundy", fx: { value: 1 } } },
  { id: "bright", question: "Bright or soft?", a: { id: "G", hex: "#00A36C", name: "clear emerald", fx: { chroma: 1 } }, b: { id: "H", hex: "#9DAF8B", name: "sage", fx: { chroma: -1 } } },
  { id: "temp2", question: "Warm or cool?", a: { id: "C", hex: "#7FB2E5", name: "icy blue", fx: { hue: -1, chroma: 0.3 } }, b: { id: "D", hex: "#1A9C8C", name: "warm teal", fx: { hue: 1 } } },
  { id: "white", question: "Which white?", a: { id: "I", hex: "#FFFFFF", name: "optic white", fx: { hue: -0.5, chroma: 0.7 } }, b: { id: "J", hex: "#F2E8D0", name: "ivory", fx: { hue: 0.5, chroma: -0.3 } } },
  { id: "dark", question: "Which dark?", a: { id: "K", hex: "#121212", name: "black", fx: { chroma: 0.6, value: 0.5, hue: -0.3 } }, b: { id: "L", hex: "#4E3324", name: "chocolate brown", fx: { hue: 0.5, chroma: -0.4 } } },
  { id: "muted", question: "Earthy or cool gray?", a: { id: "M", hex: "#6E7B32", name: "olive", fx: { hue: 0.6, chroma: -0.3 } }, b: { id: "N", hex: "#8E9AAF", name: "cool gray-blue", fx: { hue: -0.6, chroma: -0.3 } } },
  { id: "metal", question: "Gold or silver?", a: { id: "O", hex: "#C9A227", name: "gold", fx: { hue: 1 } }, b: { id: "P", hex: "#C3C7CC", name: "silver", fx: { hue: -1 } } },
];

export type Vote = "a" | "b" | "same";

// Hair and eye picks reuse the quiz options' meaning.
export type HairEye = { hairValue: number; hairHue: number; eyeChroma: number; hairL: number };

/** Combine skin measurements, hair/eyes and drape votes into season coordinates. */
export function scoreMeasured(m: ColorMeasurements, he: HairEye, votes: Record<string, Vote>): MeasuredColor {
  if (!m.skin) throw new Error("No skin measurement");
  const skin = m.skin;
  const tally = { hue: 0, value: 0, chroma: 0 };
  const n = { hue: 0, value: 0, chroma: 0 };
  const best: string[] = [], worst: string[] = [];
  for (const r of ROUNDS) {
    const v = votes[r.id];
    if (!v || v === "same") continue;
    const win = v === "a" ? r.a : r.b, lose = v === "a" ? r.b : r.a;
    best.push(win.id); worst.push(lose.id);
    for (const k of ["hue", "value", "chroma"] as const) {
      if (win.fx[k] !== undefined) { tally[k] += win.fx[k]!; n[k] += Math.abs(win.fx[k]!); }
    }
  }
  const dh = n.hue ? tally.hue / n.hue : 0, dv = n.value ? tally.value / n.value : 0, dc = n.chroma ? tally.chroma / n.chroma : 0;

  // Measured: hue angle ~58° is neutral skin; olive damps warmth (green-gold is not golden).
  // Olive: combine the measured score with draping evidence (olive beating cool
  // gray, and soft sage beating clear emerald, are classic olive signs).
  const olive = skin.undertone.oliveScore;
  const oliveEvidence = olive + (votes.muted === "a" ? 0.08 : 0) + (votes.bright === "b" ? 0.04 : 0);
  const isOlive = oliveEvidence >= 0.5;
  // Green-gold reads "yellow" to a camera but isn't golden warmth, so damp warmth gradually.
  let mh = clamp((skin.undertone.hueAngle - 58) / 14);
  if (mh > 0) mh *= 1 - 0.6 * Math.min(1, olive / 0.6);
  const mv = clamp(0.75 * clamp((62 - skin.lab.L) / 26) + 0.25 * he.hairValue);
  const contrastL = Math.abs(skin.lab.L - he.hairL);
  const mc = clamp(0.5 * he.eyeChroma + (contrastL - 30) / 45);

  const h = clamp(0.45 * (0.8 * mh + 0.2 * he.hairHue) + 0.55 * dh);
  const v = clamp(0.65 * mv + 0.35 * dv);
  const c = clamp(0.35 * mc + 0.65 * dc - (isOlive ? 0.15 : 0));

  // Confidence: do the measurements and your eyes agree on warm vs cool?
  const agree = Math.sign(mh) === Math.sign(dh) || Math.abs(mh) < 0.15 || Math.abs(dh) < 0.15;
  const decided = Object.values(votes).filter((x) => x !== "same").length;
  const confidence: MeasuredColor["confidence"] = !agree || decided < 5 ? "low" : decided >= 7 && Math.abs(h) > 0.25 ? "high" : "medium";

  const lean = skin.undertone.hueLean;
  const explained =
    `Measured after color-correcting your selfie: your skin sits at ${skin.monk.index} of 10 on the Monk scale with a ${lean} undertone reading` +
    `${isOlive ? ", and the green-gold signature of an olive complexion" : ""}. ` +
    `In the draping you preferred ${best.slice(0, 3).map((id) => ROUNDS.flatMap((r) => [r.a, r.b]).find((x) => x.id === id)?.name).filter(Boolean).join(", ")}` +
    `${agree ? ", which agrees with the measurements." : ", which leans a different way from the measurements, so treat this as a starting point and re-check in other light."}`;

  return {
    h, v, c,
    contrast: clamp((contrastL - 30) / 20) * 3,
    isOlive,
    confidence,
    explained,
    drapes: {
      best, worst,
      observations: agree
        ? "Your side-by-side picks and your measured coloring point the same way."
        : "Your picks and your measurements disagree a little. Try the draping again in daylight, looking only at your skin and eyes.",
    },
  };
}
