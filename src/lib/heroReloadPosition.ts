export const HERO_POSITION_KEY = 'okno.hero-v1.position.v1';
export const CONTENT_SECTIONS = ['process', 'models-preview', 'bespoke-preview', 'sustainability-preview', 'editorial-preview'] as const;
export type HeroPosition = { version: 1; path: string; savedAt: number; zone: 'hero' | 'content'; y: number; section: string | null; offset: number };

export function readHeroPosition(storage: Pick<Storage, 'getItem'>, path: string, now = Date.now()): HeroPosition | null {
  try {
    const value = JSON.parse(storage.getItem(HERO_POSITION_KEY) || 'null') as HeroPosition | null;
    if (!value || value.version !== 1 || value.path !== path || now - value.savedAt > 86400000 || value.savedAt > now || !Number.isFinite(value.savedAt) || !Number.isFinite(value.y) || value.y < 0 || !Number.isFinite(value.offset) || !['hero', 'content'].includes(value.zone) || (value.section !== null && !CONTENT_SECTIONS.includes(value.section as typeof CONTENT_SECTIONS[number]))) return null;
    return value;
  } catch { return null; }
}

export function captureHeroPosition(hero: HTMLElement, path: string): HeroPosition {
  const y = window.scrollY;
  const center = y + window.innerHeight / 2;
  const heroEnd = hero.getBoundingClientRect().bottom + y;
  const zone = center < heroEnd ? 'hero' : 'content';
  const sections = CONTENT_SECTIONS.map(id => document.getElementById(id)).filter((element): element is HTMLElement => !!element);
  const section = zone === 'content' ? [...sections].reverse().find(element => element.getBoundingClientRect().top + y <= center) : null;
  return { version: 1, path, savedAt: Date.now(), zone, y, section: section?.id ?? null, offset: section ? y - (section.getBoundingClientRect().top + y) : 0 };
}

export function heroRestoreY(position: HeroPosition, sectionTop?: number) {
  return position.zone === 'hero' ? 0 : Math.max(0, sectionTop === undefined ? position.y : sectionTop + position.offset);
}

// Run before hydration, so browser restoration cannot pause the intro first.
// Only a reload with a valid snapshot written by V1 owns scroll restoration.
export const heroReloadBootstrap = `(() => { try {
  const p = JSON.parse(sessionStorage.getItem('${HERO_POSITION_KEY}') || 'null');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type !== 'reload' || !p || p.version !== 1 || p.path !== location.pathname + location.search || !Number.isFinite(p.savedAt) || Date.now()-p.savedAt > 86400000 || p.savedAt > Date.now() || !Number.isFinite(p.y) || p.y < 0 || !Number.isFinite(p.offset) || !['hero','content'].includes(p.zone) || (p.section !== null && !${JSON.stringify(CONTENT_SECTIONS)}.includes(p.section))) return;
  document.documentElement.dataset.v1Restoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (p.zone === 'hero') window.scrollTo(0, 0);
} catch {} })();`;
