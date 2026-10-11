import { parseProjectCoordinates } from './projectCoordinates';

type NominatimPlace = { place_id?: number; display_name?: string; lat?: string; lon?: string; addresstype?: string };
export type GeocodePlace = { id: string; label: string; latitude: number; longitude: number; kind: string };

export function normalizePlaces(value: unknown): GeocodePlace[] {
  if (!Array.isArray(value)) return [];
  const placeRank = (kind: string) => ['city', 'town', 'village', 'hamlet', 'municipality', 'suburb', 'neighbourhood'].indexOf(kind);
  return value.flatMap((entry: NominatimPlace, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const coordinates = parseProjectCoordinates(entry.lat, entry.lon);
    if (!coordinates || typeof entry.display_name !== 'string' || !entry.display_name.trim()) return [];
    return [{ id: String(entry.place_id ?? index), label: entry.display_name, latitude: coordinates[0], longitude: coordinates[1], kind: entry.addresstype || 'place' }];
  }).sort((left, right) => {
    const leftRank = placeRank(left.kind);
    const rightRank = placeRank(right.kind);
    return (leftRank < 0 ? 100 : leftRank) - (rightRank < 0 ? 100 : rightRank);
  }).slice(0, 5);
}
