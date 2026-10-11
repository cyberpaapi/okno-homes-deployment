/** Keep page-level CMS actions on this website, even if an older override is malformed. */
export function localDestination(value: string | undefined, fallback: string) {
  const destination = value?.trim();
  if (!destination || /[\s\\]/.test(destination)) return fallback;
  if (destination.startsWith("/") && !destination.startsWith("//")) return destination;
  if (destination.startsWith("#") && destination.length > 1) return destination;
  return fallback;
}
