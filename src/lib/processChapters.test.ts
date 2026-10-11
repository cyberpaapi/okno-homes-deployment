import { describe, expect, it } from 'vitest';
import hq from '../../config/process-video-hq.json';
import mobile from '../../config/process-video-scrub.json';
import { processPresentationPackets, processFinishOpacity, PROCESS_DAY_RANGES, PROCESS_END_FRAME, PROCESS_FINISH_START, PROCESS_HANDOVER_TIME } from './processChapters';

describe('Process continuous schedule and finish', () => {
  it('covers each day from 1 to 90 exactly once in chapter order', () => {
    const days = Object.values(PROCESS_DAY_RANGES).flatMap(range => {
      const [start,end] = range.match(/\d+/g)!.map(Number);
      return Array.from({length:end-start+1},(_,i)=>start+i);
    });
    expect(days).toEqual(Array.from({length:90},(_,i)=>i+1));
  });
  it('blends monotonically into the house with no opacity jump and soft endpoint slopes', () => {
    expect(processFinishOpacity(PROCESS_FINISH_START)).toBe(0);
    expect(processFinishOpacity(PROCESS_HANDOVER_TIME)).toBe(1);
    expect(processFinishOpacity(25)).toBe(1);
    expect(processFinishOpacity(-1)).toBe(0);
    expect(processFinishOpacity((PROCESS_FINISH_START+PROCESS_HANDOVER_TIME)/2)).toBeCloseTo(.5);
    let previous=0;
    for (let t=PROCESS_FINISH_START;t<PROCESS_HANDOVER_TIME;t+=1/30) {
      const next=processFinishOpacity(t);
      expect(next).toBeGreaterThanOrEqual(previous);
      expect(next-previous).toBeLessThan(.04);
      previous=next;
    }
    expect(processFinishOpacity(PROCESS_FINISH_START+.001)).toBeLessThan(.000001);
    expect(1-processFinishOpacity(PROCESS_HANDOVER_TIME-.001)).toBeLessThan(.000001);
  });
  for (const [name,film] of [['desktop',hq],['mobile',mobile]] as const) {
    it(`${name} retains original frames without a remapped camera jump`, () => {
      const cut=processPresentationPackets(film.packets);
      expect(cut).toHaveLength(PROCESS_END_FRAME+1);
      expect(cut).toEqual(film.packets.slice(0,PROCESS_END_FRAME+1));
    });
  }
});
