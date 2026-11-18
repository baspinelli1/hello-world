// Sample responses used when no Claude API key is configured, so the app can be
// previewed end to end. Every demo screen is labeled as a sample in the UI.
import type { Critique, Inspo, Looks, PhotoLocate, Profile } from "./schemas";

export function demoLocate(count: number): PhotoLocate {
  return {
    photos: Array.from({ length: count }, (_, index) => ({
      index,
      kind: index === 0 ? "face_closeup" : "upper_body",
      usable_for: ["color", "body", "essence"],
      lighting: "daylight_good",
      filter_or_edit_suspected: false,
      makeup_heavy: false,
      notes: "Sample mode: regions are estimated, not detected.",
      face: { x: 0.3, y: 0.18, w: 0.4, h: 0.45 },
      forehead: { x: 0.42, y: 0.22, w: 0.16, h: 0.06 },
      left_cheek: { x: 0.36, y: 0.4, w: 0.08, h: 0.08 },
      right_cheek: { x: 0.56, y: 0.4, w: 0.08, h: 0.08 },
      jaw: { x: 0.44, y: 0.55, w: 0.12, h: 0.04 },
      neck: { x: 0.45, y: 0.66, w: 0.1, h: 0.06 },
      lips: { x: 0.46, y: 0.52, w: 0.08, h: 0.03 },
      hair: { x: 0.33, y: 0.14, w: 0.08, h: 0.06 },
      iris: null,
      white_paper: null,
      inner_wrist: null,
    })),
    missing: [],
  };
}

export const demoProfile: Profile = {
  color: {
    season: "Soft Autumn",
    confidence: "medium",
    runner_up: "Soft Summer",
    dimensions: { hue: "olive-neutral", value: "medium", chroma: "soft", contrast: "medium-low" },
    is_olive: true,
    undertone_explained:
      "Your skin reads low in red and moderately yellow with muted chroma, the signature of an olive complexion. Underneath, it leans neutral rather than golden, which is why soft, slightly warm colors harmonize best.",
    why_other_apps_may_differ:
      "Olive skin looks yellow to a camera, so most apps call it warm and hand you bright oranges. Those can make olive skin look sallow; muted, earthy versions suit you far better.",
    drape_results: {
      best: ["H", "M", "L", "J"],
      worst: ["C", "A", "I"],
      observations:
        "Sage and olive evened your skin and warmed your eyes. Icy blue and optic white made the skin around the mouth and under the eyes look gray, a classic sign the color is too cool and too bright.",
    },
    palette: {
      neutrals: [
        { hex: "#E9DCC4", name: "oat" }, { hex: "#B49A7A", name: "mushroom" }, { hex: "#5C4A3B", name: "cocoa" },
        { hex: "#6F6A5F", name: "warm charcoal" }, { hex: "#3E3B33", name: "soft espresso" },
      ],
      core: [
        { hex: "#8A9A5B", name: "moss" }, { hex: "#9DAF8B", name: "sage" }, { hex: "#B5654A", name: "terracotta" },
        { hex: "#C49A6C", name: "camel" }, { hex: "#5F7E7A", name: "muted teal" }, { hex: "#A0645E", name: "rosewood" },
        { hex: "#7B6A8A", name: "dusty plum" }, { hex: "#C8A85A", name: "soft mustard" },
      ],
      accents: [
        { hex: "#D08C60", name: "apricot" }, { hex: "#4F6D5A", name: "forest" }, { hex: "#B97B8E", name: "mauve rose" },
        { hex: "#7E8DA0", name: "slate blue" },
      ],
      avoid: [
        { hex: "#7FB2E5", name: "icy blue" }, { hex: "#FF00A8", name: "hot pink" }, { hex: "#FFFFFF", name: "optic white" },
        { hex: "#000000", name: "jet black near the face" },
      ],
    },
    metals: "Brushed gold, bronze and rose gold. Antiqued finishes over shiny chrome.",
    makeup_hints: "Rosy-brown and terracotta lips, soft brown liner, peach-bronze blush.",
    tan_mode:
      "When you're tanned, you can go a step deeper and a touch warmer (rust, olive, deep camel). When paler, slide toward the Soft Summer side: mauve, slate blue and dusty rose.",
  },
  body: {
    kibbe_type: "Soft Natural",
    confidence: "medium",
    runner_up: "Flamboyant Natural",
    reasoning:
      "Your vertical line reads moderate, your frame has slight width and bluntness through the shoulders (yang), softened by curved flesh (yin). Relaxed lines with a defined waist honor both.",
    lines_that_work: ["Relaxed, unstructured shapes with a soft waist", "Wrap tops and draped necklines", "Straight or slightly flared trousers with movement"],
    lines_to_avoid: ["Stiff, boxy tailoring", "Very sharp, geometric cuts", "Severe, tight-fitting bodycon from neck to knee"],
    fabrics: ["Washed silk", "Soft knits", "Suede and brushed cotton", "Linen blends"],
  },
  essence: {
    primary: "Natural",
    secondary: "Romantic",
    confidence: "medium",
    reasoning: "Open, approachable features and an easy warmth read Natural; softness around the eyes and lips adds a Romantic layer.",
    keywords: ["effortless", "warm", "sensual", "earthy"],
    details_that_express_it: ["Natural textures", "Soft draping", "Organic jewelry shapes", "Touchable fabrics"],
  },
  summary: {
    headline: "Warm, earthy and quietly sensual",
    style_formula:
      "Muted earth tones in soft, touchable fabrics, cut in relaxed shapes that still find your waist. Think golden-hour linen, not crisp white poplin.",
    signature_pieces: ["Camel wrap coat", "Moss silk slip skirt", "Chocolate suede boots", "Oat cable knit"],
    prints_and_textures: ["Watercolor florals", "Soft paisley", "Suede", "Slubby linen"],
    brands: [
      { name: "Madewell", price: "$$", why: "Relaxed denim and soft knits in earthy shades." },
      { name: "Sézane", price: "$$$", why: "Romantic details in warm, muted palettes." },
      { name: "Eileen Fisher", price: "$$$", why: "Soft, draped silhouettes, widely available secondhand." },
      { name: "Free People", price: "$$", why: "Natural-Romantic texture and movement." },
      { name: "Uniqlo", price: "$", why: "Affordable basics in camel, olive and oat." },
      { name: "J.Crew", price: "$$", why: "Classic knits that thrift well in muted colors." },
    ],
  },
  photo_feedback: "",
};

export const demoLooks: Looks = {
  looks: [
    {
      id: "golden-hour-weekend",
      title: "Golden-hour weekend",
      occasion: "Brunch, market, casual date",
      vibe: "Relaxed, warm and touchable",
      items: [
        { name: "Oat cable-knit sweater", category: "top", color_name: "oat", color_hex: "#E9DCC4", is_basic: true, thrift_search_terms: "cream wool cable knit sweater" },
        { name: "Moss silk slip skirt", category: "bottom", color_name: "moss", color_hex: "#8A9A5B", is_basic: false, thrift_search_terms: "olive green satin midi skirt" },
        { name: "Chocolate suede ankle boots", category: "shoes", color_name: "cocoa", color_hex: "#5C4A3B", is_basic: true, thrift_search_terms: "brown suede ankle boots" },
        { name: "Hammered gold hoops", category: "jewelry", color_name: "brushed gold", color_hex: "#C8A85A", is_basic: true, thrift_search_terms: "brushed gold hoop earrings" },
      ],
      why_it_works: {
        color: "Oat and moss are soft, slightly warm and muted, so they harmonize with olive skin instead of competing with it.",
        body: "The slip skirt moves with your curves while the chunky knit keeps it relaxed: Soft Natural balance.",
        essence: "Natural texture with a Romantic sheen.",
      },
      trend_status: "classic",
      trend_note: "Knit-and-slip-skirt pairings come back every few years, and earthy neutrals never really leave.",
    },
  ],
  learned_preferences: "Sample mode: like or dislike looks to teach the stylist your taste.",
};

export const demoCritique: Critique = {
  what_i_see: "A pale icy-blue oversized blazer over a white tee with straight jeans.",
  overall: "works_with_tweaks",
  color: {
    verdict: "Icy blue is fighting your coloring",
    detail: "It's lighter, cooler and brighter than you, so it can cast a gray tone on olive skin near the face. Slate blue or muted teal keep the cool-blue mood and warm your face instead.",
  },
  body: {
    verdict: "Oversized is close, but too boxy",
    detail: "A relaxed blazer is great for Soft Natural; choose a softer, unstructured one and push the sleeves up or add a belt to find the waist.",
  },
  essence: {
    verdict: "Clean, but missing your warmth",
    detail: "Add one natural texture (suede loafers or a woven bag) to bring in your Natural side.",
  },
  trend_check: {
    status: "trending",
    explanation:
      "Icy blue is everywhere for winter 2026, so it's natural that you're drawn to it. Seeing a color constantly makes it feel right. That's how trend cycles and fast fashion work, and following them is completely fine. If you want a blue you'll wear for years, slate blue gives you the same calm, cool feeling and suits your coloring all year.",
  },
  make_it_yours: ["Swap icy blue for slate blue or muted teal", "Trade the optic-white tee for oat or ivory", "Belt the blazer or choose an unstructured cut"],
  missing_items: [
    { name: "Unstructured slate-blue blazer", color_hex: "#7E8DA0", is_basic: false, thrift_search_terms: "relaxed blue gray linen blazer" },
    { name: "Ivory crew-neck tee", color_hex: "#F2E8D0", is_basic: true, thrift_search_terms: "cream cotton t-shirt" },
  ],
};

export const demoInspo: Inspo = {
  patterns: ["Earthy neutrals", "Slip skirts and silky textures", "Relaxed tailoring", "Gold jewelry"],
  what_this_says: "You're drawn to ease and softness with a little glow: clothes that look lived-in and touchable but still intentional.",
  alignment: "This is beautifully aligned with your Soft Autumn, Soft Natural and Natural-Romantic profile. Your instincts are good.",
  trend_vs_classic: "Slip skirts and butter-yellow pieces are current trends; camel coats, knitwear and gold hoops are long-lasting classics.",
  pins: [],
};

export const demoTrends =
  "Sample trends brief: icy and powder blues, butter yellow, chocolate brown, suede, slouchy tailoring, slip skirts, and bold red accents.";
