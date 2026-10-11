import { expect, it } from 'vitest';
import { atlasLocations } from './projectAtlas';
import { globePinsFromCollection, initialGlobePinItems } from './globePinCollections';

it('keeps preview pins independent of project records', () => {
  expect(globePinsFromCollection(initialGlobePinItems)).toEqual(atlasLocations);
  expect(initialGlobePinItems[0].fields).not.toHaveProperty('projectId');
});

it('shows only valid standalone location pins and respects an empty published list', () => {
  expect(globePinsFromCollection([])).toEqual([]);
  expect(globePinsFromCollection([
    { id: 'qa-place', fields: { label: 'Hyderabad, Telangana, India', latitude: '17.385', longitude: '78.487' } },
    { id: 'incomplete', fields: { label: 'Unknown', latitude: '', longitude: '' } },
  ])).toEqual([{ id: 'qa-place', city: 'Hyderabad, Telangana, India', coordinates: [17.385, 78.487] }]);
});
