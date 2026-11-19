// The no-photo path. Questions are scored locally (no AI, no cost) into the
// same Profile shape the photo analysis produces, so every screen works.
import { ESSENCES, KIBBE, SEASONS, type SeasonEntry, type TypeEntry } from "./learn";
import type { Profile } from "./schemas";

type ColorFx = { hue?: number; value?: number; chroma?: number; contrast?: number; olive?: number };
type Letter = "A" | "B" | "C" | "D" | "E";
type Vertical = "long" | "moderate" | "short";

export type Option = { label: string; hint?: string; swatch?: string; color?: ColorFx; kibbe?: Letter; vertical?: Vertical | "+long" | "+short"; essence?: string };
export type Question = { id: string; part: "Color" | "Body" | "Essence"; text: string; help?: string; options: Option[] };

export const QUESTIONS: Question[] = [
  // ---------- Color ----------
  { id: "hair", part: "Color", text: "Your natural hair color", help: "Before dye or gray. Think of it at its natural best.", options: [
    { label: "Platinum or ash blonde", swatch: "#E5DCC8", color: { value: -2, hue: -0.5 } },
    { label: "Golden or strawberry blonde", swatch: "#E0B46E", color: { value: -1.5, hue: 1.5 } },
    { label: "Light-to-medium ash brown", swatch: "#8C7A64", color: { value: -0.3, hue: -0.5, chroma: -1.5 } },
    { label: "Golden, copper or red brown", swatch: "#8A4B2A", color: { value: 0.3, hue: 2 } },
    { label: "Dark brown", swatch: "#3E2A1E", color: { value: 1.2 } },
    { label: "Black or blue-black", swatch: "#121212", color: { value: 2, hue: -0.5, chroma: 0.5 } },
  ] },
  { id: "eyes", part: "Color", text: "Your eye color", options: [
    { label: "Icy blue or gray", swatch: "#A9C1D9", color: { hue: -1, chroma: 0.5, value: -0.5 } },
    { label: "Vivid blue, green or turquoise", swatch: "#2F8FB8", color: { chroma: 2 } },
    { label: "Soft hazel, gray-green or blue-gray", swatch: "#8A8C6A", color: { chroma: -2 } },
    { label: "Warm hazel, amber or golden brown", swatch: "#A0702F", color: { hue: 1.5 } },
    { label: "Medium-to-dark brown", swatch: "#4A2E1E", color: { value: 1 } },
    { label: "Very dark brown, near black", swatch: "#1E1410", color: { value: 1.5, chroma: 0.5 } },
  ] },
  { id: "sun", part: "Color", text: "In the sun, your skin…", options: [
    { label: "Burns easily, rarely tans", color: { value: -1 } },
    { label: "Burns first, then tans lightly", color: { value: -0.5 } },
    { label: "Tans easily to golden", color: { value: 0.3, hue: 0.5 } },
    { label: "Tans deeply, rarely burns", color: { value: 1 } },
    { label: "Is already deep; the sun just deepens it", color: { value: 1.5 } },
  ] },
  { id: "skin", part: "Color", text: "Your skin looks most…", help: "Check in daylight, without makeup.", options: [
    { label: "Pink or rosy, flushes easily", color: { hue: -1.5 } },
    { label: "Peachy or golden", color: { hue: 1.5 } },
    { label: "Neutral beige, neither pink nor yellow", color: {} },
    { label: "Olive: beige with a green or gray cast", color: { olive: 2, hue: 0.3, chroma: -0.5 } },
    { label: "Deep, with red or blue tones", color: { hue: -1, value: 1 } },
    { label: "Deep, with golden or bronze tones", color: { hue: 1, value: 1 } },
  ] },
  { id: "foundation", part: "Color", text: "When you try foundation…", options: [
    { label: "Pink-toned shades match best", color: { hue: -1 } },
    { label: "Yellow or golden shades match best", color: { hue: 1 } },
    { label: "Pink looks too pink AND yellow looks too yellow", color: { olive: 2 } },
    { label: "Neutral shades work best", color: {} },
    { label: "I don't wear it / not sure", color: {} },
  ] },
  { id: "metal", part: "Color", text: "Which jewelry looks best on you?", options: [
    { label: "Silver or platinum", swatch: "#C3C7CC", color: { hue: -1.5 } },
    { label: "Shiny yellow gold", swatch: "#D4AF37", color: { hue: 1.5, chroma: 0.5 } },
    { label: "Rose gold", swatch: "#C9967F", color: { hue: 0.2, chroma: -0.5 } },
    { label: "Antique or brushed metals", swatch: "#9C8A62", color: { chroma: -1.5 } },
    { label: "They all look about the same", color: {} },
  ] },
  { id: "white", part: "Color", text: "Which white looks best near your face?", options: [
    { label: "Pure, bright white", swatch: "#FFFFFF", color: { hue: -1, chroma: 1.5 } },
    { label: "Soft white with a hint of gray", swatch: "#ECEBE6", color: { hue: -0.5, chroma: -1 } },
    { label: "Ivory or cream", swatch: "#F3E9D2", color: { hue: 1, chroma: 0.3 } },
    { label: "Oatmeal or beige", swatch: "#E3D5BC", color: { hue: 0.5, chroma: -1.5 } },
  ] },
  { id: "compliments", part: "Color", text: "You get the most compliments in…", options: [
    { label: "Jewel tones: emerald, cobalt, fuchsia", swatch: "#0047AB", color: { chroma: 2, hue: -0.5 } },
    { label: "Warm brights: coral, turquoise, sunny yellow", swatch: "#FF7F50", color: { chroma: 1.5, hue: 1.5 } },
    { label: "Dusty shades: mauve, sage, slate", swatch: "#A0798F", color: { chroma: -2 } },
    { label: "Earthy shades: rust, olive, mustard", swatch: "#B7410E", color: { hue: 2, value: 0.5, chroma: -0.3 } },
    { label: "Pastels: powder blue, blush, mint", swatch: "#A7C7E7", color: { value: -1.5 } },
    { label: "Deep darks: black, burgundy, forest", swatch: "#5E1A2E", color: { value: 1.5 } },
  ] },
  { id: "black", part: "Color", text: "When you wear black near your face…", options: [
    { label: "It looks striking", color: { contrast: 2, value: 0.5, chroma: 0.5 } },
    { label: "It's fine, maybe a bit harsh", color: {} },
    { label: "I look tired or shadowy", color: { contrast: -1.5, value: -0.5, chroma: -0.5 } },
  ] },
  { id: "contrast", part: "Color", text: "In a black-and-white photo, your hair, skin and eyes look…", options: [
    { label: "Very different (e.g. dark hair, light skin)", color: { contrast: 2 } },
    { label: "Somewhat different", color: { contrast: 0.5 } },
    { label: "Similar and blended", color: { contrast: -2 } },
  ] },
  { id: "olive", part: "Color", text: "Do olive, khaki and moss look surprisingly good on you?", help: "A common sign of an olive complexion.", options: [
    { label: "Yes, they blend beautifully", color: { olive: 1, chroma: -0.3 } },
    { label: "No, they make me look sallow", color: { olive: -1 } },
    { label: "Not sure", color: {} },
  ] },

  // ---------- Body (Kibbe) ----------
  { id: "height", part: "Body", text: "Your height", options: [
    { label: "Under 5'3\" (160 cm)", vertical: "short" },
    { label: "5'3\"–5'6\" (160–169 cm)", vertical: "moderate" },
    { label: "5'7\" (170 cm) or taller", vertical: "long" },
  ] },
  { id: "seem", part: "Body", text: "People often say you look…", options: [
    { label: "Taller than you are", vertical: "+long" },
    { label: "About your actual height" },
    { label: "Smaller or more petite than you are", vertical: "+short" },
  ] },
  { id: "shoulders", part: "Body", text: "Your shoulders are…", options: [
    { label: "Sharp, narrow and angular", kibbe: "A" },
    { label: "Broad, square or blunt", kibbe: "B" },
    { label: "Even and balanced", kibbe: "C" },
    { label: "Small and narrow, a little sharp", kibbe: "D" },
    { label: "Sloped and rounded", kibbe: "E" },
  ] },
  { id: "hands", part: "Body", text: "Your hands and feet are…", options: [
    { label: "Long and narrow", kibbe: "A" },
    { label: "Large or wide", kibbe: "B" },
    { label: "Medium and proportionate", kibbe: "C" },
    { label: "Small but angular", kibbe: "D" },
    { label: "Small and soft", kibbe: "E" },
  ] },
  { id: "jaw", part: "Body", text: "Your jaw and cheekbones are…", options: [
    { label: "Sharp, angular and prominent", kibbe: "A" },
    { label: "Wide, blunt or square", kibbe: "B" },
    { label: "Even and symmetrical", kibbe: "C" },
    { label: "A mix of sharp and soft, small-scale", kibbe: "D" },
    { label: "Rounded and soft", kibbe: "E" },
  ] },
  { id: "flesh", part: "Body", text: "Your body shape is mostly…", help: "Your frame, at any weight.", options: [
    { label: "Straight, long and lean", kibbe: "A" },
    { label: "Straight, with some width", kibbe: "B" },
    { label: "Balanced, gently curved", kibbe: "C" },
    { label: "Compact, a mix of straight and curvy", kibbe: "D" },
    { label: "Soft and curvy, even when slim", kibbe: "E" },
  ] },
  { id: "fits", part: "Body", text: "Off the rack, what fits you best?", options: [
    { label: "Long, sharp tailoring", kibbe: "A" },
    { label: "Oversized and relaxed", kibbe: "B" },
    { label: "Classic tailored pieces", kibbe: "C" },
    { label: "Cropped, fitted or petite sizes", kibbe: "D" },
    { label: "Fitted waists and soft fabrics", kibbe: "E" },
  ] },

  // ---------- Essence (Kitchener) ----------
  { id: "described", part: "Essence", text: "People most often describe you as…", options: [
    { label: "Striking or intense", essence: "dramatic" },
    { label: "Easygoing and down-to-earth", essence: "natural" },
    { label: "Polished and put-together", essence: "classic" },
    { label: "Playful and spunky", essence: "gamine" },
    { label: "Sweet and young-looking", essence: "ingenue" },
    { label: "Dreamy and serene", essence: "ethereal" },
    { label: "Warm and alluring", essence: "romantic" },
  ] },
  { id: "eyesvibe", part: "Essence", text: "Your eyes come across as…", options: [
    { label: "Piercing", essence: "dramatic" },
    { label: "Warm and open", essence: "natural" },
    { label: "Calm and steady", essence: "classic" },
    { label: "Sparkly and mischievous", essence: "gamine" },
    { label: "Large and innocent", essence: "ingenue" },
    { label: "Luminous and faraway", essence: "ethereal" },
    { label: "Sultry", essence: "romantic" },
  ] },
  { id: "party", part: "Essence", text: "At a party, you're the one who…", options: [
    { label: "Everyone notices walking in", essence: "dramatic" },
    { label: "Chats comfortably with everyone", essence: "natural" },
    { label: "Is the gracious host", essence: "classic" },
    { label: "Makes everyone laugh", essence: "gamine" },
    { label: "People want to look after", essence: "ingenue" },
    { label: "Quietly observes", essence: "ethereal" },
    { label: "People are drawn to", essence: "romantic" },
  ] },
  { id: "outfit", part: "Essence", text: "Which outfit feels most like you?", options: [
    { label: "A sleek statement look", essence: "dramatic" },
    { label: "Jeans and a soft knit", essence: "natural" },
    { label: "A tailored blazer and trousers", essence: "classic" },
    { label: "A striped top and cropped pants", essence: "gamine" },
    { label: "A pretty dress with delicate details", essence: "ingenue" },
    { label: "Something flowing and airy", essence: "ethereal" },
    { label: "A silk wrap dress", essence: "romantic" },
  ] },
];

// Season positions on hue (cool -1 to warm 1), value (light -1 to deep 1), chroma (soft -1 to clear 1).
export const SEASON_POS: Record<string, [number, number, number]> = {
  "light-spring": [0.4, -1, 0.3], "true-spring": [1, -0.3, 0.6], "bright-spring": [0.4, 0, 1],
  "light-summer": [-0.4, -1, -0.2], "true-summer": [-1, -0.2, -0.3], "soft-summer": [-0.4, 0, -1],
  "soft-autumn": [0.4, 0, -1], "true-autumn": [1, 0.2, -0.2], "deep-autumn": [0.4, 1, -0.1],
  "deep-winter": [-0.4, 1, 0.3], "true-winter": [-1, 0.3, 0.7], "bright-winter": [-0.4, 0, 1],
};

const NEUTRALS: Record<string, { hex: string; name: string }[]> = {
  "light-spring": [{ hex: "#FFF6E5", name: "warm white" }, { hex: "#E6D3B3", name: "light camel" }, { hex: "#A9A49A", name: "light warm gray" }, { hex: "#4A5D7E", name: "soft navy" }],
  "true-spring": [{ hex: "#FFF1D6", name: "cream" }, { hex: "#C19A6B", name: "camel" }, { hex: "#8B6B47", name: "golden brown" }, { hex: "#3B4F7A", name: "warm navy" }],
  "bright-spring": [{ hex: "#FFFBEA", name: "ivory" }, { hex: "#36454F", name: "charcoal" }, { hex: "#2C3E66", name: "bright navy" }, { hex: "#C9B79C", name: "light khaki" }],
  "light-summer": [{ hex: "#F7F7F2", name: "soft white" }, { hex: "#B9BCC4", name: "light gray" }, { hex: "#C7B8A8", name: "rose beige" }, { hex: "#5A6E8C", name: "gray navy" }],
  "true-summer": [{ hex: "#F2F2EE", name: "soft white" }, { hex: "#8E97A3", name: "blue-gray" }, { hex: "#2E3F5C", name: "soft navy" }, { hex: "#6E6A73", name: "cool taupe" }],
  "soft-summer": [{ hex: "#E8E4DC", name: "soft white" }, { hex: "#A39787", name: "taupe" }, { hex: "#8A8D91", name: "pewter" }, { hex: "#4A4E57", name: "charcoal" }],
  "soft-autumn": [{ hex: "#E9DCC4", name: "oat" }, { hex: "#B49A7A", name: "mushroom" }, { hex: "#6F6A5F", name: "warm charcoal" }, { hex: "#5C4A3B", name: "cocoa" }],
  "true-autumn": [{ hex: "#F0E2C4", name: "cream" }, { hex: "#C19A6B", name: "camel" }, { hex: "#4E3324", name: "chocolate" }, { hex: "#5A5A3C", name: "olive drab" }],
  "deep-autumn": [{ hex: "#EFE3CC", name: "warm ivory" }, { hex: "#8C6A4A", name: "tobacco" }, { hex: "#3B2A20", name: "espresso" }, { hex: "#2F3A2A", name: "deep olive" }],
  "deep-winter": [{ hex: "#FAFAFA", name: "true white" }, { hex: "#36454F", name: "charcoal" }, { hex: "#1B2A4A", name: "deep navy" }, { hex: "#111111", name: "black" }],
  "true-winter": [{ hex: "#FFFFFF", name: "pure white" }, { hex: "#7D8590", name: "cool gray" }, { hex: "#1B2A4A", name: "navy" }, { hex: "#111111", name: "black" }],
  "bright-winter": [{ hex: "#FFFFFF", name: "pure white" }, { hex: "#5A6270", name: "steel gray" }, { hex: "#14213D", name: "ink navy" }, { hex: "#111111", name: "black" }],
};

const FAMILY_NOTES: Record<SeasonEntry["family"], { metals: string; makeup: string; tan: string }> = {
  Spring: { metals: "Shiny yellow and light gold.", makeup: "Peach and coral lips, warm pink blush, soft brown liner.", tan: "A tan pushes you toward warmer, clearer colors; when paler, lean lighter and softer." },
  Summer: { metals: "Silver, white gold, pewter and rose gold.", makeup: "Rose, berry and mauve lips, cool pink blush, gray-brown liner.", tan: "With a tan you can wear slightly deeper shades; when paler, keep it light and soft." },
  Autumn: { metals: "Gold, bronze and copper, especially brushed finishes.", makeup: "Terracotta, brick and rosy-brown lips, peach-bronze blush.", tan: "A tan lets you go deeper and richer; when paler, lean softer and more muted." },
  Winter: { metals: "Silver, platinum and white gold with a high shine.", makeup: "Blue-red, berry or fuchsia lips, cool rosy blush, defined liner.", tan: "A tan deepens your contrast; when paler, icy accents and crisp white shine." },
};

const BRANDS: Record<string, Profile["summary"]["brands"]> = {
  dramatic: [{ name: "COS", price: "$$", why: "Architectural, clean-lined pieces." }, { name: "Theory", price: "$$$", why: "Sharp tailoring that thrifts well." }, { name: "Zara", price: "$", why: "Affordable statement shapes." }],
  natural: [{ name: "Madewell", price: "$$", why: "Relaxed denim and soft knits." }, { name: "Eileen Fisher", price: "$$$", why: "Easy shapes, widely found secondhand." }, { name: "Uniqlo", price: "$", why: "Simple basics in natural fabrics." }],
  classic: [{ name: "J.Crew", price: "$$", why: "Timeless staples that thrift well." }, { name: "Banana Republic", price: "$$", why: "Polished workwear basics." }, { name: "Everlane", price: "$$", why: "Clean, quality essentials." }],
  gamine: [{ name: "& Other Stories", price: "$$", why: "Playful details and crisp shapes." }, { name: "Saint James", price: "$$$", why: "The classic Breton stripe." }, { name: "Uniqlo", price: "$", why: "Cropped and fitted basics." }],
  ingenue: [{ name: "Sézane", price: "$$$", why: "Sweet details like small florals and bows." }, { name: "Loft", price: "$", why: "Soft, feminine everyday pieces." }, { name: "Reformation", price: "$$$", why: "Pretty dresses, often resold." }],
  ethereal: [{ name: "Free People", price: "$$", why: "Flowing, airy layers." }, { name: "Anthropologie", price: "$$", why: "Delicate, dreamy fabrics." }, { name: "Vince", price: "$$$", why: "Soft, fluid basics that thrift well." }],
  romantic: [{ name: "Reformation", price: "$$$", why: "Wrap and draped silhouettes." }, { name: "Realisation Par", price: "$$$", why: "Silk slips and sensual prints." }, { name: "H&M", price: "$", why: "Affordable satin and lace." }],
};

export type Answers = Record<string, number>; // question id -> option index

const clamp = (x: number) => Math.max(-1, Math.min(1, x));
function band<T extends string>(x: number, labels: readonly T[]): T {
  const i = Math.round(((clamp(x) + 1) / 2) * (labels.length - 1));
  return labels[i];
}

/** Color measured from photos (free guided draping), used instead of the quiz's color questions. */
export type MeasuredColor = {
  h: number; v: number; c: number;
  contrast: number; // same scale as the quiz contrast total, roughly -3..3
  isOlive: boolean;
  confidence: "high" | "medium" | "low";
  explained: string;
  drapes: { best: string[]; worst: string[]; observations: string };
};

export function rankSeasons(h: number, v: number, c: number) {
  return Object.entries(SEASON_POS)
    .map(([slug, [sh, sv, sc]]) => ({ slug, d: Math.hypot(h - sh, v - sv, c - sc) }))
    .sort((a, b) => a.d - b.d);
}

export function scoreQuiz(answers: Answers, measured?: MeasuredColor) {
  const picked = (part: Question["part"]) =>
    QUESTIONS.filter((q) => q.part === part && answers[q.id] !== undefined).map((q) => q.options[answers[q.id]]);

  // Color
  const fx = { hue: 0, value: 0, chroma: 0, contrast: 0, olive: 0 };
  for (const o of picked("Color")) for (const k of Object.keys(fx) as (keyof typeof fx)[]) fx[k] += o.color?.[k] ?? 0;
  const isOlive = measured ? measured.isOlive : fx.olive >= 3;
  let h = fx.hue / 6, v = fx.value / 4.5, c = fx.chroma / 5 + fx.contrast * 0.08;
  if (isOlive && !measured) { h *= 0.6; c -= 0.15; }
  if (measured) { h = measured.h; v = measured.v; c = measured.c; fx.contrast = measured.contrast; }
  const ranked = rankSeasons(h, v, c);
  const season = SEASONS.find((s) => s.slug === ranked[0].slug)!;
  const runnerUp = SEASONS.find((s) => s.slug === ranked[1].slug)!;
  const colorConf: "high" | "medium" | "low" = measured ? measured.confidence : ranked[1].d - ranked[0].d > 0.2 ? "medium" : "low";

  // Body
  const L: Record<Letter, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let vert: Vertical = "moderate";
  let nudge = 0;
  for (const o of picked("Body")) {
    if (o.kibbe) L[o.kibbe]++;
    if (o.vertical === "long" || o.vertical === "moderate" || o.vertical === "short") vert = o.vertical;
    if (o.vertical === "+long") nudge = 1;
    if (o.vertical === "+short") nudge = -1;
  }
  if (nudge === 1 && vert === "moderate") vert = "long";
  if (nudge === -1 && vert === "moderate") vert = "short";
  const long = +(vert === "long"), short = +(vert === "short"), mod = +(vert === "moderate"), notLong = +(vert !== "long");
  const typeScores: Record<string, number> = {
    "dramatic": L.A * 2 + long * 3 - L.E * 1.5 - L.D,
    "soft-dramatic": L.A + L.E + long * 3 + L.B * 0.5,
    "flamboyant-natural": L.B * 2 + long * 2 + L.A * 0.5 - L.E,
    "soft-natural": L.B * 1.2 + L.E * 1.2 + notLong * 1.5 - L.A,
    "dramatic-classic": L.C * 2 + L.A * 0.7 + mod * 1.5 - L.E * 0.5,
    "soft-classic": L.C * 2 + L.E * 0.7 + mod * 1.5 - L.A * 0.5,
    "flamboyant-gamine": L.D * 2 + L.A * 0.7 + L.B * 0.5 + short * 2.5 - L.E * 0.5,
    "soft-gamine": L.D * 2 + L.E * 0.8 + short * 2.5 - L.A * 0.3,
    "romantic": L.E * 2 + notLong * 1.5 - L.A - L.B,
    "theatrical-romantic": L.E * 1.5 + L.A * 0.7 + notLong * 1.5 - L.B,
  };
  const kibbeRank = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
  const kibbe = KIBBE.find((k) => k.slug === kibbeRank[0][0])!;
  const kibbeRunner = KIBBE.find((k) => k.slug === kibbeRank[1][0])!;
  const kibbeConf: "medium" | "low" = kibbeRank[0][1] - kibbeRank[1][1] >= 1.5 ? "medium" : "low";

  // Essence: tally, first question breaks ties
  const tally: Record<string, number> = {};
  picked("Essence").forEach((o, i) => { if (o.essence) tally[o.essence] = (tally[o.essence] ?? 0) + (i === 0 ? 1.1 : 1); });
  const essRank = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const primary = ESSENCES.find((e) => e.slug === essRank[0]?.[0]) ?? ESSENCES[1];
  const secondary = essRank[1] ? ESSENCES.find((e) => e.slug === essRank[1][0]) ?? null : null;
  const essConf: "medium" | "low" = (essRank[0]?.[1] ?? 0) >= 2 ? "medium" : "low";

  return {
    color: { season, runnerUp, confidence: colorConf, h, v, c, contrast: fx.contrast, isOlive },
    body: { kibbe, runnerUp: kibbeRunner, confidence: kibbeConf, vertical: vert },
    essence: { primary, secondary, confidence: essConf },
  };
}

export function buildQuizProfile(answers: Answers, measured?: MeasuredColor): Profile {
  const r = scoreQuiz(answers, measured);
  const s = r.color.season;
  const fam = FAMILY_NOTES[s.family];
  const hueLabel = band(r.color.h, ["cool", "neutral-cool", "neutral", "neutral-warm", "warm"] as const);
  const oliveHue = r.color.h < -0.2 ? "olive-cool" : r.color.h > 0.2 ? "olive-warm" : "olive-neutral";
  const k: TypeEntry = r.body.kibbe;
  const e1: TypeEntry = r.essence.primary;
  const e2 = r.essence.secondary;

  return {
    color: {
      season: s.name,
      confidence: r.color.confidence,
      runner_up: r.color.runnerUp.name,
      dimensions: {
        hue: r.color.isOlive ? oliveHue : hueLabel,
        value: band(r.color.v, ["light", "light-medium", "medium", "medium-deep", "deep"] as const),
        chroma: band(r.color.c, ["soft", "soft-medium", "medium", "medium-clear", "clear"] as const),
        contrast: band(r.color.contrast / 3, ["low", "medium-low", "medium", "medium-high", "high"] as const),
      },
      is_olive: r.color.isOlive,
      undertone_explained: measured
        ? measured.explained
        : `${s.about}${r.color.isOlive ? " Your answers also point to an olive complexion: a green-gold cast that often sits on a neutral or cool base. That's why muted, slightly earthy versions of colors tend to suit you better than bright golden ones." : ""}`,
      why_other_apps_may_differ: measured
        ? "Most apps read raw photo colors, which your camera tints. My Stylist corrected your photo against white paper first, measured your skin in a scientific color space, and checked the result against your own side-by-side draping."
        : "A quiz can only go on what you tell it, and lighting, makeup and memory all blur how we see our own coloring. Adding photos lets My Stylist measure your skin directly.",
      drape_results: measured ? measured.drapes : { best: [], worst: [], observations: "" },
      palette: { neutrals: NEUTRALS[s.slug], core: s.palette, accents: [], avoid: s.avoid },
      metals: fam.metals,
      makeup_hints: fam.makeup,
      tan_mode: fam.tan,
    },
    body: {
      kibbe_type: k.name,
      confidence: r.body.confidence,
      runner_up: r.body.runnerUp.name,
      reasoning: `${k.about} Your answers described a ${r.body.vertical} vertical line, which is a key clue.`,
      lines_that_work: k.wear,
      lines_to_avoid: k.skip,
      fabrics: [],
    },
    essence: {
      primary: e1.name,
      secondary: e2 ? e2.name : "none",
      confidence: r.essence.confidence,
      reasoning: `${e1.about}${e2 ? ` A ${e2.name} side adds ${e2.keywords.slice(0, 2).join(" and ")} notes.` : ""}`,
      keywords: [...e1.keywords.slice(0, 3), ...(e2 ? e2.keywords.slice(0, 1) : [])],
      details_that_express_it: e1.wear,
    },
    summary: {
      headline: `${cap(e1.keywords[0])} and ${e1.keywords[1]}, in ${s.tagline.split(",")[0].toLowerCase()} tones`,
      style_formula: `${s.name} colors (${s.palette.slice(0, 3).map((c) => c.name).join(", ")}) in ${k.name} lines: ${k.wear[0].toLowerCase()}. Finish with ${e1.name} details like ${e1.wear[0].toLowerCase()}.`,
      signature_pieces: [k.wear[0], k.wear[1], e1.wear[0], e1.wear[1]],
      prints_and_textures: e2 ? [e1.wear[0], e2.wear[0]] : [e1.wear[0]],
      brands: BRANDS[e1.slug] ?? [],
    },
    photo_feedback: "",
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
