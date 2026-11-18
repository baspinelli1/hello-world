// Content for the Learn section. Plain data so pages stay simple.

export type Swatch = { hex: string; name: string };

export type SeasonEntry = {
  slug: string;
  name: string;
  family: "Spring" | "Summer" | "Autumn" | "Winter";
  aliases: string[];
  tagline: string;
  about: string;
  dims: { hue: string; value: string; chroma: string; contrast: string };
  palette: Swatch[];
  avoid: Swatch[];
  tips: string[];
  neighbours: string[]; // slugs
};

export type TypeEntry = {
  slug: string;
  name: string;
  aliases: string[];
  tagline: string;
  about: string;
  keywords: string[];
  wear: string[];
  skip: string[];
  neighbours: string[];
};

export const SEASONS: SeasonEntry[] = [
  {
    slug: "light-spring", name: "Light Spring", family: "Spring", aliases: ["light spring"],
    tagline: "Light, warm and fresh",
    about: "Light Springs have delicate, light coloring with a warm-to-neutral glow. Colors need to be light and clear, like spring blossoms; heavy or dark shades overpower them.",
    dims: { hue: "neutral-warm", value: "light", chroma: "medium-clear", contrast: "low" },
    palette: [
      { hex: "#FFB59E", name: "peach" }, { hex: "#F88379", name: "light coral" }, { hex: "#F7A1B5", name: "warm pink" }, { hex: "#7FD8D0", name: "aqua" },
      { hex: "#F6E3A1", name: "buttercream" }, { hex: "#C9A27A", name: "light camel" }, { hex: "#9AA8E8", name: "periwinkle" }, { hex: "#FFF6E5", name: "warm white" },
    ],
    avoid: [{ hex: "#111111", name: "black" }, { hex: "#5E1A2E", name: "burgundy" }, { hex: "#7E7A70", name: "dusty taupe" }],
    tips: ["Swap black for soft navy or warm gray", "Keep outfits low in contrast: light with light", "Shiny gold and light jewelry over heavy metal"],
    neighbours: ["light-summer", "true-spring"],
  },
  {
    slug: "true-spring", name: "True Spring", family: "Spring", aliases: ["true spring", "warm spring"],
    tagline: "Warm, clear and sunny",
    about: "True (or Warm) Springs are the warmest of the Springs. They glow in golden, clear colors with plenty of life, and look flat in cool, gray or icy shades.",
    dims: { hue: "warm", value: "light-medium", chroma: "clear", contrast: "medium" },
    palette: [
      { hex: "#FF7F50", name: "coral" }, { hex: "#E8483B", name: "tomato red" }, { hex: "#F5C242", name: "golden yellow" }, { hex: "#4CBB17", name: "grass green" },
      { hex: "#30C5C5", name: "turquoise" }, { hex: "#C19A6B", name: "camel" }, { hex: "#FFF1D6", name: "cream" }, { hex: "#3A75C4", name: "warm blue" },
    ],
    avoid: [{ hex: "#111111", name: "black" }, { hex: "#8E9AAF", name: "cool gray" }, { hex: "#D7E7F5", name: "icy blue" }],
    tips: ["Gold jewelry is your friend", "Cream and camel beat white and black", "Clear brights near the face, not dusty versions"],
    neighbours: ["light-spring", "bright-spring", "true-autumn"],
  },
  {
    slug: "bright-spring", name: "Bright Spring", family: "Spring", aliases: ["bright spring", "clear spring"],
    tagline: "Vivid, warm-leaning and high energy",
    about: "Bright (or Clear) Springs have striking, clear coloring with a slightly warm lean. They need saturation and contrast; muted, dusty colors make them look tired.",
    dims: { hue: "neutral-warm", value: "medium", chroma: "clear", contrast: "medium-high" },
    palette: [
      { hex: "#FF5A5F", name: "hot coral" }, { hex: "#E3242B", name: "poppy red" }, { hex: "#00B5AD", name: "bright turquoise" }, { hex: "#00A86B", name: "jade" },
      { hex: "#7F3FBF", name: "violet" }, { hex: "#0047AB", name: "cobalt" }, { hex: "#FFFBEA", name: "ivory" }, { hex: "#36454F", name: "charcoal" },
    ],
    avoid: [{ hex: "#B8A99A", name: "beige" }, { hex: "#9C8E7E", name: "mushroom" }, { hex: "#C9B2B6", name: "dusty rose" }],
    tips: ["Pair a bright with a crisp neutral for contrast", "Clear, shiny fabrics and metals", "If a color looks 'muddy', skip it"],
    neighbours: ["true-spring", "bright-winter"],
  },
  {
    slug: "light-summer", name: "Light Summer", family: "Summer", aliases: ["light summer"],
    tagline: "Light, cool and airy",
    about: "Light Summers have soft, light coloring with a cool-to-neutral undertone. Think watercolor pastels; heavy darks and hot warm colors feel harsh on them.",
    dims: { hue: "neutral-cool", value: "light", chroma: "soft-medium", contrast: "low" },
    palette: [
      { hex: "#A7C7E7", name: "powder blue" }, { hex: "#C8B6E2", name: "lavender" }, { hex: "#F4C2C2", name: "soft pink" }, { hex: "#AEE0C9", name: "mint" },
      { hex: "#B9BCC4", name: "light gray" }, { hex: "#8C9EDC", name: "periwinkle" }, { hex: "#D88CA0", name: "rose" }, { hex: "#F7F7F2", name: "soft white" },
    ],
    avoid: [{ hex: "#111111", name: "black" }, { hex: "#F28C28", name: "orange" }, { hex: "#4B3021", name: "dark brown" }],
    tips: ["Light gray or soft navy instead of black", "Silver, white gold and pearls", "Tonal, low-contrast outfits"],
    neighbours: ["light-spring", "true-summer"],
  },
  {
    slug: "true-summer", name: "True Summer", family: "Summer", aliases: ["true summer", "cool summer"],
    tagline: "Cool, gentle and elegant",
    about: "True (or Cool) Summers are the coolest of the Summers. Their coloring is cool and moderately soft, so blue-based colors with a hint of gray look effortless.",
    dims: { hue: "cool", value: "medium", chroma: "soft-medium", contrast: "medium-low" },
    palette: [
      { hex: "#D8738C", name: "rose pink" }, { hex: "#B3446C", name: "raspberry" }, { hex: "#6A7FA8", name: "slate blue" }, { hex: "#8EA4B8", name: "blue-gray" },
      { hex: "#2E3F5C", name: "soft navy" }, { hex: "#A895C9", name: "lavender" }, { hex: "#4B8B8F", name: "cool teal" }, { hex: "#F2F2EE", name: "soft white" },
    ],
    avoid: [{ hex: "#F28C28", name: "orange" }, { hex: "#E1AD01", name: "golden yellow" }, { hex: "#6B4423", name: "warm brown" }],
    tips: ["Navy and charcoal make your best 'black'", "Silver and pewter metals", "Rose and berry lipsticks"],
    neighbours: ["light-summer", "soft-summer", "true-winter"],
  },
  {
    slug: "soft-summer", name: "Soft Summer", family: "Summer", aliases: ["soft summer"],
    tagline: "Muted, cool-leaning and serene",
    about: "Soft Summers have blended, low-contrast coloring with a cool-to-neutral lean. Grayed, smoky colors look sophisticated on them; brights and pure black overpower.",
    dims: { hue: "neutral-cool", value: "medium", chroma: "soft", contrast: "low" },
    palette: [
      { hex: "#C49A9F", name: "dusty rose" }, { hex: "#A0798F", name: "mauve" }, { hex: "#9AA597", name: "sage gray" }, { hex: "#6E7F99", name: "slate blue" },
      { hex: "#5F8A89", name: "soft teal" }, { hex: "#A39787", name: "taupe" }, { hex: "#8A8D91", name: "pewter" }, { hex: "#6E4E6E", name: "plum" },
    ],
    avoid: [{ hex: "#FF00A8", name: "hot pink" }, { hex: "#111111", name: "black" }, { hex: "#FFFFFF", name: "optic white" }],
    tips: ["Blend, don't contrast: tonal outfits", "Matte and brushed metals over shiny", "Charcoal and soft navy over black"],
    neighbours: ["true-summer", "soft-autumn"],
  },
  {
    slug: "soft-autumn", name: "Soft Autumn", family: "Autumn", aliases: ["soft autumn"],
    tagline: "Muted, warm-leaning and earthy",
    about: "Soft Autumns have gentle, blended coloring with a warm-to-neutral lean, and many have olive skin. Earthy, softened colors make them glow; bright or icy shades look harsh.",
    dims: { hue: "neutral-warm", value: "medium", chroma: "soft", contrast: "medium-low" },
    palette: [
      { hex: "#9DAF8B", name: "sage" }, { hex: "#8A9A5B", name: "moss" }, { hex: "#B5654A", name: "terracotta" }, { hex: "#C49A6C", name: "camel" },
      { hex: "#5F7E7A", name: "muted teal" }, { hex: "#A0645E", name: "rosewood" }, { hex: "#E9DCC4", name: "oat" }, { hex: "#5C4A3B", name: "cocoa" },
    ],
    avoid: [{ hex: "#7FB2E5", name: "icy blue" }, { hex: "#FF00A8", name: "hot pink" }, { hex: "#111111", name: "black" }],
    tips: ["Oat and ivory instead of stark white", "Brushed gold and bronze", "Texture (suede, knits, linen) adds richness without brightness"],
    neighbours: ["soft-summer", "true-autumn"],
  },
  {
    slug: "true-autumn", name: "True Autumn", family: "Autumn", aliases: ["true autumn", "warm autumn"],
    tagline: "Warm, rich and golden",
    about: "True (or Warm) Autumns are the warmest of all seasons. Rich, spicy, golden colors bring them to life; cool and icy shades drain them.",
    dims: { hue: "warm", value: "medium", chroma: "medium", contrast: "medium" },
    palette: [
      { hex: "#B7410E", name: "rust" }, { hex: "#E07B39", name: "pumpkin" }, { hex: "#D4A017", name: "mustard" }, { hex: "#708238", name: "olive" },
      { hex: "#2E5E3E", name: "forest" }, { hex: "#1F6F6F", name: "teal" }, { hex: "#4E3324", name: "chocolate" }, { hex: "#C19A6B", name: "camel" },
    ],
    avoid: [{ hex: "#D7E7F5", name: "icy blue" }, { hex: "#FF00A8", name: "fuchsia" }, { hex: "#8E9AAF", name: "cool gray" }],
    tips: ["Chocolate and olive as your dark neutrals", "Gold, copper and bronze", "Warm prints like paisley and animal print"],
    neighbours: ["soft-autumn", "deep-autumn", "true-spring"],
  },
  {
    slug: "deep-autumn", name: "Deep Autumn", family: "Autumn", aliases: ["deep autumn", "dark autumn"],
    tagline: "Deep, warm-leaning and rich",
    about: "Deep (or Dark) Autumns have deep coloring with a warm-to-neutral lean. They wear depth beautifully; light pastels wash them out.",
    dims: { hue: "neutral-warm", value: "deep", chroma: "medium", contrast: "medium-high" },
    palette: [
      { hex: "#6D2E2A", name: "oxblood" }, { hex: "#4A5A23", name: "deep olive" }, { hex: "#3B2A20", name: "espresso" }, { hex: "#A0703A", name: "bronze" },
      { hex: "#0F5257", name: "deep teal" }, { hex: "#C1440E", name: "paprika" }, { hex: "#C9A227", name: "old gold" }, { hex: "#4B2942", name: "aubergine" },
    ],
    avoid: [{ hex: "#F4C2C2", name: "pastel pink" }, { hex: "#D3D3D3", name: "light gray" }, { hex: "#D7E7F5", name: "icy blue" }],
    tips: ["Espresso and deep olive work like black", "Antique gold and bronze", "Rich textures: velvet, leather, suede"],
    neighbours: ["true-autumn", "deep-winter"],
  },
  {
    slug: "deep-winter", name: "Deep Winter", family: "Winter", aliases: ["deep winter", "dark winter"],
    tagline: "Deep, cool-leaning and dramatic",
    about: "Deep (or Dark) Winters have deep coloring with a cool-to-neutral lean and strong contrast. Black, jewel tones and crisp white look striking; soft earth tones look muddy.",
    dims: { hue: "neutral-cool", value: "deep", chroma: "medium-clear", contrast: "high" },
    palette: [
      { hex: "#111111", name: "black" }, { hex: "#FAFAFA", name: "true white" }, { hex: "#7B1E3A", name: "burgundy" }, { hex: "#00704A", name: "emerald" },
      { hex: "#0F52BA", name: "sapphire" }, { hex: "#4B1E4F", name: "deep plum" }, { hex: "#B0102B", name: "crimson" }, { hex: "#36454F", name: "charcoal" },
    ],
    avoid: [{ hex: "#D8C3A5", name: "beige" }, { hex: "#F28C28", name: "orange" }, { hex: "#C9B2B6", name: "dusty rose" }],
    tips: ["Black near the face works for you", "Silver and white gold", "Keep contrast: dark with a crisp light"],
    neighbours: ["deep-autumn", "true-winter"],
  },
  {
    slug: "true-winter", name: "True Winter", family: "Winter", aliases: ["true winter", "cool winter"],
    tagline: "Cool, crisp and pure",
    about: "True (or Cool) Winters are the coolest of all seasons. Pure, icy and blue-based colors are made for them; golden and earthy colors look off.",
    dims: { hue: "cool", value: "medium-deep", chroma: "clear", contrast: "high" },
    palette: [
      { hex: "#C8102E", name: "blue-red" }, { hex: "#D0105C", name: "fuchsia" }, { hex: "#2A52BE", name: "royal blue" }, { hex: "#009B77", name: "emerald" },
      { hex: "#F3D1DC", name: "icy pink" }, { hex: "#111111", name: "black" }, { hex: "#FFFFFF", name: "pure white" }, { hex: "#7D8590", name: "cool gray" },
    ],
    avoid: [{ hex: "#F28C28", name: "orange" }, { hex: "#C19A6B", name: "camel" }, { hex: "#708238", name: "olive" }],
    tips: ["Black and white are your classics", "Silver and platinum", "Blue-red lipstick"],
    neighbours: ["true-summer", "deep-winter", "bright-winter"],
  },
  {
    slug: "bright-winter", name: "Bright Winter", family: "Winter", aliases: ["bright winter", "clear winter"],
    tagline: "Vivid, cool-leaning and electric",
    about: "Bright (or Clear) Winters have high-contrast, clear coloring with a cool-to-neutral lean. Saturated jewel brights look amazing; dusty or earthy shades dull them.",
    dims: { hue: "neutral-cool", value: "medium", chroma: "clear", contrast: "high" },
    palette: [
      { hex: "#FF1493", name: "hot pink" }, { hex: "#0066FF", name: "electric blue" }, { hex: "#00A36C", name: "bright emerald" }, { hex: "#FFF44F", name: "icy lemon" },
      { hex: "#D2042D", name: "true red" }, { hex: "#8F00FF", name: "violet" }, { hex: "#111111", name: "black" }, { hex: "#FFFFFF", name: "pure white" },
    ],
    avoid: [{ hex: "#9C8E7E", name: "mushroom" }, { hex: "#B7410E", name: "rust" }, { hex: "#C9B2B6", name: "dusty rose" }],
    tips: ["Color-block with confidence", "Shiny silver and statement jewelry", "Always one crisp, bright element near the face"],
    neighbours: ["true-winter", "bright-spring"],
  },
];

export const KIBBE: TypeEntry[] = [
  {
    slug: "dramatic", name: "Dramatic", aliases: ["dramatic", "d"],
    tagline: "Long, sharp and sleek",
    about: "Dramatics have a long vertical line with narrow, sharp bone structure: pure yang. Clothes look best as long, unbroken lines with sharp, geometric shapes.",
    keywords: ["long line", "sharp", "sleek", "striking"],
    wear: ["Long, unbroken columns", "Sharp shoulders and tailoring", "Bold, angular jewelry", "Stiff or smooth fabrics"],
    skip: ["Ruffles and fussy detail", "Cropped, cut-up lines", "Round, soft shapes"],
    neighbours: ["soft-dramatic", "dramatic-classic"],
  },
  {
    slug: "soft-dramatic", name: "Soft Dramatic", aliases: ["soft dramatic", "sd"],
    tagline: "Long and bold, with lush curves",
    about: "Soft Dramatics have a long vertical line and sharp bones (yang) combined with lush, rounded curves (yin). They need length and drama, softened by draping and a defined waist.",
    keywords: ["bold", "lush", "glamorous", "statuesque"],
    wear: ["Long lines with draping", "Defined waist", "Large-scale prints and jewelry", "Fluid, luxurious fabrics"],
    skip: ["Small, delicate details", "Boxy, shapeless cuts", "Stiff, sharp tailoring with no ease"],
    neighbours: ["dramatic", "theatrical-romantic"],
  },
  {
    slug: "flamboyant-natural", name: "Flamboyant Natural", aliases: ["flamboyant natural", "fn"],
    tagline: "Long, broad and relaxed",
    about: "Flamboyant Naturals have a long or moderate vertical line with blunt, broad bone structure, often in the shoulders. Relaxed, unstructured shapes with length look effortless.",
    keywords: ["relaxed", "bold", "unstructured", "easy"],
    wear: ["Oversized, unstructured layers", "Long, loose lines", "Open necklines", "Textured, natural fabrics"],
    skip: ["Tight, fitted silhouettes", "Small, fussy details", "Rigid tailoring"],
    neighbours: ["soft-natural", "dramatic"],
  },
  {
    slug: "soft-natural", name: "Soft Natural", aliases: ["soft natural", "sn"],
    tagline: "Relaxed lines with soft curves",
    about: "Soft Naturals have a moderate-to-short vertical line and slight width (yang) softened by curves (yin). Relaxed clothes that still find the waist bring both together.",
    keywords: ["relaxed", "soft", "approachable", "touchable"],
    wear: ["Relaxed shapes with a soft waist", "Wrap tops and draped necklines", "Soft knits and washed silk", "Trousers with movement"],
    skip: ["Stiff, boxy tailoring", "Sharp geometric cuts", "Very tight neck-to-knee fits"],
    neighbours: ["flamboyant-natural", "romantic"],
  },
  {
    slug: "dramatic-classic", name: "Dramatic Classic", aliases: ["dramatic classic", "dc"],
    tagline: "Balanced, polished and crisp",
    about: "Dramatic Classics are balanced and symmetrical, with a slight edge of sharpness. Tailored, sleek and refined clothes look naturally elegant.",
    keywords: ["polished", "refined", "crisp", "balanced"],
    wear: ["Tailored, symmetrical cuts", "Sleek, smooth fabrics", "Crisp, clean lines", "Refined, geometric jewelry"],
    skip: ["Oversized, slouchy shapes", "Fussy or frilly detail", "Overly soft, draped looks"],
    neighbours: ["soft-classic", "dramatic"],
  },
  {
    slug: "soft-classic", name: "Soft Classic", aliases: ["soft classic", "sc"],
    tagline: "Balanced, refined and gentle",
    about: "Soft Classics are balanced and symmetrical with a gentle softness. Tailoring that is softened with drape and a defined waist looks polished and graceful.",
    keywords: ["graceful", "elegant", "gentle", "polished"],
    wear: ["Soft tailoring", "Defined waist", "Gentle draping", "Fluid, refined fabrics"],
    skip: ["Harsh angles", "Oversized cuts", "Very busy or bold scale"],
    neighbours: ["dramatic-classic", "romantic"],
  },
  {
    slug: "flamboyant-gamine", name: "Flamboyant Gamine", aliases: ["flamboyant gamine", "fg"],
    tagline: "Petite, sharp and playful",
    about: "Flamboyant Gamines have a short vertical line with a mix of sharp and blunt features: compact yang. Broken lines, crisp contrast and a bit of attitude suit them.",
    keywords: ["spirited", "crisp", "playful", "bold"],
    wear: ["Cropped jackets and pants", "Broken lines and color-blocking", "Sharp, fitted shapes", "Graphic, playful details"],
    skip: ["Long, unbroken flowing lines", "Overly soft, romantic draping", "Shapeless oversize"],
    neighbours: ["soft-gamine", "dramatic"],
  },
  {
    slug: "soft-gamine", name: "Soft Gamine", aliases: ["soft gamine", "sg"],
    tagline: "Petite, curvy and lively",
    about: "Soft Gamines have a short vertical line with a mix of features leaning soft (yin), often with curves. Fitted, cropped clothes with playful detail and a defined waist look great.",
    keywords: ["lively", "cute", "fitted", "playful"],
    wear: ["Fitted, cropped pieces", "Defined waist", "Playful details and prints", "Contrast and broken lines"],
    skip: ["Long, flowing shapes", "Oversized layers", "Heavy, bulky fabrics"],
    neighbours: ["flamboyant-gamine", "romantic"],
  },
  {
    slug: "romantic", name: "Romantic", aliases: ["romantic", "r"],
    tagline: "Soft, rounded and lush",
    about: "Romantics have soft, rounded bones and curves: pure yin. Soft draping, a defined waist and lush fabrics honor that softness.",
    keywords: ["soft", "lush", "sensual", "delicate"],
    wear: ["Soft draping", "Defined waist", "Lush fabrics like silk and velvet", "Curved, ornate details"],
    skip: ["Sharp tailoring", "Boxy cuts", "Stiff, heavy fabrics"],
    neighbours: ["theatrical-romantic", "soft-classic"],
  },
  {
    slug: "theatrical-romantic", name: "Theatrical Romantic", aliases: ["theatrical romantic", "tr"],
    tagline: "Soft curves with a sharp edge",
    about: "Theatrical Romantics are mostly yin (curves, softness) with a touch of sharpness in the bone structure. Fitted, draped looks with a little glamour and sharp detail suit them.",
    keywords: ["glamorous", "alluring", "fitted", "delicate edge"],
    wear: ["Fitted, draped silhouettes", "Defined waist", "Sharp, glamorous details", "Luxurious fabrics"],
    skip: ["Relaxed, boxy shapes", "Heavy, casual fabrics", "Long, plain columns"],
    neighbours: ["romantic", "soft-dramatic"],
  },
];

export const ESSENCES: TypeEntry[] = [
  {
    slug: "dramatic", name: "Dramatic", aliases: ["dramatic"],
    tagline: "Bold, striking and sophisticated",
    about: "A Dramatic essence makes an impression the moment you walk in. Strong, clean lines, high contrast and statement pieces express it.",
    keywords: ["bold", "striking", "sophisticated", "commanding"],
    wear: ["Statement pieces", "High contrast", "Clean, strong lines", "Architectural jewelry"],
    skip: ["Cutesy details", "Washed-out, timid looks"],
    neighbours: ["classic", "romantic"],
  },
  {
    slug: "natural", name: "Natural", aliases: ["natural"],
    tagline: "Relaxed, warm and approachable",
    about: "A Natural essence feels easy, open and down-to-earth. Texture, comfort and natural materials express it best.",
    keywords: ["relaxed", "earthy", "warm", "effortless"],
    wear: ["Natural textures (linen, suede, knits)", "Easy layers", "Organic jewelry", "Lived-in pieces"],
    skip: ["Overly stiff or prim looks", "Fussy, fragile fabrics"],
    neighbours: ["romantic", "gamine"],
  },
  {
    slug: "classic", name: "Classic", aliases: ["classic"],
    tagline: "Refined, elegant and composed",
    about: "A Classic essence reads polished and timeless. Balance, quality and restraint express it.",
    keywords: ["refined", "elegant", "timeless", "composed"],
    wear: ["Tailored essentials", "Quality fabrics", "Understated jewelry", "Coordinated outfits"],
    skip: ["Chaotic mixes", "Overly trendy pieces"],
    neighbours: ["dramatic", "ingenue"],
  },
  {
    slug: "gamine", name: "Gamine", aliases: ["gamine"],
    tagline: "Playful, spirited and quick",
    about: "A Gamine essence is lively and a little mischievous. Crisp lines, fun details and unexpected mixes express it.",
    keywords: ["playful", "spirited", "youthful", "witty"],
    wear: ["Crisp, fitted pieces", "Fun prints and stripes", "Contrasting mixes", "Quirky accessories"],
    skip: ["Heavy, overly serious looks", "Long, fussy draping"],
    neighbours: ["ingenue", "natural"],
  },
  {
    slug: "ingenue", name: "Ingenue", aliases: ["ingenue", "ingénue"],
    tagline: "Sweet, fresh and gentle",
    about: "An Ingenue essence is sweet and open-hearted. Soft colors, delicate details and gentle shapes express it.",
    keywords: ["sweet", "fresh", "gentle", "delicate"],
    wear: ["Delicate details (bows, small florals)", "Soft colors", "Gentle shapes", "Dainty jewelry"],
    skip: ["Severe, harsh styling", "Very heavy fabrics"],
    neighbours: ["gamine", "ethereal"],
  },
  {
    slug: "ethereal", name: "Ethereal", aliases: ["ethereal", "angelic"],
    tagline: "Dreamy, serene and otherworldly",
    about: "An Ethereal essence feels calm, dreamy and a little otherworldly. Flowing, airy fabrics and soft light express it.",
    keywords: ["dreamy", "serene", "graceful", "otherworldly"],
    wear: ["Flowing, sheer fabrics", "Soft, luminous colors", "Delicate, fine jewelry", "Floaty layers"],
    skip: ["Hard, chunky pieces", "Loud, busy prints"],
    neighbours: ["ingenue", "romantic"],
  },
  {
    slug: "romantic", name: "Romantic", aliases: ["romantic"],
    tagline: "Sensual, lush and glamorous",
    about: "A Romantic essence is warm, sensual and inviting. Rich fabrics, curves and a touch of glamour express it.",
    keywords: ["sensual", "lush", "glamorous", "inviting"],
    wear: ["Rich fabrics (silk, velvet)", "Curved, draped shapes", "Lace and soft detail", "Glowing jewelry"],
    skip: ["Stark, severe minimalism", "Boxy utility pieces"],
    neighbours: ["dramatic", "natural"],
  },
];

export const SYSTEMS = {
  seasons: {
    title: "Color seasons",
    kicker: "Color",
    intro: "Seasonal color analysis groups people into 12 seasons by four things: hue (warm, cool or neutral), value (light to deep), chroma (soft to clear) and contrast. The right colors make skin look even and eyes bright; the wrong ones can make you look tired, gray or flushed.",
    note: "Olive skin isn't a season of its own. Olive people appear in many seasons, most often the Soft and Deep ones, and are often wrongly typed as warm.",
  },
  kibbe: {
    title: "Kibbe body types",
    kicker: "Body",
    intro: "David Kibbe's system describes your body's lines, not its size. It looks at your vertical line (height impression), bone structure (sharp, blunt or soft) and flesh (straight or curvy), and balances yin (soft, rounded) against yang (sharp, long). There are 10 types.",
    note: "Your Kibbe type doesn't change with weight. It's about your lines and bone structure, so it stays with you.",
  },
  essences: {
    title: "Style essences",
    kicker: "Essence",
    intro: "John Kitchener's style essences describe the impression you give off: your energy, face and presence. There are seven. Almost everyone is a blend of two or three, with one leading.",
    note: "Essence is about personality on the outside, not about rules. It helps you choose details (prints, jewelry, fabric) that feel like you.",
  },
} as const;

export type SystemId = keyof typeof SYSTEMS;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();

export function entries(system: SystemId): (SeasonEntry | TypeEntry)[] {
  return system === "seasons" ? SEASONS : system === "kibbe" ? KIBBE : ESSENCES;
}

/** Match a result name from the AI (e.g. "Warm Autumn", "Soft Natural (SN)") to a Learn page. */
export function findEntry(system: SystemId, name?: string | null) {
  if (!name) return null;
  const n = norm(name);
  const list = entries(system);
  const exact = list.find((e) => e.aliases.some((a) => norm(a) === n));
  if (exact) return exact;
  // Otherwise the alias that appears first in the name wins, longest on ties:
  // "Soft Dramatic (SD)" -> Soft Dramatic; "Soft Autumn, leaning Soft Summer" -> Soft Autumn.
  let best: (typeof list)[number] | null = null, bestPos = Infinity, bestLen = 0;
  for (const e of list) for (const a of e.aliases) {
    const na = norm(a);
    const pos = na.length > 2 ? n.indexOf(na) : -1;
    if (pos >= 0 && (pos < bestPos || (pos === bestPos && na.length > bestLen))) { best = e; bestPos = pos; bestLen = na.length; }
  }
  return best;
}

export const learnHref = (system: SystemId, slug: string) => `/learn/${system}/${slug}`;
