import { atlasLocations } from './projectAtlas';
import { parseProjectCoordinates } from '@/lib/projectCoordinates';
import type { ContentItem } from '@/lib/contentCollections';

export type GlobePin = { id: string; city: string; coordinates: readonly [number, number] };

// The existing preview places are independent of the project/photography library.
export const initialGlobePinItems: ContentItem[] = atlasLocations.map(({ id, city, coordinates }) => ({
  id,
  fields: { label: city, latitude: String(coordinates[0]), longitude: String(coordinates[1]) },
}));

export function globePinsFromCollection(items: ContentItem[]): GlobePin[] {
  return items.flatMap(item => {
    const city = item.fields.label?.trim();
    const coordinates = parseProjectCoordinates(item.fields.latitude, item.fields.longitude);
    return city && coordinates ? [{ id: item.id, city, coordinates }] : [];
  });
}
