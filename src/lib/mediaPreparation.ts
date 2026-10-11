import "server-only";

import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { cloudStorageEnabled, storeCloudMedia } from "./cloudStorage";
import { promisify } from "node:util";

const run = promisify(execFile);
const cloud = cloudStorageEnabled();
const mediaDirectory = cloud ? path.join(tmpdir(), "okno-media") : path.join(process.cwd(), ".okno-content", "media");
async function mediaBinary(kind: "ffmpeg" | "ffprobe") {
  if (!cloud) return kind;
  if (kind === "ffmpeg") { const binary = (await import("ffmpeg-static")).default; if (!binary) throw new Error("Video encoder is unavailable."); return binary; }
  return (await import("ffprobe-static")).default.path;
}

type Probe = {
  streams?: { codec_type?: string; width?: number; height?: number; avg_frame_rate?: string }[];
  format?: { duration?: string };
};

export type PreparedVideo = {
  url: string;
  originalUrl: string;
  posterUrl: string;
  detailUrl?: string;
  width: number;
  height: number;
  duration: number;
  fps: 24;
};

export type PreparationProgress = { percent: number; stage: string };
export type PreparationOptions = { signal?: AbortSignal; onProgress?: (progress: PreparationProgress) => void };

function assertNotCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("Video preparation was cancelled.");
}

export function boundedVideoSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(2, Math.floor(width * ratio / 2) * 2),
    height: Math.max(2, Math.floor(height * ratio / 2) * 2),
  };
}

async function storedPath(bytes: Buffer, extension: "mp4" | "webm" | "jpg") {
  const hash = createHash("sha256").update(bytes).digest("hex");
  const name = `${hash}.${extension}`;
  const destination = path.join(mediaDirectory, name);
  try { await writeFile(destination, bytes, { flag: "wx", mode: 0o600 }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  if (cloud) await storeCloudMedia(name, bytes, extension === "jpg" ? "image/jpeg" : extension === "mp4" ? "video/mp4" : "video/webm");
  return { name, destination, url: `/api/site-media/${name}` };
}

/** The original survives queued cancellation and preparation failure. */
export async function persistOriginalVideo(bytes: Buffer, extension: "mp4" | "webm") {
  return storedPath(bytes, extension);
}

async function encode(input: string, width: number, height: number, target: string, duration: number, options: PreparationOptions, start: number, span: number, stage: string) {
  assertNotCancelled(options.signal);
  const args = [
    "-hide_banner", "-loglevel", "error", "-y", "-i", input,
    "-vf", `fps=24,scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    "-c:v", cloud ? "libx264" : "libopenh264", "-g", "6", "-keyint_min", "6",
    "-b:v", width > 1200 ? "5M" : "2.5M", "-maxrate", width > 1200 ? "8M" : "4M",
    "-bufsize", width > 1200 ? "16M" : "8M",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-progress", "pipe:1", "-nostats", "-f", "mp4", target,
  ];
  options.onProgress?.({ percent: start, stage });
  const binary = await mediaBinary("ffmpeg");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(binary, args, { signal: options.signal, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let errors = "";
    let settled = false;
    const timeout = setTimeout(() => child.kill("SIGTERM"), 300_000);
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) reject(error); else resolve();
    }
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      output += chunk;
      const lines = output.split(/\r?\n/);
      output = lines.pop() ?? "";
      for (const line of lines) {
        const match = line.match(/^out_time_(?:us|ms)=(\d+)$/);
        if (!match) continue;
        const elapsed = Number(match[1]) / 1_000_000;
        if (Number.isFinite(elapsed)) options.onProgress?.({ percent: Math.min(start + span - 1, start + Math.floor((elapsed / duration) * span)), stage });
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => { errors = `${errors}${chunk}`.slice(-2048); });
    child.on("error", (error: Error) => finish(options.signal?.aborted ? new Error("Video preparation was cancelled.") : error));
    child.on("close", code => finish(options.signal?.aborted ? new Error("Video preparation was cancelled.") : code === 0 ? undefined : new Error(errors.trim() || "Video preparation failed.")));
  });
  assertNotCancelled(options.signal);
  const info = await stat(target);
  if (!info.size) throw new Error("Video preparation produced an empty file.");
  return storedPath(await readFile(target), "mp4");
}

/** Preserve the upload, then make a CFR, frequent-keyframe, seekable H.264 copy. */
export async function prepareVideo(bytes: Buffer, extension: "mp4" | "webm", signatureOrbit: boolean, options: PreparationOptions = {}): Promise<PreparedVideo> {
  assertNotCancelled(options.signal);
  options.onProgress?.({ percent: 2, stage: "Preserving original" });
  const sourceHash = createHash("sha256").update(bytes).digest("hex");
  const { name: sourceName, destination: sourcePath } = await persistOriginalVideo(bytes, extension);

  const manifest = path.join(mediaDirectory, `${sourceHash}.${signatureOrbit ? "orbit" : "video"}.json`);
  try {
    const cached = JSON.parse(await readFile(manifest, "utf8")) as PreparedVideo;
    if (cached.url && cached.posterUrl && (!signatureOrbit || cached.detailUrl)) {
      const names = [cached.url, cached.posterUrl, cached.detailUrl].filter(Boolean).map(url => path.basename(url!));
      if ((await Promise.all(names.map(name => stat(path.join(mediaDirectory, name)).then(() => true).catch(() => false)))).every(Boolean)) {
        assertNotCancelled(options.signal);
        options.onProgress?.({ percent: 100, stage: "Ready" });
        return cached;
      }
    }
  } catch { /* Missing or incomplete cache is rebuilt from the preserved source. */ }

  options.onProgress?.({ percent: 5, stage: "Checking video" });
  const { stdout } = await run(await mediaBinary("ffprobe"), ["-v", "error", "-show_entries", "stream=codec_type,width,height,avg_frame_rate:format=duration", "-of", "json", sourcePath], { signal: options.signal, timeout: 20_000, maxBuffer: 1024 * 1024 });
  assertNotCancelled(options.signal);
  const probe = JSON.parse(stdout) as Probe;
  const stream = probe.streams?.find(item => item.codec_type === "video");
  const width = stream?.width ?? 0;
  const height = stream?.height ?? 0;
  const duration = Number(probe.format?.duration);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 320 || height < 180 || width > 7680 || height > 4320 || !Number.isFinite(duration) || duration <= 0 || duration > 300) {
    throw new Error("Use a decodable video between 320×180 and 8K, no longer than five minutes.");
  }

  const detailSize = boundedVideoSize(width, height, 1920, 1080);
  const scrollSize = signatureOrbit ? boundedVideoSize(width, height, 1152, 648) : detailSize;
  const temporary = path.join(mediaDirectory, `${sourceHash}.${process.pid}.${Date.now()}`);
  const scrollTemp = `${temporary}.scroll.mp4`;
  const detailTemp = `${temporary}.detail.mp4`;
  const posterTemp = `${temporary}.poster.jpg`;
  try {
    const scroll = await encode(sourcePath, scrollSize.width, scrollSize.height, scrollTemp, duration, options, 10, signatureOrbit ? 38 : 75, "Preparing scroll film");
    const detail = signatureOrbit ? await encode(sourcePath, detailSize.width, detailSize.height, detailTemp, duration, options, 49, 37, "Preparing detail film") : undefined;
    options.onProgress?.({ percent: 88, stage: "Generating poster" });
    await run(await mediaBinary("ffmpeg"), ["-hide_banner", "-loglevel", "error", "-y", "-i", sourcePath, "-frames:v", "1", "-q:v", "3", posterTemp], { signal: options.signal, timeout: 20_000, maxBuffer: 1024 * 1024 });
    assertNotCancelled(options.signal);
    const poster = await storedPath(await readFile(posterTemp), "jpg");
    const result: PreparedVideo = {
      url: scroll.url,
      originalUrl: `/api/site-media/${sourceName}`,
      posterUrl: poster.url,
      ...(detail ? { detailUrl: detail.url } : {}),
      width: scrollSize.width,
      height: scrollSize.height,
      duration,
      fps: 24,
    };
    const staging = `${manifest}.${process.pid}.tmp`;
    try {
      await writeFile(staging, JSON.stringify(result), { mode: 0o600 });
      assertNotCancelled(options.signal);
      await rename(staging, manifest);
    } finally {
      await unlink(staging).catch(() => undefined);
    }
    options.onProgress?.({ percent: 100, stage: "Ready" });
    return result;
  } finally {
    await Promise.all([scrollTemp, detailTemp, posterTemp].map(file => unlink(file).catch(() => undefined)));
  }
}
