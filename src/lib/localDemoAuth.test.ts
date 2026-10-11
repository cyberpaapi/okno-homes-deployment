import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

vi.mock("server-only", () => ({}));

const token = "okno_demo_test_token_long_enough_to_authorize";
const expiresAt = "2026-10-14T00:00:00.000Z";
let testRoot = "";

beforeEach(async () => {
  testRoot = await mkdtemp(path.join(tmpdir(), "okno-demo-auth-"));
  vi.spyOn(process, "cwd").mockReturnValue(testRoot);
  vi.setSystemTime(new Date("2026-10-07T00:00:00.000Z"));
  await mkdir(path.join(testRoot, ".okno-content"));
  await writeFile(path.join(testRoot, ".okno-content", "demo-token.json"), JSON.stringify({ purpose: "local-demo-only", token, expiresAt }));
  await chmod(path.join(testRoot, ".okno-content", "demo-token.json"), 0o600);
});

afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(testRoot, { recursive: true, force: true });
});

describe("expiring local demo credential", () => {
  it("authorizes the local admin API and reports its expiry", async () => {
    const { GET } = await import("@/app/api/admin/content/route");
    const response = await GET(new Request("http://127.0.0.1:3134/api/admin/content", { headers: { authorization: `Bearer ${token}` } }));
    expect(response.status).toBe(200);
    expect((await response.json()).demoExpiresAt).toBe(expiresAt);
  });

  it("rejects the same token after expiry and outside the fixed local website/admin ports", async () => {
    const { isAdminAuthorized } = await import("./siteContentStore");
    const request = (url: string) => new Request(url, { headers: { authorization: `Bearer ${token}` } });
    expect(isAdminAuthorized(request("http://127.0.0.1:3140/api/admin/content"))).toBe(true);
    expect(isAdminAuthorized(new Request("http://localhost/api/admin/content", { headers: { authorization: `Bearer ${token}`, host: "127.0.0.1:3134" } }))).toBe(true);
    expect(isAdminAuthorized(request("https://example.com/api/admin/content"))).toBe(false);
    expect(isAdminAuthorized(request("http://127.0.0.1:4000/api/admin/content"))).toBe(false);
    vi.setSystemTime(new Date(expiresAt));
    expect(isAdminAuthorized(request("http://127.0.0.1:3134/api/admin/content"))).toBe(false);
  });

  it("never accepts a local demo credential on Vercel, even with a forged local request", async () => {
    vi.stubEnv("VERCEL", "1");
    const { readLocalDemoCredential } = await import("./localDemoAuth");
    const { isAdminAuthorized } = await import("./siteContentStore");
    expect(readLocalDemoCredential()).toBeNull();
    expect(isAdminAuthorized(new Request("http://127.0.0.1:3134/api/admin/content", { headers: { authorization: `Bearer ${token}` } }))).toBe(false);
  });

  it("rejects an unsafe world-readable token file", async () => {
    const { readLocalDemoCredential } = await import("./localDemoAuth");
    await chmod(path.join(testRoot, ".okno-content", "demo-token.json"), 0o644);
    if (process.platform !== "win32") expect(readLocalDemoCredential()).toBeNull();
  });
});
