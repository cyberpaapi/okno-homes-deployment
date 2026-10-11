import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { adminPages, allContentFields, type ContentPage } from '@/data/adminContent';
import { collectionDefinitions } from './contentCollections';

const root = process.cwd();
let temporary = '';
afterEach(async () => {
  vi.restoreAllMocks();
  if (temporary) await rm(temporary, { recursive: true, force: true });
});

it('round-trips every registered scalar through private drafts, publication and durable rereads', async () => {
  temporary = await mkdtemp(path.join(tmpdir(), 'okno-admin-coverage-'));
  await symlink(path.join(root, 'public'), path.join(temporary, 'public'));
  await symlink(path.join(root, 'src'), path.join(temporary, 'src'));
  vi.spyOn(process, 'cwd').mockReturnValue(temporary);
  vi.resetModules();
  const store = await import('./siteContentStore');
  const fields = allContentFields();
  const expected = Object.fromEntries(fields.map(field => [field.id, field.defaultValue]));
  expect(fields.flatMap(field => {
    const error = store.validateContentValue(field.id, field.defaultValue);
    return error ? [{ id: field.id, error }] : [];
  })).toEqual([]);
  let current = await store.readContent();
  for (let index = 0; index < fields.length; index += 100) {
    const batch = Object.fromEntries(fields.slice(index, index + 100).map(field => [field.id, field.defaultValue]));
    current = await store.saveFieldsDraft(batch, current.revision, current.draftRevision);
    expect((await store.readContent()).published).toEqual({});
  }
  expect(current.draft).toEqual(expected);
  current = await store.publishDraft(current.revision, current.draftRevision);
  expect(current.published).toEqual(expected);
  expect(current.draft).toEqual({});
  expect((await store.readContent()).published).toEqual(expected);
  const pages: object[] = [];
  function visit(page: ContentPage) {
    pages.push({ id: page.id, label: page.label, href: page.href,
      sections: page.sections.map(section => ({ id: section.id, label: section.label, fields: section.fields.map(field => ({ id: field.id, kind: field.kind, label: field.label })) })),
      collections: collectionDefinitions.filter(definition => definition.pageId === page.id),
    });
    page.children?.forEach(visit);
  }
  adminPages.forEach(visit);
  if (process.env.OKNO_AUDIT_REPORT) await writeFile(path.resolve(root, process.env.OKNO_AUDIT_REPORT), JSON.stringify({ uniqueScalarFields: fields.length, kindCounts: Object.fromEntries(['text','image','video','choice'].map(kind => [kind, fields.filter(field => field.kind === kind).length])), registeredCollections: collectionDefinitions.length, pages, scalarStoreRoundTrip: 'passed', productionPublishing: 'blocked-storage-503' }, null, 2));
});
