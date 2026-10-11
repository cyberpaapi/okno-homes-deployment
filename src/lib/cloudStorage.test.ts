// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@vercel/blob", () => {
  class BlobPreconditionFailedError extends Error {}
  return { get: vi.fn(), head: vi.fn(), put: vi.fn(), BlobPreconditionFailedError };
});

beforeEach(() => { vi.stubEnv("VERCEL", "1"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-store-only"); });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("deployed content storage", () => {
  it("fails closed without a connected store and never falls back to a filesystem", async () => {
    const { cloudStorageEnabled, readCloudContent } = await import("./cloudStorage");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", ""); vi.stubEnv("BLOB_STORE_ID", "");
    expect(cloudStorageEnabled()).toBe(true);
    await expect(readCloudContent()).rejects.toThrow(/Connect the private/);
  });

  it("reads current private content without a stale CDN snapshot", async () => {
    const { get } = await import("@vercel/blob");
    vi.mocked(get).mockResolvedValue({ statusCode: 200, stream: new Response('{"revision":12}').body!, blob: { etag: '"12"' }, headers: new Headers() } as unknown as Awaited<ReturnType<typeof get>>);
    const { readCloudContent } = await import("./cloudStorage");
    expect(await readCloudContent()).toEqual({ value: { revision: 12 }, etag: '"12"' });
    expect(get).toHaveBeenCalledWith("cms/content.json", { access: "private", useCache: false, headers: { "Accept-Encoding": "identity" } });
  });

  it("refuses a weak content validator instead of permitting an unsafe write", async () => {
    const { get } = await import("@vercel/blob");
    vi.mocked(get).mockResolvedValue({ statusCode: 200, stream: new Response('{}').body!, blob: { etag: 'W/"12"' }, headers: new Headers() } as unknown as Awaited<ReturnType<typeof get>>);
    const { readCloudContent } = await import("./cloudStorage");
    await expect(readCloudContent()).rejects.toThrow(/Content version is unavailable/);
  });

  it("permits one of two independent writes and rejects the stale writer", async () => {
    const { put, BlobPreconditionFailedError } = await import("@vercel/blob");
    let currentEtag = '"12"';
    vi.mocked(put).mockImplementation(async (_name, _body, options) => {
      if (options.ifMatch !== currentEtag) throw new BlobPreconditionFailedError();
      currentEtag = '"13"';
      return {} as Awaited<ReturnType<typeof put>>;
    });
    const { writeCloudContent } = await import("./cloudStorage");
    const results = await Promise.allSettled([writeCloudContent({ revision: 13, draft: "first" }, '"12"'), writeCloudContent({ revision: 13, draft: "second" }, '"12"')]);
    expect(results.map(item => item.status).sort()).toEqual(["fulfilled", "rejected"]);
    const rejected = results.find(item => item.status === "rejected") as PromiseRejectedResult;
    expect(rejected.reason.message).toMatch(/Reload before saving/);
  });

  it("does not overwrite another worker's initial snapshot", async () => {
    const { put } = await import("@vercel/blob");
    vi.mocked(put).mockRejectedValue(new Error("This blob already exists"));
    const { writeCloudContent } = await import("./cloudStorage");
    await expect(writeCloudContent({ revision: 1 })).rejects.toThrow(/Reload before saving/);
    expect(put).toHaveBeenCalledWith("cms/content.json", expect.any(String), expect.objectContaining({ access: "private", addRandomSuffix: false, allowOverwrite: false }));
  });

  it("serves byte ranges and refuses invalid ranges without downloading media", async () => {
    const { head, get } = await import("@vercel/blob");
    vi.mocked(head).mockResolvedValue({ size: 100, contentType: "video/mp4" } as Awaited<ReturnType<typeof head>>);
    vi.mocked(get).mockResolvedValue({ statusCode: 200, stream: new Response("abc").body!, blob: {}, headers: new Headers({ "content-range": "bytes 0-2/100", "content-length": "3" }) } as unknown as Awaited<ReturnType<typeof get>>);
    const { getCloudMedia } = await import("./cloudStorage");
    const response = await getCloudMedia("film.mp4", new Request("https://okno.test/api/site-media/film.mp4", { headers: { Range: "bytes=0-2" } }));
    expect(response.status).toBe(206); expect(response.headers.get("content-range")).toBe("bytes 0-2/100");
    expect(await response.text()).toBe("abc");
    vi.mocked(get).mockClear();
    const invalid = await getCloudMedia("film.mp4", new Request("https://okno.test/api/site-media/film.mp4", { headers: { Range: "bytes=100-" } }));
    expect(invalid.status).toBe(416); expect(get).not.toHaveBeenCalled();
  });
});
