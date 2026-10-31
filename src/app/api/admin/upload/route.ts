import { validateGlb } from "@/lib/validateGlb";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { isAdminAuthorized, adminTokenConfigured } from "@/lib/siteContentStore";
import { enqueueVideo } from "@/lib/mediaPreparationJobs";
import { persistOriginalVideo } from "@/lib/mediaPreparation";
import { cloudStorageEnabled } from "@/lib/cloudStorage";
import { finishCloudUpload } from "@/lib/cloudUpload";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: "Admin key is not configured." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json({ mode: cloudStorageEnabled() ? "blob" : "local" }, { headers: { "Cache-Control": "no-store" } });
}

const formats = new Map([
  ["model/gltf-binary", "glb"], ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"],
  ["image/avif", "avif"], ["image/gif", "gif"],
  ["video/mp4", "mp4"], ["video/webm", "webm"],
]);
const limit = 100 * 1024 * 1024;

export async function POST(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: "Admin token is not configured." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (cloudStorageEnabled()) {
    if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Use the content studio direct uploader for cloud media." }, { status: 400 });
    try { return await finishCloudUpload(request); }
    catch { return Response.json({ error: "Media preparation failed. The original is retained; retry with a shorter supported film." }, { status: 422 }); }
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit + 1024 * 1024) return Response.json({ error: "Media exceeds the 100 MB local upload limit." }, { status: 413 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a media file." }, { status: 400 });
    const extension = formats.get(file.type);
    if (!extension) return Response.json({ error: "Only GLB, JPEG, PNG, WebP, AVIF, GIF, MP4 and WebM are supported." }, { status: 415 });
    if (file.size === 0 || file.size > limit) return Response.json({ error: "Media must be between 1 byte and 100 MB." }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const directory = path.join(process.cwd(), ".okno-content", "media");
    await mkdir(directory, { recursive: true });
    if (extension === "glb") {
      validateGlb(bytes);
      const name = `${createHash("sha256").update(bytes).digest("hex")}.glb`;
      await writeFile(path.join(directory, name), bytes, { flag: "wx", mode: 0o600 }).catch(error => {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      });
      return Response.json({ url: `/api/site-media/${name}`, name: file.name });
    }
    if (extension === "mp4" || extension === "webm") {
      const signatureOrbit = data.get("profile") === "signature-orbit";
      // Persist before enqueuing: a queued cancellation or server restart must
      // not discard the original upload after we have acknowledged it.
      await persistOriginalVideo(bytes, extension);
      try {
        const job = enqueueVideo(bytes, extension, signatureOrbit);
        return Response.json({ jobId: job.id, status: job.status, name: file.name }, { status: 202, headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 429 });
      }
    }
    const metadata = await sharp(bytes, { failOn: "error" }).metadata();
    const actual = metadata.format === "jpeg" ? "jpg" : metadata.format;
    if (actual !== extension || !metadata.width || !metadata.height || metadata.width > 12000 || metadata.height > 12000) {
      return Response.json({ error: "Image data does not match its format or has invalid dimensions." }, { status: 415 });
    }
    const hash = createHash("sha256").update(bytes).digest("hex");
    const name = `${hash}.${extension}`;
    await writeFile(path.join(directory, name), bytes, { flag: "wx", mode: 0o600 }).catch(error => {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    });
    return Response.json({ url: `/api/site-media/${name}`, name: file.name, width: metadata.width, height: metadata.height, warning: metadata.width < 1200 ? "This image may look soft in wide layouts. Preview before publishing." : undefined });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
