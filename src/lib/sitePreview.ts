import localPorts from '../../config/local-ports.json';

export const PREVIEW_READY = 'OKNO_CMS_PREVIEW_READY';
export const PREVIEW_UPDATE = 'OKNO_CMS_PREVIEW';
export const PREVIEW_REQUEST = 'OKNO_CMS_PREVIEW_REQUEST';

/** Embedded editorial films use native decoding to avoid a second full-size
 * decoded-frame cache. Standalone visitor rendering stays unchanged. */
export function isEmbeddedSitePreview() {
  return typeof window !== 'undefined' && window.parent !== window;
}

function isLocalAdminOrigin(origin: string) {
  return window.location.protocol === 'http:' &&
    ['127.0.0.1', 'localhost'].includes(window.location.hostname) &&
    window.location.port === String(localPorts.website) &&
    ['127.0.0.1', 'localhost'].some(host => origin === `http://${host}:${localPorts.admin}`);
}

export function isTrustedPreviewMessage(event: MessageEvent) {
  if (!isEmbeddedSitePreview() || event.source !== window.parent) return false;
  if (isLocalAdminOrigin(event.origin)) return true;
  if (event.origin !== window.location.origin) return false;
  try {
    const pathname = window.parent.location.pathname;
    return pathname === '/admin' || pathname.startsWith('/admin/');
  } catch {
    return false;
  }
}

export function announcePreviewReady() {
  if (!isEmbeddedSitePreview()) return;
  let origin = window.location.origin;
  // The editor may be opened on the website origin or either fixed local alias.
  // An origin-only cross-origin referrer is sufficient; never use a wildcard.
  try {
    const referrerOrigin = new URL(document.referrer).origin;
    if (referrerOrigin === origin || isLocalAdminOrigin(referrerOrigin)) origin = referrerOrigin;
  } catch {
    // A parent request after iframe load handles referrer-free browser policies.
  }
  window.parent.postMessage({ type: PREVIEW_READY }, origin);
}
