import { adminTokenConfigured, isAdminAuthorized } from '@/lib/siteContentStore';
import { normalizePlaces, type GeocodePlace } from '@/lib/projectGeocoding';

export const runtime = 'nodejs';

const cache = new Map<string, { at: number; results: GeocodePlace[] }>();
let nextRequestAt = 0;
let requestQueue = Promise.resolve();
const CACHE_MS = 24 * 60 * 60 * 1000;

async function lookup(query: string): Promise<GeocodePlace[]> {
  const key = query.toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.results;
  const pending = requestQueue.then(async () => {
    const wait = Math.max(0, nextRequestAt - Date.now());
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    nextRequestAt = Date.now() + 1100;
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '5');
    const response = await fetch(url, { headers: {
      'User-Agent': 'OKNO-FinalShowcase-LocalAdmin/1.0 (local editorial project geocoding; https://oknohomes.com)',
      'Accept-Language': 'en',
    }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!response.ok) throw new Error('Location lookup is temporarily unavailable. Try again or enter coordinates manually.');
    const results = normalizePlaces(await response.json());
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), results });
    return results;
  });
  requestQueue = pending.then(() => {}, () => {});
  return pending;
}

export async function GET(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: 'Admin access is not configured.' }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: 'Admin token is incorrect.' }, { status: 401 });
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (query.length < 2 || query.length > 120) return Response.json({ error: 'Enter a place name between 2 and 120 characters.' }, { status: 400 });
  try {
    return Response.json({ results: await lookup(query), attribution: '© OpenStreetMap contributors' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Location lookup is temporarily unavailable. Try again or enter coordinates manually.' }, { status: 503 });
  }
}
