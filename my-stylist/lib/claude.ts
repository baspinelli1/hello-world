import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export function hasKey() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export const isDemo = () => process.env.DEMO_MODE === "1" || !hasKey();

type ImageInput = { dataUrl?: string; url?: string; label?: string };

/** Turn data URLs / remote URLs into Claude image blocks, each preceded by a label. */
export function imageBlocks(images: ImageInput[]): Anthropic.Beta.BetaContentBlockParam[] {
  const blocks: Anthropic.Beta.BetaContentBlockParam[] = [];
  images.forEach((img, i) => {
    blocks.push({ type: "text", text: img.label ?? `Photo ${i}` });
    if (img.dataUrl) {
      const m = img.dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
      if (!m) throw new Error("Unsupported image format");
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: m[1] as "image/jpeg", data: m[2] },
      });
    } else if (img.url) {
      blocks.push({ type: "image", source: { type: "url", url: img.url } });
    }
  });
  return blocks;
}

export class StylistError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

/** One structured call to Claude, returning parsed, schema-validated JSON. */
export async function askStructured<S extends z.ZodType>(opts: {
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  schema: S;
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<S>> {
  try {
    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(opts.schema) },
      system: opts.system,
      messages: [{ role: "user", content: opts.content }],
    });
    if (response.stop_reason === "refusal") {
      throw new StylistError("The stylist couldn't analyze these photos. Try different photos.", 422);
    }
    if (response.stop_reason === "max_tokens") {
      throw new StylistError("The analysis ran long and was cut off. Please try again.", 502);
    }
    if (!response.parsed_output) throw new StylistError("The stylist returned an unreadable answer. Please try again.", 502);
    return response.parsed_output as z.infer<S>;
  } catch (err) {
    if (err instanceof StylistError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new StylistError("The Claude API key is invalid.", 500);
    if (err instanceof Anthropic.RateLimitError) throw new StylistError("Too many requests right now. Please wait a minute and try again.", 429);
    if (err instanceof Anthropic.BadRequestError) throw new StylistError(`Request problem: ${err.message}`, 400);
    if (err instanceof Anthropic.APIError) throw new StylistError(`Claude API error (${err.status}). Please try again.`, 502);
    if (err instanceof Anthropic.APIConnectionError) throw new StylistError("Couldn't reach Claude. Check the connection and try again.", 503);
    throw err;
  }
}

/** Plain text call with web search, used for the current-trends brief. */
export async function askWithWebSearch(system: string, prompt: string): Promise<string> {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
    messages: [{ role: "user", content: prompt }],
  });
  return response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export function jsonError(err: unknown) {
  const status = err instanceof StylistError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Something went wrong";
  console.error("[my-stylist]", err);
  return Response.json({ error: message }, { status });
}
