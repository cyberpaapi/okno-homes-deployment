import { describe, expect, it } from 'vitest';
import hq from '../../config/process-video-hq.json';
import mobile from '../../config/process-video-scrub.json';
import { processPresentationPackets, PROCESS_END_FRAME, PROCESS_HANDOVER_TIME, PROCESS_FPS } from './processChapters';

for (const [name, film] of [['desktop', hq], ['mobile', mobile]] as const) {
  describe(`${name} Process handover cut`, () => {
    it('preserves the earlier frames and holds the original resolved house without the floating roof/outro', () => {
      const original = JSON.stringify(film.packets);
      const cut = processPresentationPackets(film.packets);
      const boundary = Math.round(PROCESS_HANDOVER_TIME * PROCESS_FPS);
      expect(cut).toHaveLength(PROCESS_END_FRAME + 1);
      expect(cut.slice(0, boundary)).toEqual(film.packets.slice(0, boundary));
      for (let index = boundary; index < cut.length; index++) {
        expect(cut[index]).toEqual([film.packets[768][0], film.packets[768][1], Math.round(index / PROCESS_FPS * 1e6), 1]);
      }
      expect(JSON.stringify(film.packets)).toBe(original);
    });
  });
}
