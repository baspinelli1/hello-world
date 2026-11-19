import { isDemo } from "@/lib/claude";

export const dynamic = "force-dynamic";

/** Tells the app whether AI analysis is available (a Claude API key is set). */
export function GET() {
  return Response.json({ ai: !isDemo() });
}
