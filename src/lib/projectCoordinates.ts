export type ProjectCoordinates = readonly [number, number];

export function parseProjectCoordinates(latitude: string | undefined, longitude: string | undefined): ProjectCoordinates | null {
  if (!latitude?.trim() || !longitude?.trim()) return null;
  const decimal = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (!decimal.test(latitude.trim()) || !decimal.test(longitude.trim())) return null;
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return [lat, lon];
}

export function globePinCoordinatesError(location: string | undefined, latitude: string | undefined, longitude: string | undefined): string | null {
  const hasLatitude = Boolean(latitude?.trim());
  const hasLongitude = Boolean(longitude?.trim());
  const hasLocation = Boolean(location?.trim());
  if (!hasLocation) return 'add a place label for this globe pin';
  if (location!.trim().length > 140) return 'keep the place label under 140 characters';
  if (!hasLatitude || !hasLongitude) return 'look up the location or enter both latitude and longitude';
  if (!parseProjectCoordinates(latitude, longitude)) return 'enter valid coordinates (latitude −90 to 90, longitude −180 to 180)';
  return null;
}
