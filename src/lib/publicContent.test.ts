import { beforeEach, describe, expect, it, vi } from 'vitest';
import seed from '../../config/content-seed.json';

const mocks = vi.hoisted(() => ({ read: vi.fn(), cloud: vi.fn(), cache: vi.fn((fn: () => unknown) => fn) }));
vi.mock('@/lib/siteContentStore', () => ({ readContent: mocks.read }));
vi.mock('@/lib/cloudStorage', () => ({ cloudStorageEnabled: mocks.cloud }));
vi.mock('next/cache', () => ({ unstable_cache: mocks.cache }));
import { readPublicContent, PUBLIC_CONTENT_TAG } from './publicContent';

beforeEach(() => { mocks.read.mockReset(); mocks.cloud.mockReset(); });
describe('published-only content delivery', () => {
  it('never returns drafts or editor history to visitors', async () => {
    mocks.cloud.mockReturnValue(true);
    mocks.read.mockResolvedValue({ revision: 18, published: { title: 'Published' }, publishedCollections: {}, draft: { title: 'PRIVATE DRAFT' }, history: ['PRIVATE HISTORY'] });
    const value = await readPublicContent();
    expect(value).toEqual({ revision: 18, published: { title: 'Published' }, publishedCollections: {} });
    expect(JSON.stringify(value)).not.toContain('PRIVATE');
    expect(mocks.cache).toHaveBeenCalledWith(expect.any(Function), ['okno-publication-v1'], { tags: [PUBLIC_CONTENT_TAG], revalidate: 1800 });
  });
  it('serves the verified publication during a cloud store outage without writes', async () => {
    mocks.cloud.mockReturnValue(true);
    mocks.read.mockRejectedValue(new Error('Vercel Blob: 403 Forbidden'));
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const value = await readPublicContent();
    expect(value).toEqual({ revision: seed.revision, published: seed.published, publishedCollections: seed.publishedCollections });
    expect(value).not.toHaveProperty('draft');
    warning.mockRestore();
  });
  it('keeps the local gateway uncached so local publications remain immediate', async () => {
    mocks.cloud.mockReturnValue(false);
    mocks.read.mockResolvedValueOnce({ revision: 1, published: {}, publishedCollections: {} }).mockResolvedValueOnce({ revision: 2, published: { title: 'New' }, publishedCollections: {} });
    expect((await readPublicContent()).revision).toBe(1);
    expect((await readPublicContent()).revision).toBe(2);
  });
});
