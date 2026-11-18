// Reads a PUBLIC Pinterest board through its RSS feed, no Pinterest login needed.
export const maxDuration = 60;

function feedUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!/(^|\.)pinterest\.[a-z.]+$/.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `https://www.pinterest.com/${parts[0]}/${parts[1].replace(/\.rss$/, "")}.rss`;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();
  const feed = feedUrl(url ?? "");
  if (!feed) return Response.json({ error: "Paste a public Pinterest board link, like pinterest.com/yourname/boardname." }, { status: 400 });
  try {
    const res = await fetch(feed, { headers: { "User-Agent": "MyStylist/1.0" } });
    if (!res.ok) return Response.json({ error: "Couldn't read that board. Make sure it's public." }, { status: 404 });
    const xml = await res.text();
    const images = Array.from(xml.matchAll(/<img[^>]+src="([^"]+)"/g))
      .map((m) => m[1].replace(/\/\d+x\//, "/736x/"))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 20);
    if (!images.length) return Response.json({ error: "That board has no pins we could read." }, { status: 404 });
    return Response.json({ images });
  } catch {
    return Response.json({ error: "Couldn't reach Pinterest right now." }, { status: 502 });
  }
}
