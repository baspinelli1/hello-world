import { z } from "zod";

// ---------- Step 1: locate regions in photos ----------
const Box = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).describe(
  "Normalized box, 0-1 fractions of image width/height, x/y = top-left corner"
);

export const PhotoLocateSchema = z.object({
  photos: z.array(
    z.object({
      index: z.number().describe("0-based index of the photo in the order given"),
      kind: z.enum(["face_closeup", "upper_body", "full_body", "wrist", "other"]),
      usable_for: z.array(z.enum(["color", "body", "essence"])),
      lighting: z.enum(["daylight_good", "indoor_warm", "indoor_cool", "mixed", "dark", "harsh"]),
      filter_or_edit_suspected: z.boolean(),
      makeup_heavy: z.boolean(),
      notes: z.string().describe("One short sentence on quality issues"),
      face: Box.nullable().describe("Face box from hairline to chin, ear to ear"),
      forehead: Box.nullable(),
      left_cheek: Box.nullable(),
      right_cheek: Box.nullable(),
      jaw: Box.nullable(),
      neck: Box.nullable(),
      lips: Box.nullable(),
      hair: Box.nullable().describe("A patch of hair, avoiding highlights and shine"),
      iris: Box.nullable().describe("Tight box around one iris"),
      white_paper: Box.nullable().describe("Plain white paper held in frame, if any; avoid glare"),
      inner_wrist: Box.nullable(),
    })
  ),
  missing: z.array(z.string()).describe("Photos still needed, e.g. 'one full-length photo'. Empty if nothing is missing."),
});
export type PhotoLocate = z.infer<typeof PhotoLocateSchema>;

// ---------- Step 2: full Style DNA analysis ----------
const Swatch = z.object({ hex: z.string(), name: z.string() });

export const ProfileSchema = z.object({
  color: z.object({
    season: z.string().describe("12-season name, e.g. 'Soft Autumn'"),
    confidence: z.enum(["high", "medium", "low"]),
    runner_up: z.string().describe("Closest neighbouring season"),
    dimensions: z.object({
      hue: z.enum(["cool", "neutral-cool", "neutral", "neutral-warm", "warm", "olive-cool", "olive-neutral", "olive-warm"]),
      value: z.enum(["light", "light-medium", "medium", "medium-deep", "deep"]),
      chroma: z.enum(["soft", "soft-medium", "medium", "medium-clear", "clear"]),
      contrast: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
    }),
    is_olive: z.boolean(),
    undertone_explained: z.string().describe("2-3 sentences, plain language, referencing the measurements"),
    why_other_apps_may_differ: z.string().describe("1-2 sentences on what typically misleads apps for this coloring"),
    drape_results: z.object({
      best: z.array(z.string()).describe("Drape letters that flattered most"),
      worst: z.array(z.string()).describe("Drape letters that flattered least"),
      observations: z.string().describe("What the drapes did to the face, like a professional analyst would describe"),
    }),
    palette: z.object({
      neutrals: z.array(Swatch),
      core: z.array(Swatch),
      accents: z.array(Swatch),
      avoid: z.array(Swatch),
    }),
    metals: z.string(),
    makeup_hints: z.string(),
    tan_mode: z.string().describe("How the best colors shift when tanned vs paler"),
  }),
  body: z.object({
    kibbe_type: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    runner_up: z.string(),
    reasoning: z.string().describe("Vertical line, bone structure, flesh, yin/yang balance, in plain language"),
    lines_that_work: z.array(z.string()),
    lines_to_avoid: z.array(z.string()),
    fabrics: z.array(z.string()),
  }),
  essence: z.object({
    primary: z.string().describe("Kitchener essence, e.g. 'Romantic'"),
    secondary: z.string().describe("Blend essence, or 'none'"),
    confidence: z.enum(["high", "medium", "low"]),
    reasoning: z.string(),
    keywords: z.array(z.string()),
    details_that_express_it: z.array(z.string()),
  }),
  summary: z.object({
    headline: z.string().describe("A short, flattering one-line style identity, e.g. 'Warm, earthy and quietly sensual'"),
    style_formula: z.string().describe("2-3 sentences combining color, body and essence into one direction"),
    signature_pieces: z.array(z.string()),
    prints_and_textures: z.array(z.string()),
    brands: z.array(
      z.object({
        name: z.string(),
        price: z.enum(["$", "$$", "$$$", "$$$$"]),
        why: z.string(),
      })
    ),
  }),
  photo_feedback: z.string().describe("If more or better photos would raise confidence, say exactly which. Empty if fine."),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ---------- Outfit suggestions ----------
export const LooksSchema = z.object({
  looks: z.array(
    z.object({
      id: z.string().describe("short kebab-case id"),
      title: z.string(),
      occasion: z.string(),
      vibe: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          category: z.enum(["top", "bottom", "dress", "outerwear", "shoes", "bag", "jewelry", "accessory"]),
          color_name: z.string(),
          color_hex: z.string(),
          is_basic: z.boolean().describe("True for a wardrobe staple that works across many looks"),
          thrift_search_terms: z.string().describe("What to type into a resale app or look for on the rack"),
        })
      ),
      why_it_works: z.object({
        color: z.string(),
        body: z.string(),
        essence: z.string(),
      }),
      trend_status: z.enum(["classic", "trending", "mixed"]),
      trend_note: z.string(),
    })
  ),
  learned_preferences: z.string().describe("1-2 sentences on what you have learned from the user's likes/dislikes so far"),
});
export type Looks = z.infer<typeof LooksSchema>;
export type Look = Looks["looks"][number];

// ---------- Outfit / inspo check ----------
export const CritiqueSchema = z.object({
  what_i_see: z.string(),
  overall: z.enum(["great_match", "works_with_tweaks", "fun_but_fighting_your_features"]),
  color: z.object({ verdict: z.string(), detail: z.string() }),
  body: z.object({ verdict: z.string(), detail: z.string() }),
  essence: z.object({ verdict: z.string(), detail: z.string() }),
  trend_check: z.object({
    status: z.enum(["classic", "trending", "micro-trend", "mixed"]),
    explanation: z.string().describe("Educational, never shaming. Why it might be everywhere right now, and whether that matters for this person"),
  }),
  make_it_yours: z.array(z.string()).describe("Specific tweaks that keep the spirit of the look but suit this person better"),
  missing_items: z.array(
    z.object({
      name: z.string(),
      color_hex: z.string(),
      is_basic: z.boolean(),
      thrift_search_terms: z.string(),
    })
  ),
});
export type Critique = z.infer<typeof CritiqueSchema>;

// ---------- Pinterest inspiration read ----------
export const InspoSchema = z.object({
  patterns: z.array(z.string()).describe("Recurring themes across the pins"),
  what_this_says: z.string().describe("What the user is drawn to and why, in a warm, insightful voice"),
  alignment: z.string().describe("How these pins line up with their color, body and essence"),
  trend_vs_classic: z.string().describe("Which saved elements are current trends vs long-lasting classics"),
  pins: z.array(
    z.object({
      index: z.number(),
      verdict: z.enum(["made_for_you", "adapt_it", "admire_from_afar"]),
      note: z.string(),
    })
  ),
});
export type Inspo = z.infer<typeof InspoSchema>;
