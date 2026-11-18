import { askStructured, isDemo, jsonError } from "@/lib/claude";
import { demoLooks } from "@/lib/demo";
import { LOOKS_SYSTEM } from "@/lib/prompts";
import { LooksSchema } from "@/lib/schemas";

export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const { profile, liked, disliked, request, trends, count } = await req.json();
    if (isDemo()) return Response.json({ demo: true, result: demoLooks });
    const result = await askStructured({
      system: LOOKS_SYSTEM,
      schema: LooksSchema,
      effort: "medium",
      content: [{
        type: "text",
        text: [
          `Client profile:\n${JSON.stringify(profile)}`,
          `Current trends brief:\n${trends || "unavailable"}`,
          `Looks they LIKED:\n${JSON.stringify(liked ?? [])}`,
          `Looks they DISLIKED:\n${JSON.stringify(disliked ?? [])}`,
          request ? `What they asked for: "${request}"` : "No specific request; give a varied set.",
          `Suggest ${count ?? 4} new looks that are different from the ones above.`,
        ].join("\n\n"),
      }],
    });
    return Response.json({ demo: false, result });
  } catch (err) {
    return jsonError(err);
  }
}
