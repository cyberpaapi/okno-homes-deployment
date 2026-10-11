import localPorts from '../../config/local-ports.json';

export const PREVIEW_READY = 'OKNO_CMS_PREVIEW_READY';
export const PREVIEW_UPDATE = 'OKNO_CMS_PREVIEW';

/** Embedded editorial films use native decoding to avoid a second full-size
 * decoded-frame cache. Standalone visitor rendering stays unchanged. */
export function isEmbeddedSitePreview() {
  return typeof window !== 'undefined' && window.parent !== window;
}

export function announcePreviewReady() {
  if (!isEmbeddedSitePreview()) return;
  const origin = window.location.hostname === '127.0.0.1' && window.location.port === String(localPorts.website)
    ? `http://127.0.0.1:${localPorts.admin}` : window.location.origin;
  window.parent.postMessage({ type: PREVIEW_READY }, origin);
}
