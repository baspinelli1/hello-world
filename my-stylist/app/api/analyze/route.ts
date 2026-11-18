import { askStructured, imageBlocks, isDemo, jsonError } from "@/lib/claude";
import { DRAPES } from "@/lib/color";
import { demoProfile } from "@/lib/demo";
import { ANALYZE_SYSTEM } from "@/lib/prompts";
import { ProfileSchema } from "@/lib/schemas";

export const maxDuration = 300;

type Body = {
  height: string;
  photos: { dataUrl: string; label: string }[];
  drapeGrid: string | null;
  measurements: unknown;
  note?: string;
  previous?: unknown;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (isDemo()) return Response.json({ demo: true, result: demoProfile });
    const drapeKey = DRAPES.map((d) => `${d.id}: ${d.name} ${d.hex} (${d.tests})`).join("\n");
    const content = [
      ...imageBlocks(body.photos),
      ...(body.drapeGrid ? imageBlocks([{ dataUrl: body.drapeGrid, label: "VIRTUAL DRAPE GRID (calibrated face, drapes A-P left to right, top to bottom)" }]) : []),
      {
        type: "text" as const,
        text: [
          `Height: ${body.height || "not given"}`,
          `Calibrated color measurements (computed by code):\n${JSON.stringify(body.measurements, null, 1)}`,
          body.drapeGrid ? `Drape key:\n${drapeKey}` : "No drape grid available; rely on measurements and photos and lower confidence accordingly.",
          body.note ? `The client says the previous result didn't feel right: "${body.note}". Previous result: ${JSON.stringify(body.previous)}. Re-examine the evidence with this in mind. Change the answer only if the evidence supports it, and explain.` : "",
          "Produce the full profile.",
        ].filter(Boolean).join("\n\n"),
      },
    ];
    const result = await askStructured({ system: ANALYZE_SYSTEM, schema: ProfileSchema, effort: "high", content });
    return Response.json({ demo: false, result });
  } catch (err) {
    return jsonError(err);
  }
}
