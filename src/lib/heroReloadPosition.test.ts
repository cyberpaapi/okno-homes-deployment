import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureHeroPosition, HERO_POSITION_KEY, heroReloadBootstrap, heroRestoreY, readHeroPosition } from './heroReloadPosition';

const snapshot = { version: 1, path: '/hero-v1', savedAt: Date.now(), zone: 'hero', y: 3200, section: null, offset: 0 };
describe('V1 reload position', () => {
  afterEach(() => { sessionStorage.clear(); document.body.innerHTML = ''; delete document.documentElement.dataset.v1Restoration; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it('resets every hero frame but preserves a lower section relative to its layout', () => {
    expect(heroRestoreY(snapshot as Parameters<typeof heroRestoreY>[0])).toBe(0);
    expect(heroRestoreY({ ...snapshot, version: 1, zone: 'content', section: 'models-preview', offset: 450 }, 14000)).toBe(14450);
    expect(heroRestoreY({ ...snapshot, version: 1, zone: 'content' })).toBe(3200);
  });
  it('ignores stale, malformed and other-route records', () => {
    for (const value of [{...snapshot,path:'/'}, {...snapshot,savedAt:0}, {...snapshot,y:-2}, {...snapshot,offset:null}, {...snapshot,section:'unknown'}, {...snapshot,zone:'unknown'}, {...snapshot,savedAt:Date.now()+10000}]) {
      sessionStorage.setItem(HERO_POSITION_KEY, JSON.stringify(value));
      expect(readHeroPosition(sessionStorage,'/hero-v1')).toBeNull();
    }
    sessionStorage.setItem(HERO_POSITION_KEY, JSON.stringify(snapshot));
    expect(readHeroPosition(sessionStorage,'/hero-v1')?.zone).toBe('hero');
  });
  it('records hero separately from Timeline, Forza and Sustainability', () => {
    const hero = document.createElement('section'); document.body.append(hero);
    vi.spyOn(hero,'getBoundingClientRect').mockImplementation(() => ({bottom:7200-window.scrollY}) as DOMRect);
    for (const [id, top] of [['process',7200],['models-preview',12000],['sustainability-preview',17000]] as const) {
      const section = document.createElement('section'); section.id=id; document.body.append(section);
      vi.spyOn(section,'getBoundingClientRect').mockImplementation(() => ({top:top-window.scrollY}) as DOMRect);
    }
    vi.stubGlobal('innerHeight',720);
    vi.stubGlobal('scrollY',6400); expect(captureHeroPosition(hero,'/').zone).toBe('hero');
    for (const [y,id,offset] of [[7600,'process',400],[12450,'models-preview',450],[17300,'sustainability-preview',300]] as const) {
      vi.stubGlobal('scrollY',y); expect(captureHeroPosition(hero,'/')).toMatchObject({zone:'content',section:id,offset});
    }
  });
  it('takes browser restoration only on reload, keeping back/forward navigation untouched', () => {
    sessionStorage.setItem(HERO_POSITION_KEY, JSON.stringify({...snapshot,path:location.pathname+location.search}));
    vi.spyOn(performance,'getEntriesByType').mockReturnValue([{type:'back_forward'}] as PerformanceNavigationTiming[]);
    const scroll = vi.spyOn(window,'scrollTo').mockImplementation(() => {});
    Function(heroReloadBootstrap)(); expect(scroll).not.toHaveBeenCalled();
    vi.mocked(performance.getEntriesByType).mockReturnValue([{type:'reload'}] as PerformanceNavigationTiming[]);
    history.scrollRestoration='auto'; Function(heroReloadBootstrap)();
    expect(history.scrollRestoration).toBe('manual'); expect(scroll).toHaveBeenCalledWith(0,0);
    expect(document.documentElement.dataset.v1Restoration).toBe('auto');
  });
});
