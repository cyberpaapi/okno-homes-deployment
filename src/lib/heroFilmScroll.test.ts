import { describe,expect,it } from 'vitest';
import { heroFilmLastTime,heroFilmProgress } from './heroFilmScroll';

describe('Hero film scroll mapping',()=>{
  it('completes the actual final frame even with rounded native duration',()=>{
    for(const duration of [577/24,24.041667,24.042]) {
      expect(heroFilmLastTime(duration)).toBe(24);
      expect(24/heroFilmLastTime(duration)).toBe(1);
    }
  });
  it('maps normal document position without gesture clamping',()=>{
    expect(heroFilmProgress(0)).toBe(0);
    expect(heroFilmProgress(.5)).toBeCloseTo(.5);
    expect(heroFilmProgress(1)).toBe(1);
    expect(heroFilmProgress(2)).toBe(1);
  });
});
