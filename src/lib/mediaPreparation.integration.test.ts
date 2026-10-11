import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const available = spawnSync("ffmpeg", ["-version"]).status === 0 && spawnSync("ffprobe", ["-version"]).status === 0;
let temporary = "";

afterEach(async () => {
  vi.restoreAllMocks();
  if (temporary) await rm(temporary, { recursive: true, force: true });
  temporary = "";
});

describe("local video preparation", () => {
  it("preserves the source and prepares seekable scroll/detail films plus a poster", async () => {
    if (!available) return;
    temporary = await mkdtemp(path.join(tmpdir(), "okno-media-prepare-"));
    await mkdir(path.join(temporary, ".okno-content", "media"), { recursive: true });
    const source = path.join(temporary, "source.mp4");
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=640x360:rate=30", "-t", "1", "-c:v", "mpeg4", "-q:v", "5", source], { timeout: 30_000 });
    const bytes = await readFile(source);
    vi.spyOn(process, "cwd").mockReturnValue(temporary);
    vi.resetModules();
    const { prepareVideo } = await import("./mediaPreparation");
    const result = await prepareVideo(bytes, "mp4", true);
    expect(result.originalUrl).toMatch(/^\/api\/site-media\/[a-f0-9]{64}\.mp4$/);
    expect(result.url).toMatch(/^\/api\/site-media\/[a-f0-9]{64}\.mp4$/);
    expect(result.detailUrl).toMatch(/^\/api\/site-media\/[a-f0-9]{64}\.mp4$/);
    expect(result.posterUrl).toMatch(/^\/api\/site-media\/[a-f0-9]{64}\.jpg$/);
    expect(result.fps).toBe(24);
    expect(result.duration).toBeGreaterThan(0.9);
    const derivative = path.join(temporary, ".okno-content", "media", path.basename(result.url));
    expect((await stat(derivative)).size).toBeGreaterThan(1000);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,r_frame_rate,width,height", "-of", "json", derivative], { encoding: "utf8" })) as { streams: { codec_name: string; r_frame_rate: string; width: number; height: number }[] };
    expect(probe.streams[0]).toMatchObject({ codec_name: "h264", r_frame_rate: "24/1", width: 640, height: 360 });
    expect(await prepareVideo(bytes, "mp4", true)).toEqual(result);
  }, 60_000);

  it("cancels an active preparation without publishing a manifest or deleting the original", async () => {
    if (!available) return;
    temporary = await mkdtemp(path.join(tmpdir(), "okno-media-cancel-"));
    await mkdir(path.join(temporary, ".okno-content", "media"), { recursive: true });
    const source = path.join(temporary, "source.mp4");
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=640x360:rate=30", "-t", "2", "-c:v", "mpeg4", "-q:v", "5", source], { timeout: 30_000 });
    const bytes = await readFile(source);
    const hash = createHash("sha256").update(bytes).digest("hex");
    vi.spyOn(process, "cwd").mockReturnValue(temporary);
    vi.resetModules();
    const { prepareVideo } = await import("./mediaPreparation");
    const controller = new AbortController();
    await expect(prepareVideo(bytes, "mp4", true, {
      signal: controller.signal,
      onProgress: progress => { if (progress.stage === "Preparing scroll film") controller.abort(); },
    })).rejects.toThrow(/cancel/i);
    expect((await stat(path.join(temporary, ".okno-content", "media", `${hash}.mp4`))).size).toBe(bytes.length);
    await expect(stat(path.join(temporary, ".okno-content", "media", `${hash}.orbit.json`))).rejects.toMatchObject({ code: "ENOENT" });
  }, 60_000);
});
