import { askStructured, imageBlocks, isDemo, jsonError } from "@/lib/claude";
import { demoInspo } from "@/lib/demo";
import { INSPO_SYSTEM } from "@/lib/prompts";
import { InspoSchema } from "@/lib/schemas";

export const maxDuration = 240;

export async function POST(req: Request) {
  try {
    const { profile, images, trends } = (await req.json()) as { profile: unknown; images: { url?: string; dataUrl?: string }[]; trends?: string };
    if (!images?.length) return Response.json({ error: "No pins to read." }, { status: 400 });
    if (isDemo()) return Response.json({ demo: true, result: { ...demoInspo, pins: images.map((_, index) => ({ index, verdict: "adapt_it", note: "Sample mode: connect a Claude API key for real pin-by-pin notes." })) } });
    const result = await askStructured({
      system: INSPO_SYSTEM,
      schema: InspoSchema,
      effort: "medium",
      content: [
        ...imageBlocks(images.slice(0, 20).map((img, i) => ({ ...img, label: `Pin ${i}` }))),
        { type: "text", text: `Client profile:\n${JSON.stringify(profile)}\n\nCurrent trends brief:\n${trends || "unavailable"}\n\nRead these saves.` },
      ],
    });
    return Response.json({ demo: false, result });
  } catch (err) {
    return jsonError(err);
  }
}
