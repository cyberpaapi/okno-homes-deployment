import { describe, expect, it } from 'vitest';
import { projectContentHref } from './projectContentHref';

describe('editable Project navigation links', () => {
  it('preserves the current detail return address and allows a safe custom destination', () => {
    expect(projectContentHref('/projects?place={projectId}', '/projects', 'forrest')).toBe('/projects?place=forrest');
    expect(projectContentHref('#collection', '/projects')).toBe('#collection');
    expect(projectContentHref('/journal', '/projects')).toBe('/journal');
  });

  it('rejects unsafe destinations and uses the known local fallback', () => {
    expect(projectContentHref('javascript:alert(1)', '/projects')).toBe('/projects');
    expect(projectContentHref('//untrusted.example', '/projects')).toBe('/projects');
  });
});
