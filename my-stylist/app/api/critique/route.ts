import { askStructured, imageBlocks, isDemo, jsonError } from "@/lib/claude";
import { demoCritique } from "@/lib/demo";
import { CRITIQUE_SYSTEM } from "@/lib/prompts";
import { CritiqueSchema } from "@/lib/schemas";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { profile, image, imageUrl, context, trends } = await req.json();
    if (isDemo()) return Response.json({ demo: true, result: demoCritique });
    const result = await askStructured({
      system: CRITIQUE_SYSTEM,
      schema: CritiqueSchema,
      effort: "medium",
      content: [
        ...imageBlocks([{ dataUrl: image, url: imageUrl, label: "The outfit" }]),
        {
          type: "text",
          text: [
            `Client profile:\n${JSON.stringify(profile)}`,
            `Current trends brief:\n${trends || "unavailable"}`,
            context ? `The client adds: "${context}"` : "",
            "Evaluate this outfit for the client.",
          ].filter(Boolean).join("\n\n"),
        },
      ],
    });
    return Response.json({ demo: false, result });
  } catch (err) {
    return jsonError(err);
  }
}
