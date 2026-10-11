import { describe, expect, it } from 'vitest';
import { parseProjectCoordinates, globePinCoordinatesError } from './projectCoordinates';

describe('project globe coordinates', () => {
  it('uses latitude then longitude and accepts real hemispheres', () => {
    expect(parseProjectCoordinates('17.385', '78.487')).toEqual([17.385, 78.487]);
    expect(parseProjectCoordinates('-33.9249', '18.4241')).toEqual([-33.9249, 18.4241]);
  });
  it('does not produce a pin from incomplete, non-finite or out-of-range values', () => {
    expect(parseProjectCoordinates('17', '')).toBeNull();
    expect(parseProjectCoordinates('91', '78')).toBeNull();
    expect(parseProjectCoordinates('0', '181')).toBeNull();
    expect(parseProjectCoordinates('NaN', '78')).toBeNull();
  });
  it('requires every standalone pin to have a place and valid coordinates', () => {
    expect(globePinCoordinatesError('Hyderabad', '', '')).toMatch(/look up/);
    expect(globePinCoordinatesError('', '17', '78')).toMatch(/place label/);
    expect(globePinCoordinatesError('Hyderabad', '17.385', '78.487')).toBeNull();
  });
});
