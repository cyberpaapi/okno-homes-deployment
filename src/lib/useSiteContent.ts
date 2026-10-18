"use client";

import { useMemo, useSyncExternalStore } from "react";
import localPorts from "../../config/local-ports.json";
import { announcePreviewReady } from "./sitePreview";
import type { ContentCollections, ContentItem } from "@/lib/contentCollections";

type PublicSnapshot = { revision: number; published: Record<string, string>; publishedCollections: ContentCollections };
const initial: PublicSnapshot = { revision: -1, published: {}, publishedCollections: {} };
let snapshot = initial;
let preview: Record<string, string> = {};
let previewCollections: ContentCollections = {};
let interval: ReturnType<typeof setInterval> | null = null;
let pending: AbortController | null = null;
const listeners = new Set<() => void>();

async function refresh() {
  if (pending || typeof document === "undefined" || document.hidden || !listeners.size) return;
  const request = new AbortController();
  pending = request;
  const deadline = setTimeout(() => request.abort(), 8000);
  try {
    const response = await fetch(`/api/site-content?since=${snapshot.revision}`, { cache: "no-store", signal: request.signal });
    if (response.status === 204) return;
    if (!response.ok) return;
    const next = await response.json() as PublicSnapshot;
    if (request.signal.aborted) return;
    if (next.revision === snapshot.revision) return;
    snapshot = next;
    listeners.forEach(listener => listener());
  } catch {
    // Existing source values remain visible when the local CMS is unavailable.
  } finally {
    clearTimeout(deadline);
    if (pending === request) pending = null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!interval) {
    void refresh();
    interval = setInterval(() => { void refresh(); }, 15000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("message", receivePreview);
    announcePreviewReady();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && interval) {
      clearInterval(interval);
      interval = null;
      pending?.abort();
      pending = null;
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("message", receivePreview);
    }
  };
}

function receivePreview(event: MessageEvent) {
  if (event.source !== window.parent || window.parent === window || event.data?.type !== "OKNO_CMS_PREVIEW") return;
  const sameOriginAdmin = event.origin === window.location.origin && window.parent.location.pathname.startsWith("/admin");
  const fixedLocalAdmin = window.location.hostname === "127.0.0.1" && window.location.port === String(localPorts.website) && event.origin === `http://127.0.0.1:${localPorts.admin}`;
  if (!sameOriginAdmin && !fixedLocalAdmin) return;
  const values = event.data.values;
  if (!values || typeof values !== "object" || Array.isArray(values)) return;
  preview = Object.fromEntries(Object.entries(values as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const collections = event.data.collections;
  previewCollections = collections && typeof collections === "object" && !Array.isArray(collections) ? collections as ContentCollections : {};
  snapshot = { ...snapshot };
  listeners.forEach(listener => listener());
}

export function useSiteContent(id: string, fallback: string) {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  return preview[id] ?? state.published[id] ?? fallback;
}

export function useSiteContentMap() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  return useMemo(() => ({ ...state.published, ...preview }), [state]);
}

export function useSiteCollectionsMap(): ContentCollections {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  return useMemo(() => ({ ...state.publishedCollections, ...previewCollections }), [state]);
}

export function useSiteCollection(collectionId: string, fallbackItems: ContentItem[]): ContentItem[] {
  const collections = useSiteCollectionsMap();
  return Object.hasOwn(collections, collectionId) ? collections[collectionId] : fallbackItems;
}
