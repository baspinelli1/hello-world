import { askWithWebSearch, isDemo, jsonError } from "@/lib/claude";
import { demoTrends } from "@/lib/demo";
import { STYLIST_VOICE } from "@/lib/prompts";

export const maxDuration = 60;

export async function GET() {
  try {
    if (isDemo()) return Response.json({ demo: true, result: demoTrends });
    const today = new Date().toISOString().slice(0, 10);
    const text = await askWithWebSearch(
      STYLIST_VOICE,
      `Today is ${today}. Search for the current season's womenswear and menswear fashion trends (colors, silhouettes, fabrics, micro-trends from runways, retailers and social media). Write a compact brief (under 250 words) listing: trending colors, trending silhouettes and pieces, fading trends, and perennial classics that are currently prominent. No preamble.`
    );
    return Response.json({ demo: false, result: text });
  } catch (err) {
    return jsonError(err);
  }
}
