import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

vi.mock('server-only', () => ({}));
let root = '';
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'okno-owner-auth-'));
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('OKNO_CONTENT_BACKEND', '');
  vi.resetModules();
});
afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});
const request = (key?: string) => new Request('http://127.0.0.1:3134/api/admin/content', {
  headers: key ? { authorization: `Bearer ${key}` } : {},
});

describe('configured shared owner key', () => {
  it('accepts the configured eight-character key without an expiry', async () => {
    vi.stubEnv('OKNO_CMS_ADMIN_TOKEN', 'Test@123');
    const store = await import('./siteContentStore');
    const { GET } = await import('@/app/api/admin/content/route');
    expect(store.adminTokenConfigured()).toBe(true);
    expect((await GET(request('Test@123'))).status).toBe(200);
    vi.setSystemTime(new Date('2040-01-01T00:00:00Z'));
    expect(store.isAdminAuthorized(request('Test@123'))).toBe(true);
    expect(store.demoAccessExpiresAt(request('Test@123'))).toBeNull();
    expect((await GET(request('Test@123'))).status).toBe(200);
  });
  it('keeps exact matching and rejects missing, wrong-case and previous keys', async () => {
    vi.stubEnv('OKNO_CMS_ADMIN_TOKEN', 'Test@123');
    const { GET } = await import('@/app/api/admin/content/route');
    for (const key of [undefined, 'test@123', 'Test@124', 'old_owner_key_long_enough_to_authorize']) {
      expect((await GET(request(key))).status).toBe(401);
    }
  });
  it('fails closed for missing or incomplete server configuration', async () => {
    const store = await import('./siteContentStore');
    const { GET } = await import('@/app/api/admin/content/route');
    for (const key of ['', '1234567']) {
      vi.stubEnv('OKNO_CMS_ADMIN_TOKEN', key);
      expect(store.adminTokenConfigured()).toBe(false);
      const response = await GET(request('Test@123'));
      expect(response.status).toBe(503);
      expect((await response.json()).error).toContain('at least 8 characters');
    }
  });
  it('retains support for existing longer configured keys', async () => {
    const key = 'existing_owner_key_long_enough_to_authorize';
    vi.stubEnv('OKNO_CMS_ADMIN_TOKEN', key);
    const { GET } = await import('@/app/api/admin/content/route');
    expect((await GET(request(key))).status).toBe(200);
  });
});
