import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { cloudStorageEnabled, getCloudMedia } from "@/lib/cloudStorage";

export const runtime = "nodejs";

const types: Record<string, string> = {
  jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif",
  mp4: "video/mp4", webm: "video/webm",
};

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!/^[a-f0-9]{64}\.(jpg|png|webp|avif|gif|mp4|webm)$/.test(name)) return new Response(null, { status: 404 });
  try {
    if (cloudStorageEnabled()) return await getCloudMedia(name, request);
    const file = path.join(process.cwd(), ".okno-content", "media", name);
    const info = await stat(file);
    const type = types[name.split(".").at(-1)!];
    const range = request.headers.get("range");
    const match = range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range && !match) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    const start = match ? Number(match[1]) : 0;
    const end = match && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    if (start >= info.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream<Uint8Array>;
    return new Response(stream, { status: match ? 206 : 200, headers: {
      "Content-Type": type, "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(match ? { "Content-Range": `bytes ${start}-${end}/${info.size}` } : {}),
    } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
