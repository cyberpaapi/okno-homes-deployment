import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { geoArea, type GeoPermissibleObjects } from 'd3';
import { join } from 'node:path';
import { atlasLocations, atlasProjects, findAtlasProject } from './projectAtlas';
import media from './realProjectMedia.json';

describe('project atlas destinations', () => {
  it('keeps simplified country rings from filling the spherical complement', () => {
    const geography = JSON.parse(readFileSync(join(process.cwd(), 'public/assets/projects/atlas/countries-50m.geojson'), 'utf8'));
    for (const feature of geography.features as GeoPermissibleObjects[]) {
      expect(geoArea(feature)).toBeLessThan(Math.PI);
    }
  });
  it('uses the seven supplied collections and never invents unapproved map coordinates', () => {
    expect(atlasProjects.map(p => p.id)).toEqual(['forrest', 'kioo', 'kray-sangareddy', 'lakewood', 'octapod-layana', 'rasa-vikarabad', 'trib-birdseye']);
    expect(new Set(atlasProjects.map(p => p.href)).size).toBe(7);
    for (const project of atlasProjects) {
      expect(project.coordinates).toBeNull();
      expect(project.locationStatus).toBe('awaiting-client');
      expect(project.href).toBe(`/projects/${project.id}`);
      expect(project.gallery.length).toBeGreaterThanOrEqual(3);
    }
    expect(findAtlasProject('lonavala')).toBeUndefined();
  });
  it('preserves the ten preview pins without fabricating their real-project assignments', () => {
    expect(atlasLocations).toHaveLength(10);
    expect(atlasLocations.find(location => location.id === 'hyderabad')?.coordinates).toEqual([17.385, 78.487]);
    expect(atlasLocations.every(location => !('projectId' in location))).toBe(true);
  });
  it('uses separate real media for each project with browser-ready local films', () => {
    for (const project of atlasProjects) {
      expect(project.mediaStatus).toBe('client-supplied');
      expect(project.gallery).toEqual(media.find(p => p.id === project.id)?.gallery);
      for (const film of project.films) {
        expect(existsSync(join(process.cwd(), 'public', film.src))).toBe(true);
        expect(existsSync(join(process.cwd(), 'public', film.poster))).toBe(true);
        expect(film.duration).toBeGreaterThan(0);
      }
      expect(project.gallery.length).toBeGreaterThanOrEqual(1);
      for (const image of project.gallery) {
        expect(image.src).toMatch(/^\/assets\/projects\//);
        expect(existsSync(join(process.cwd(), 'public', image.src))).toBe(true);
        expect(image.alt).toBeTruthy();
        expect(Math.max(image.width ?? 0, image.height ?? 0)).toBeGreaterThanOrEqual(3000);
      }
    }
  });
});
