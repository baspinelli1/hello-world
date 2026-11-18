// Color science for My Stylist. Pure functions, no browser APIs, so they can be
// unit-tested in Node and run in the browser on canvas pixel data.

export type RGB = [number, number, number]; // 0-255 sRGB
export type Lab = { L: number; a: number; b: number };
export type LCh = { L: number; C: number; h: number };

// ---------- sRGB <-> linear <-> XYZ <-> CIELAB (D65) ----------

export function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

const D65 = { X: 0.95047, Y: 1.0, Z: 1.08883 };

export function rgbToLab([r, g, b]: RGB): Lab {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / D65.X;
  const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / D65.Y;
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / D65.Z;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function labToRgb({ L, a, b }: Lab): RGB {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const X = inv(fx) * D65.X, Y = inv(fy) * D65.Y, Z = inv(fz) * D65.Z;
  const R = X * 3.2404542 - Y * 1.5371385 - Z * 0.4985314;
  const G = -X * 0.969266 + Y * 1.8760108 + Z * 0.041556;
  const B = X * 0.0556434 - Y * 0.2040259 + Z * 1.0572252;
  return [linearToSrgb(R), linearToSrgb(G), linearToSrgb(B)];
}

export function labToLch({ L, a, b }: Lab): LCh {
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C: Math.hypot(a, b), h };
}

export function deltaE(p: Lab, q: Lab): number {
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ---------- Robust sampling ----------

/** Median of each channel after dropping clipped and very dark pixels. */
export function robustMedian(pixels: RGB[]): RGB | null {
  const usable = pixels.filter(([r, g, b]) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max < 250 && min > 6; // drop blown highlights and crushed shadows
  });
  if (usable.length < 8) return null;
  const med = (i: 0 | 1 | 2) => {
    const s = usable.map((p) => p[i]).sort((x, y) => x - y);
    return s[Math.floor(s.length / 2)];
  };
  return [med(0), med(1), med(2)];
}

// ---------- White-paper calibration ----------

export type Calibration = {
  gains: [number, number, number]; // linear-light multipliers per channel
  paperRgb: RGB;
  castDescription: string; // human-readable camera color cast that was removed
};

/**
 * Compute a von Kries-style correction that makes the reference paper neutral
 * and normalises exposure so the paper sits at a typical white (Y ~ 0.80).
 * Exposure normalisation matters for deeper skin, which phone cameras often
 * underexpose.
 */
export function calibrationFromPaper(paper: RGB): Calibration {
  const lin = paper.map(srgbToLinear) as [number, number, number];
  const target = 0.8;
  const gains = lin.map((v) => target / Math.max(v, 0.02)) as [number, number, number];
  // Limit extreme corrections (bad paper detection should not wreck the image).
  const clamp = (g: number) => Math.max(0.35, Math.min(4, g));
  const g = gains.map(clamp) as [number, number, number];
  const lab = rgbToLab(paper);
  const cast: string[] = [];
  if (lab.b > 4) cast.push("yellow/warm");
  if (lab.b < -4) cast.push("blue/cool");
  if (lab.a > 4) cast.push("magenta");
  if (lab.a < -4) cast.push("green");
  return {
    gains: g,
    paperRgb: paper,
    castDescription: cast.length ? `removed a ${cast.join(" + ")} camera cast` : "camera color was already close to neutral",
  };
}

export function applyCalibration([r, g, b]: RGB, cal: Calibration | null): RGB {
  if (!cal) return [r, g, b];
  return [
    linearToSrgb(srgbToLinear(r) * cal.gains[0]),
    linearToSrgb(srgbToLinear(g) * cal.gains[1]),
    linearToSrgb(srgbToLinear(b) * cal.gains[2]),
  ];
}

// ---------- Skin metrics ----------

/** Individual Typology Angle, a dermatology standard for skin lightness. */
export function ita(lab: Lab): number {
  return (Math.atan2(lab.L - 50, lab.b) * 180) / Math.PI;
}

export function itaCategory(angle: number): string {
  if (angle > 55) return "very light";
  if (angle > 41) return "light";
  if (angle > 28) return "intermediate";
  if (angle > 10) return "tan";
  if (angle > -30) return "brown";
  return "dark";
}

// Monk Skin Tone Scale reference swatches (Google / Dr. Ellis Monk).
export const MONK_SCALE = [
  "#f6ede4", "#f3e7db", "#f7ead0", "#eadaba", "#d7bd96",
  "#a07e56", "#825c43", "#604134", "#3a312a", "#292420",
];

export function nearestMonk(lab: Lab): { index: number; hex: string } {
  let best = 0, bestD = Infinity;
  MONK_SCALE.forEach((hex, i) => {
    const d = deltaE(lab, rgbToLab(hexToRgb(hex)));
    if (d < bestD) { bestD = d; best = i; }
  });
  return { index: best + 1, hex: MONK_SCALE[best] };
}

/**
 * Hue-based undertone reading. Human skin sits roughly between 30° (rosy) and
 * 80° (golden) hue in CIELAB. Olive shows as a high hue angle (yellow-green
 * shifted, little red) combined with LOW chroma: muted, not golden.
 * Returns a 0-1 olive score plus a warm/cool lean; these are evidence for the
 * AI, not a verdict.
 */
export function undertoneSignals(lab: Lab) {
  const { C, h } = labToLch(lab);
  // Olive = little red relative to yellow (low a*/b*) AND lower chroma than
  // golden skin. Golden skin is yellow but saturated; olive is yellow-green and muted.
  const ratio = lab.a / Math.max(lab.b, 1);
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const greenLean = clamp01((0.5 - ratio) / 0.3);
  const muted = clamp01((30 - C) / 12);
  const oliveScore = +(greenLean * muted).toFixed(2);
  const redness = +ratio.toFixed(2); // >1 pink/red, <0.35 yellow-green
  let lean: "cool" | "neutral" | "warm" | "olive";
  if (oliveScore >= 0.5) lean = "olive";
  else if (h < 52) lean = "cool";
  else if (h > 64) lean = "warm";
  else lean = "neutral";
  return { hueAngle: +h.toFixed(1), chroma: +C.toFixed(1), oliveScore, redToYellowRatio: redness, hueLean: lean };
}

export type RegionReading = { region: string; hex: string; lab: Lab };

export type ColorMeasurements = {
  calibrated: boolean;
  calibrationNote: string;
  skin: {
    averageHex: string;
    lab: Lab;
    ita: number;
    itaCategory: string;
    monk: { index: number; hex: string };
    undertone: ReturnType<typeof undertoneSignals>;
    regions: RegionReading[];
    evenness: number; // spread of deltaE between regions, higher = more variation (redness, tan lines, etc.)
  } | null;
  hair: { hex: string; L: number } | null;
  eyes: { hex: string; L: number } | null;
  lips: { hex: string; lab: Lab } | null;
  contrast: { hairToSkin: number | null; eyesToSkin: number | null; level: string } | null;
  sunExposure: {
    wristHex: string;
    faceMinusWristL: number; // negative = face darker (tan)
    faceMinusWristB: number; // positive = face more yellow/golden than baseline
    reading: string;
  } | null;
};

function meanLab(labs: Lab[]): Lab {
  const n = labs.length;
  return {
    L: labs.reduce((s, x) => s + x.L, 0) / n,
    a: labs.reduce((s, x) => s + x.a, 0) / n,
    b: labs.reduce((s, x) => s + x.b, 0) / n,
  };
}

const round = (l: Lab): Lab => ({ L: +l.L.toFixed(1), a: +l.a.toFixed(1), b: +l.b.toFixed(1) });

/** Combine calibrated region samples into the measurement report the AI reads. */
export function buildMeasurements(input: {
  calibration: Calibration | null;
  skinRegions: { region: string; rgb: RGB }[];
  hair?: RGB | null;
  eyes?: RGB | null;
  lips?: RGB | null;
  wrist?: RGB | null;
}): ColorMeasurements {
  const { calibration } = input;
  const skinReadings: RegionReading[] = input.skinRegions.map(({ region, rgb }) => ({
    region,
    hex: rgbToHex(rgb),
    lab: round(rgbToLab(rgb)),
  }));

  let skin: ColorMeasurements["skin"] = null;
  if (skinReadings.length) {
    const avg = meanLab(skinReadings.map((r) => r.lab));
    const spread = skinReadings.length > 1
      ? Math.max(...skinReadings.flatMap((p) => skinReadings.map((q) => deltaE(p.lab, q.lab))))
      : 0;
    const angle = ita(avg);
    skin = {
      averageHex: rgbToHex(labToRgb(avg)),
      lab: round(avg),
      ita: +angle.toFixed(1),
      itaCategory: itaCategory(angle),
      monk: nearestMonk(avg),
      undertone: undertoneSignals(avg),
      regions: skinReadings,
      evenness: +spread.toFixed(1),
    };
  }

  const toLab = (c?: RGB | null) => (c ? rgbToLab(c) : null);
  const hairLab = toLab(input.hair), eyeLab = toLab(input.eyes), lipLab = toLab(input.lips);

  let contrast: ColorMeasurements["contrast"] = null;
  if (skin && (hairLab || eyeLab)) {
    const hs = hairLab ? +Math.abs(skin.lab.L - hairLab.L).toFixed(1) : null;
    const es = eyeLab ? +Math.abs(skin.lab.L - eyeLab.L).toFixed(1) : null;
    const main = hs ?? es ?? 0;
    const level = main > 45 ? "high" : main > 25 ? "medium" : "low";
    contrast = { hairToSkin: hs, eyesToSkin: es, level };
  }

  let sunExposure: ColorMeasurements["sunExposure"] = null;
  if (skin && input.wrist) {
    const w = rgbToLab(input.wrist);
    const dL = +(skin.lab.L - w.L).toFixed(1);
    const dB = +(skin.lab.b - w.b).toFixed(1);
    let reading = "face and inner wrist match closely, so what we see is mostly your true undertone";
    if (dL < -4 || dB > 4) reading = "face is darker and/or more golden than your inner wrist, which points to a tan sitting on top of your undertone";
    else if (skin.lab.a - w.a > 4) reading = "face is redder than your inner wrist, which points to surface redness (flushing, sensitivity) rather than undertone";
    sunExposure = { wristHex: rgbToHex(input.wrist), faceMinusWristL: dL, faceMinusWristB: dB, reading };
  }

  return {
    calibrated: !!calibration,
    calibrationNote: calibration ? calibration.castDescription : "no white reference found, so readings may include the camera's color cast",
    skin,
    hair: input.hair && hairLab ? { hex: rgbToHex(input.hair), L: +hairLab.L.toFixed(1) } : null,
    eyes: input.eyes && eyeLab ? { hex: rgbToHex(input.eyes), L: +eyeLab.L.toFixed(1) } : null,
    lips: input.lips && lipLab ? { hex: rgbToHex(input.lips), lab: round(lipLab) } : null,
    contrast,
    sunExposure,
  };
}

// ---------- Test drapes ----------
// Pairs isolate one dimension at a time, like a professional draping session.
export const DRAPES: { id: string; hex: string; name: string; tests: string }[] = [
  { id: "A", hex: "#C2185B", name: "cool fuchsia", tests: "temperature: cool" },
  { id: "B", hex: "#E8613C", name: "warm coral", tests: "temperature: warm" },
  { id: "C", hex: "#7FB2E5", name: "icy blue", tests: "temperature: cool + light" },
  { id: "D", hex: "#1A9C8C", name: "warm teal", tests: "temperature: warm" },
  { id: "E", hex: "#F4C6CF", name: "pastel pink", tests: "depth: light" },
  { id: "F", hex: "#6B1D34", name: "burgundy", tests: "depth: deep" },
  { id: "G", hex: "#00A36C", name: "clear emerald", tests: "chroma: bright" },
  { id: "H", hex: "#9DAF8B", name: "sage", tests: "chroma: muted" },
  { id: "I", hex: "#FFFFFF", name: "optic white", tests: "temperature + contrast: cool/bright" },
  { id: "J", hex: "#F2E8D0", name: "ivory", tests: "temperature: warm/soft" },
  { id: "K", hex: "#121212", name: "black", tests: "contrast: high" },
  { id: "L", hex: "#4E3324", name: "chocolate brown", tests: "contrast: medium/warm" },
  { id: "M", hex: "#6E7B32", name: "olive", tests: "olive harmony" },
  { id: "N", hex: "#8E9AAF", name: "cool gray-blue", tests: "temperature: cool/muted" },
  { id: "O", hex: "#C9A227", name: "gold", tests: "metal: warm" },
  { id: "P", hex: "#C3C7CC", name: "silver", tests: "metal: cool" },
];
