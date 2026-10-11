import "server-only";

import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { get } from "@vercel/blob";
import sharp from "sharp";
import { storeCloudMedia } from "./cloudStorage";
import { prepareVideo } from "./mediaPreparation";

export const uploadFormats = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"],
  ["image/avif", "avif"], ["image/gif", "gif"], ["video/mp4", "mp4"], ["video/webm", "webm"],
]);
export const cloudUploadLimit = 100 * 1024 * 1024;

export function validUploadPath(value: unknown): value is string {
  return typeof value === "string" && /^uploads\/[a-f0-9-]{36}\.(jpg|png|webp|avif|gif|mp4|webm)$/.test(value);
}

export async function finishCloudUpload(request: Request) {
  const body = await request.json();
  if (!validUploadPath(body?.pathname)) return Response.json({ error: "Invalid uploaded media path." }, { status: 400 });
  const result = await get(body.pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return Response.json({ error: "The original upload was not found. Upload it again." }, { status: 404 });
  if (!result.blob.size || result.blob.size > cloudUploadLimit) {
    await result.stream.cancel();
    return Response.json({ error: "Media must be between 1 byte and 100 MB." }, { status: 413 });
  }
  const extension = uploadFormats.get(result.blob.contentType);
  if (!extension || !body.pathname.endsWith(`.${extension}`)) {
    await result.stream.cancel();
    return Response.json({ error: "Media data does not match its declared format." }, { status: 415 });
  }
  const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
  if (extension === "mp4" || extension === "webm") {
    await mkdir(path.join(tmpdir(), "okno-media"), { recursive: true });
    const prepared = await prepareVideo(bytes, extension, body.profile === "signature-orbit", { signal: request.signal });
    return Response.json({ ...prepared, prepared: true }, { headers: { "Cache-Control": "no-store" } });
  }
  const metadata = await sharp(bytes, { failOn: "error" }).metadata();
  const actual = metadata.format === "jpeg" ? "jpg" : metadata.format;
  if (actual !== extension || !metadata.width || !metadata.height || metadata.width > 12000 || metadata.height > 12000) {
    return Response.json({ error: "Image data does not match its format or has invalid dimensions." }, { status: 415 });
  }
  const name = `${createHash("sha256").update(bytes).digest("hex")}.${extension}`;
  const url = await storeCloudMedia(name, bytes, result.blob.contentType);
  return Response.json({ url, width: metadata.width, height: metadata.height,
    warning: metadata.width < 1200 ? "This image may look soft in wide layouts. Preview before publishing." : undefined,
  }, { headers: { "Cache-Control": "no-store" } });
}
