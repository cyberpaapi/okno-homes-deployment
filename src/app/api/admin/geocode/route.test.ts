import { afterEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/siteContentStore', () => ({
  adminTokenConfigured: () => true,
  isAdminAuthorized: (request: Request) => request.headers.get('Authorization') === 'Bearer test-token',
}));

import { GET } from './route';
import { normalizePlaces } from '@/lib/projectGeocoding';

afterEach(() => { vi.unstubAllGlobals(); });

it('filters malformed geocoder responses and retains latitude/longitude order', () => {
  expect(normalizePlaces([null, { place_id: 12, display_name: 'Hyderabad, India', lat: '17.385', lon: '78.487', addresstype: 'city' }, { display_name: 'Invalid', lat: '95', lon: '0' }])).toEqual([
    { id: '12', label: 'Hyderabad, India', latitude: 17.385, longitude: 78.487, kind: 'city' },
  ]);
});

it('offers a town ahead of a similarly named station', () => {
  const results = normalizePlaces([
    { display_name: 'Lonavala railway station', lat: '18.7503', lon: '73.4069', addresstype: 'railway' },
    { display_name: 'Lonavala, Maharashtra, India', lat: '18.7548', lon: '73.4016', addresstype: 'town' },
  ]);
  expect(results[0].kind).toBe('town');
});

it('requires admin authentication and an explicit place query', async () => {
  expect((await GET(new Request('http://localhost/api/admin/geocode?q=Hyderabad'))).status).toBe(401);
  expect((await GET(new Request('http://localhost/api/admin/geocode?q=x', { headers: { Authorization: 'Bearer test-token' } }))).status).toBe(400);
});

it('looks up a place only through the authenticated server and returns a selectable result', async () => {
  const upstream = vi.fn(async (url: URL, options?: RequestInit) => {
    expect(url.hostname).toBe('nominatim.openstreetmap.org');
    expect(options?.headers).toMatchObject({ 'Accept-Language': 'en' });
    return Response.json([{ place_id: 12, display_name: 'Hyderabad, Telangana, India', lat: '17.385', lon: '78.487', addresstype: 'city' }]);
  });
  vi.stubGlobal('fetch', upstream);
  const response = await GET(new Request('http://localhost/api/admin/geocode?q=Hyderabad%2C%20India', { headers: { Authorization: 'Bearer test-token' } }));
  expect(response.status).toBe(200);
  expect((await response.json()).results).toEqual([{ id: '12', label: 'Hyderabad, Telangana, India', latitude: 17.385, longitude: 78.487, kind: 'city' }]);
  expect(upstream).toHaveBeenCalledOnce();
  expect(String(upstream.mock.calls[0][0])).toContain('nominatim.openstreetmap.org/search');
});
