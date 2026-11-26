import { triangleGlb } from '@/test/glbFixture';
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/siteContentStore", () => ({ adminTokenConfigured: () => true, isAdminAuthorized: () => true }));
vi.mock("@/lib/mediaPreparationJobs", () => ({ enqueueVideo: vi.fn(() => ({ id: "queued-video", status: "queued" })) }));

let temporary = "";
afterEach(async () => {
  vi.restoreAllMocks();
  if (temporary) await rm(temporary, { recursive: true, force: true });
  temporary = "";
});

describe("admin video upload route", () => {
  it('rejects a GLB upload without reachable drawable geometry and accepts actual vertex bytes', async () => {
    temporary = await mkdtemp(path.join(tmpdir(), 'okno-glb-route-'));
    vi.spyOn(process, 'cwd').mockReturnValue(temporary);
    vi.resetModules();
    const { POST } = await import('./route');
    const upload = async (bytes: Buffer) => {
      const data = new FormData();
      data.set('file', new File([new Uint8Array(bytes)], 'house.glb', { type: 'model/gltf-binary' }));
      return POST({ headers: new Headers(), formData: async () => data } as Request);
    };
    const empty = await upload(triangleGlb({ meshes: [{ primitives: [] }] }));
    expect(empty.status).toBe(400);
    expect(await empty.json()).toMatchObject({ error: expect.stringContaining('drawable geometry') });
    const bytes = triangleGlb();
    const valid = await upload(bytes);
    expect(valid.status).toBe(200);
    const name = createHash('sha256').update(bytes).digest('hex') + '.glb';
    expect(await valid.json()).toMatchObject({ url: '/api/site-media/' + name });
    expect(existsSync(path.join(temporary, '.okno-content', 'media', name))).toBe(true);
  });
  it("stores the original before acknowledging a queued job", async () => {
    temporary = await mkdtemp(path.join(tmpdir(), "okno-upload-route-"));
    vi.spyOn(process, "cwd").mockReturnValue(temporary);
    vi.resetModules();
    const { enqueueVideo } = await import("@/lib/mediaPreparationJobs");
    const bytes = Buffer.from("new source video bytes");
    const name = `${createHash("sha256").update(bytes).digest("hex")}.mp4`;
    const source = path.join(temporary, ".okno-content", "media", name);
    vi.mocked(enqueueVideo).mockImplementation(() => {
      expect(existsSync(source)).toBe(true);
      return { id: "queued-video", status: "queued", stage: "Waiting", percent: 0 };
    });
    const { POST } = await import("./route");
    const data = new FormData();
    data.set("file", new File([bytes], "opening.mp4", { type: "video/mp4" }));
    const request = { headers: new Headers(), formData: async () => data } as Request;

    const response = await POST(request);
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ jobId: "queued-video", status: "queued" });
    expect(existsSync(source)).toBe(true);
    expect(enqueueVideo).toHaveBeenCalledOnce();
  });
});
