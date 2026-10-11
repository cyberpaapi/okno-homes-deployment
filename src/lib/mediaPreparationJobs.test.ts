import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocked = vi.hoisted(() => ({
  resolve: null as null | ((result: { url: string; originalUrl: string; posterUrl: string; width: number; height: number; duration: number; fps: 24 }) => void),
}));
vi.mock("./mediaPreparation", () => ({
  prepareVideo: vi.fn((_bytes: Buffer, _extension: string, _signatureOrbit: boolean, options: { signal: AbortSignal; onProgress: (progress: { percent: number; stage: string }) => void }) =>
    new Promise((resolve, reject) => {
      options.onProgress({ percent: 23, stage: "Preparing scroll film" });
      mocked.resolve = resolve;
      options.signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
    })),
}));

beforeEach(() => {
  const key = Symbol.for("okno.mediaPreparationJobs");
  delete (globalThis as Record<symbol, unknown>)[key];
  mocked.resolve = null;
  vi.resetModules();
});

describe("local video preparation jobs", () => {
  it("reports progress, queues one worker, and cancels without a staged result", async () => {
    const { enqueueVideo, readMediaJob, cancelMediaJob } = await import("./mediaPreparationJobs");
    const first = enqueueVideo(Buffer.from("first"), "mp4", true);
    const queued = enqueueVideo(Buffer.from("second"), "webm", false);
    await Promise.resolve();
    expect(readMediaJob(first.id)).toMatchObject({ status: "running", percent: 23, stage: "Preparing scroll film" });
    expect(readMediaJob(queued.id)).toMatchObject({ status: "queued", percent: 0 });
    expect(cancelMediaJob(queued.id)).toMatchObject({ status: "cancelled" });
    expect(cancelMediaJob(first.id)).toMatchObject({ status: "cancelled" });
    await Promise.resolve();
    await Promise.resolve();
    expect(readMediaJob(first.id)?.result).toBeUndefined();
    expect(readMediaJob(queued.id)?.result).toBeUndefined();
  });

  it("exposes a completed result only when preparation finishes", async () => {
    const { enqueueVideo, readMediaJob } = await import("./mediaPreparationJobs");
    const job = enqueueVideo(Buffer.from("video"), "mp4", false);
    await Promise.resolve();
    expect(readMediaJob(job.id)?.result).toBeUndefined();
    mocked.resolve?.({ url: "/api/site-media/ready.mp4", originalUrl: "/api/site-media/original.mp4", posterUrl: "/api/site-media/poster.jpg", width: 640, height: 360, duration: 2, fps: 24 });
    await Promise.resolve();
    expect(readMediaJob(job.id)).toMatchObject({ status: "ready", percent: 100, result: { url: "/api/site-media/ready.mp4" } });
  });
});
