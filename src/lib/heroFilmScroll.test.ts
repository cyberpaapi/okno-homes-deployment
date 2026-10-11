import { describe,expect,it } from 'vitest';
import { heroFilmProgress,limitHeroFilmScroll } from './heroFilmScroll';

describe('Hero gestures stay within the presented film',()=>{
  it('bounds oversized forward and reverse gestures instead of queueing a skip',()=>{
    const forward=limitHeroFilmScroll(1900,6500,0,6480,0);
    expect(heroFilmProgress(forward/6480)).toBeCloseTo(.035);
    const reverse=limitHeroFilmScroll(7000,3000,0,6480,1);
    expect(heroFilmProgress(reverse/6480)).toBeCloseTo(.965);
    expect(limitHeroFilmScroll(6500,7500,0,6480,1)).toBe(7500);
    expect(limitHeroFilmScroll(1900,0,0,6480,0)).toBe(0);
  });
  it('does not rewind an existing position or impede lower sections and empty tracks',()=>{
    expect(limitHeroFilmScroll(4000,4200,0,6480,.1)).toBe(4000);
    expect(limitHeroFilmScroll(9000,9200,0,6480,0)).toBe(9200);
    expect(limitHeroFilmScroll(0,200,0,0,0)).toBe(200);
    expect(heroFilmProgress(.3)).toBe(0);expect(heroFilmProgress(.965)).toBeCloseTo(1);
  });
});
