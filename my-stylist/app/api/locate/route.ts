import { askStructured, imageBlocks, isDemo, jsonError } from "@/lib/claude";
import { demoLocate } from "@/lib/demo";
import { LOCATE_SYSTEM } from "@/lib/prompts";
import { PhotoLocateSchema } from "@/lib/schemas";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { photos } = (await req.json()) as { photos: string[] };
    if (!Array.isArray(photos) || photos.length === 0) return Response.json({ error: "Add at least one photo." }, { status: 400 });
    if (isDemo()) return Response.json({ demo: true, result: demoLocate(photos.length) });
    const result = await askStructured({
      system: LOCATE_SYSTEM,
      schema: PhotoLocateSchema,
      effort: "medium",
      content: [
        ...imageBlocks(photos.map((dataUrl, i) => ({ dataUrl, label: `Photo ${i}` }))),
        {
          type: "text",
          text: "Classify every photo and locate the regions. For 'missing', list any photo type needed for a full analysis: at least one clear face photo in daylight, and at least one full-length photo.",
        },
      ],
    });
    return Response.json({ demo: false, result });
  } catch (err) {
    return jsonError(err);
  }
}
