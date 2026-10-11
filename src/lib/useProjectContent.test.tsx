import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { atlasProjects } from '@/data/projectAtlas';
import { initialProjectItems } from '@/data/projectCollections';
import { useProjectContent } from './useProjectContent';

const state = vi.hoisted(() => ({ collections: {} as Record<string, { id: string; fields: Record<string, string> }[]> }));
vi.mock('@/lib/useSiteContent', () => ({
  useSiteContentMap: () => ({}),
  useSiteCollectionsMap: () => state.collections,
}));

afterEach(() => { state.collections = {}; });

describe('already-open project detail', () => {
  it('stops showing a stale project when the published collection archives or removes it', () => {
    const fallback = atlasProjects[0];
    const { result, rerender } = renderHook(() => useProjectContent(fallback));
    expect(result.current?.id).toBe(fallback.id);

    state.collections = { 'projects.records': [initialProjectItems[0]] };
    rerender();
    expect(result.current?.id).toBe(fallback.id);

    state.collections = { 'projects.records': [{ ...initialProjectItems[0], fields: { ...initialProjectItems[0].fields, status: 'archived' } }] };
    rerender();
    expect(result.current).toBeNull();

    state.collections = { 'projects.records': [] };
    rerender();
    expect(result.current).toBeNull();
  });
});
