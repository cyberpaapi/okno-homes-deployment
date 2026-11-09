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
  vi.stubEnv('OKNO_ADMIN_PASSWORDLESS', '');
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

describe('explicit password-free admin mode', () => {
  it('reads, saves and publishes without a key only when enabled', async () => {
    vi.stubEnv('OKNO_ADMIN_PASSWORDLESS', 'true');
    vi.stubEnv('OKNO_CMS_ADMIN_TOKEN', '');
    const store = await import('./siteContentStore');
    const { GET, PATCH, PUT } = await import('@/app/api/admin/content/route');
    expect(store.adminTokenConfigured()).toBe(true);
    expect(store.isAdminAuthorized(request())).toBe(true);
    const initial = await (await GET(request())).json();
    const patch = new Request('http://127.0.0.1:3134/api/admin/content', {
      method: 'PATCH', headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3134' },
      body: JSON.stringify({ id: 'hero-v1.opening.tagline', value: 'Homes for rare places.', revision: initial.revision, draftRevision: initial.draftRevision }),
    });
    const saved = await PATCH(patch);
    expect(saved.status).toBe(200);
    const draft = await saved.json();
    expect(draft.draft['hero-v1.opening.tagline']).toBe('Homes for rare places.');
    const published = await PUT(new Request(patch.url, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ revision: draft.revision, draftRevision: draft.draftRevision }) }));
    expect(published.status).toBe(200);
    expect((await published.json()).published['hero-v1.opening.tagline']).toBe('Homes for rare places.');
    vi.stubEnv('OKNO_ADMIN_PASSWORDLESS', 'false');
    expect(store.isAdminAuthorized(request())).toBe(false);
  });
  it('still refuses browser cross-site writes without a password', async () => {
    vi.stubEnv('OKNO_ADMIN_PASSWORDLESS', 'true');
    const { isAdminAuthorized } = await import('./siteContentStore');
    for (const headers of [{ origin: 'https://unrelated.example' }, { 'sec-fetch-site': 'cross-site' }] as Record<string, string>[]) {
      expect(isAdminAuthorized(new Request('https://okno-homes-aryan.vercel.app/api/admin/content', { method: 'PATCH', headers }))).toBe(false);
    }
    expect(isAdminAuthorized(new Request('https://okno-homes-aryan.vercel.app/api/admin/content', { method: 'PATCH', headers: { origin: 'https://okno-homes-aryan.vercel.app' } }))).toBe(true);
  });
  it('accepts only the fixed local gateway origins and never extends this exception to Vercel', async () => {
    vi.stubEnv('OKNO_ADMIN_PASSWORDLESS', 'true');
    const { isAdminAuthorized } = await import('./siteContentStore');
    const write = (origin: string, extra: Record<string, string> = {}) => new Request('http://localhost:3134/api/admin/content', { method: 'PATCH', headers: { origin, ...extra } });
    for (const origin of ['http://localhost:3140', 'http://127.0.0.1:3140', 'http://127.0.0.1:3134']) expect(isAdminAuthorized(write(origin))).toBe(true);
    for (const origin of ['http://localhost:9999', 'http://attacker.example:3140', 'null']) expect(isAdminAuthorized(write(origin))).toBe(false);
    expect(isAdminAuthorized(write('http://localhost:3140', { 'sec-fetch-site': 'cross-site' }))).toBe(false);
    vi.stubEnv('VERCEL', '1');
    expect(isAdminAuthorized(write('http://localhost:3140'))).toBe(false);
  });
});
