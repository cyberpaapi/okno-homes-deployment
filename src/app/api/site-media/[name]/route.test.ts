// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlobNotFoundError } from '@vercel/blob';
vi.mock('@/lib/cloudStorage', () => ({ cloudStorageEnabled: () => true, getCloudMedia: vi.fn() }));
import { getCloudMedia } from '@/lib/cloudStorage';
import { GET } from './route';
const name = `${'a'.repeat(64)}.mp4`;
const request = () => GET(new Request(`https://okno.test/api/site-media/${name}`), { params: Promise.resolve({ name }) });
afterEach(() => vi.clearAllMocks());
describe('public media recovery', () => {
  it('distinguishes unavailable storage from a missing asset', async () => {
    vi.mocked(getCloudMedia).mockRejectedValueOnce(new Error('Vercel Blob: store suspended'));
    const response = await request();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('retry-after')).toBe('60');
    vi.mocked(getCloudMedia).mockRejectedValueOnce(new BlobNotFoundError());
    expect((await request()).status).toBe(404);
  });
  it('rejects malformed names without reaching private storage', async () => {
    const response = await GET(new Request('https://okno.test/api/site-media/invalid'), { params: Promise.resolve({ name: '../cms/content.json' }) });
    expect(response.status).toBe(404); expect(getCloudMedia).not.toHaveBeenCalled();
  });
});
