import "server-only";

import { BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
import publicAssets from "../../config/public-assets.json";

export function cloudStorageEnabled() {
  return process.env.VERCEL === "1" || process.env.OKNO_CONTENT_BACKEND === "blob";
}

function requireCloudStorage() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    throw new Error("Connect the private OKNO Blob store before using the deployed content studio.");
  }
}

export async function readCloudContent() {
  requireCloudStorage();
  const result = await get("cms/content.json", { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return { value: JSON.parse(await new Response(result.stream).text()) as unknown, etag: result.blob.etag };
}

export async function writeCloudContent(value: unknown, etag?: string) {
  requireCloudStorage();
  try {
    await put("cms/content.json", JSON.stringify(value), {
      access: "private", contentType: "application/json", addRandomSuffix: false,
      ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || (error instanceof Error && /already exists/i.test(error.message))) {
      throw new Error("Content changed in another editor. Reload before saving or publishing.");
    }
    throw error;
  }
}

export async function storeCloudMedia(name: string, bytes: Buffer, contentType: string) {
  requireCloudStorage();
  try {
    await put(`media/${name}`, bytes, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: false });
  } catch (error) {
    // A content hash already present represents the exact same bytes.
    if (!(error instanceof Error) || !/already exists/i.test(error.message)) throw error;
  }
  return `/api/site-media/${name}`;
}

export async function cloudMediaExists(name: string) {
  requireCloudStorage();
  try { await head(`media/${name}`); return true; }
  catch (error) {
    if (error instanceof Error && /not found|does not exist/i.test(error.message)) return false;
    throw error;
  }
}

export function publicAssetExists(value: string) {
  return Object.hasOwn(publicAssets, value);
}

export async function getCloudMedia(name: string, request: Request) {
  requireCloudStorage();
  const info = await head(`media/${name}`);
  const range = request.headers.get("range");
  const match = range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range && (!match || Number(match[1]) >= info.size || (match[2] && Number(match[1]) > Number(match[2])))) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
  }
  const result = await get(`media/${name}`, { access: "private", ...(range ? { headers: { Range: range } } : {}) });
  if (!result || result.statusCode !== 200) return new Response(null, { status: 404 });
  const headers = new Headers({
    "Content-Type": info.contentType, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  for (const key of ["content-length", "content-range"]) {
    const value = result.headers.get(key);
    if (value) headers.set(key, value);
  }
  return new Response(result.stream, { status: headers.has("content-range") ? 206 : 200, headers });
}
