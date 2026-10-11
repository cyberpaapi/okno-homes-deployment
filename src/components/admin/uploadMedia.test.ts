import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadMedia } from "./uploadMedia";

const blobClient = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock("@vercel/blob/client", () => blobClient);

const file = () => new File(["test"], "sample.mp4", { type: "video/mp4" });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("admin media upload lifecycle", () => {
  it("returns an image-style direct upload without polling", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ mode: "local" })).mockResolvedValueOnce(Response.json({ url: "/api/site-media/image.jpg" }));
    vi.stubGlobal("fetch", fetcher);
    const progress = vi.fn();
    const result = await uploadMedia(file(), "local-token", new AbortController().signal, progress);
    expect(result.url).toBe("/api/site-media/image.jpg");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(progress).toHaveBeenLastCalledWith({ name: "sample.mp4", stage: "Ready to stage as a draft", percent: 100 });
  });

  it("polls background video preparation and returns only the ready result", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ mode: "local" }))
      .mockResolvedValueOnce(Response.json({ jobId: "job-1", status: "queued" }, { status: 202 }))
      .mockResolvedValueOnce(Response.json({ id: "job-1", status: "running", stage: "Preparing scroll film", percent: 48 }))
      .mockResolvedValueOnce(Response.json({ id: "job-1", status: "ready", stage: "Ready", percent: 100, result: { url: "/api/site-media/scroll.mp4", originalUrl: "/api/site-media/source.mp4", posterUrl: "/api/site-media/poster.jpg", width: 640 } }));
    vi.stubGlobal("fetch", fetcher);
    const progress = vi.fn();
    const result = await uploadMedia(file(), "local-token", new AbortController().signal, progress, "signature-orbit");
    expect(result).toMatchObject({ url: "/api/site-media/scroll.mp4", posterUrl: "/api/site-media/poster.jpg", prepared: true });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(progress).toHaveBeenCalledWith({ name: "sample.mp4", stage: "Preparing scroll film", percent: 48 });
  });

  it("cancels the server job and leaves no prepared URL to stage", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ mode: "local" }))
      .mockResolvedValueOnce(Response.json({ jobId: "job-2", status: "queued" }, { status: 202 }))
      .mockResolvedValueOnce(Response.json({ id: "job-2", status: "running", stage: "Preparing scroll film", percent: 25 }))
      .mockResolvedValueOnce(Response.json({ id: "job-2", status: "cancelled", stage: "Cancelled", percent: 25 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(uploadMedia(file(), "local-token", controller.signal, progress => {
      if (progress.percent === 25) controller.abort();
    })).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[3][0]).toBe("/api/admin/upload/jobs/job-2");
    expect(fetcher.mock.calls[3][1]).toMatchObject({ method: "DELETE" });
  });
  it("uploads cloud media directly with auth and finalizes through a small JSON request", async () => {
    const pathname = "uploads/12345678-1234-1234-1234-123456789abc.mp4";
    blobClient.upload.mockResolvedValue({ pathname });
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ mode: "blob" })).mockResolvedValueOnce(Response.json({ url: "/api/site-media/prepared.mp4", posterUrl: "/api/site-media/poster.jpg", prepared: true }));
    vi.stubGlobal("fetch", fetcher);
    const result = await uploadMedia(file(), "owner-key", new AbortController().signal, vi.fn(), "signature-orbit");
    expect(result).toMatchObject({ prepared: true, url: "/api/site-media/prepared.mp4" });
    expect(blobClient.upload).toHaveBeenCalledWith(expect.stringMatching(/^uploads\/.*\.mp4$/), expect.any(File), expect.objectContaining({ access: "private", multipart: true, headers: { Authorization: "Bearer owner-key" } }));
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: "POST", body: JSON.stringify({ pathname, profile: "signature-orbit" }) });
  });

});
