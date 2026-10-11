export function projectContentHref(value: string, fallback: string, projectId?: string): string {
  const href = value.replaceAll('{projectId}', encodeURIComponent(projectId || '')).trim();
  if (/^#[a-z0-9_-]+$/i.test(href)) return href;
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\') && !href.includes('..') && !/\s/.test(href)) return href;
  try { if (new URL(href).protocol === 'https:') return href; } catch { /* Use the safe fallback. */ }
  return fallback;
}
