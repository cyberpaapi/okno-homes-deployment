import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { isStudioModel } from "@/data/configurator/studio/catalogue";
import assets from "@/data/configurator/studio/customerAssets.json";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isStudioModel(slug)) return new Response(null, { status: 404 });
  const asset = assets[slug];
  const gzip = (request.headers.get("accept-encoding") || "").split(",").some(value => /^\s*gzip\b/.test(value) && !/;\s*q=0(?:\.0*)?\s*$/.test(value));
  const path = resolve("public/configurator/models", asset.fileName + (gzip ? ".gz" : ""));
  try {
    const info = await stat(path);
    const etag = `"${asset.sha256}${gzip ? "-gzip" : ""}"`;
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { "ETag": etag, "Vary": "Accept-Encoding", "Cache-Control": "public, max-age=0, must-revalidate" } });
    return new Response(Readable.toWeb(createReadStream(path)) as ReadableStream, { headers: {
      "Content-Type": "model/gltf-binary",
      "Content-Length": String(info.size),
      "X-Model-Bytes": String(asset.bytes),
      "Cache-Control": "public, max-age=0, must-revalidate",
      "ETag": etag,
      "Vary": "Accept-Encoding",
      "X-Content-Type-Options": "nosniff",
      ...(gzip ? { "Content-Encoding": "gzip" } : {}),
    } });
  } catch { return new Response("Model temporarily unavailable.", { status: 503 }); }
}
