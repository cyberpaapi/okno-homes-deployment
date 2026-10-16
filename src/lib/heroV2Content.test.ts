import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
let root = '';
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'okno-v2-media-contract-'));
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  vi.resetModules();
});
afterEach(async () => { vi.restoreAllMocks(); await rm(root, { recursive: true, force: true }); });
it('lets the editor restore the built-in V2 film through draft and publish without permitting empty V1 films', async () => {
  const store = await import('./siteContentStore');
  expect(store.validateContentValue('hero-v2.opening.scroll-video', '')).toBeNull();
  expect(store.validateContentValue('hero-v1.opening.scroll-video', '')).not.toBeNull();
  const draft = await store.saveFieldsDraft({ 'hero-v2.opening.scroll-video': '' }, 0, 0);
  expect(draft.published['hero-v2.opening.scroll-video']).toBeUndefined();
  const published = await store.publishDraft(draft.revision, draft.draftRevision);
  expect(published.published['hero-v2.opening.scroll-video']).toBe('');
  expect((await store.readContent()).published['hero-v2.opening.scroll-video']).toBe('');
});

it('validates both editable hero destinations as same-site links', async () => {
  const store = await import('./siteContentStore');
  for (const id of ['hero-v2.ending.primary-href', 'hero-v2.ending.secondary-href']) {
    expect(store.validateContentValue(id, '/models')).toBeNull();
    expect(store.validateContentValue(id, '/enquiry?intent=home')).toBeNull();
    expect(store.validateContentValue(id, 'javascript:alert(1)')).not.toBeNull();
    expect(store.validateContentValue(id, 'https://example.com')).not.toBeNull();
  }
});
