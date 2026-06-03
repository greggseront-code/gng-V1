import { apiFetch } from './api-client';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('apiFetch appelle /api + path et retourne le JSON', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ ok: true }), { status: 200 }),
  );

  const result = await apiFetch<{ ok: boolean }>('/health');

  expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
    headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
  }));
  expect(result).toEqual({ ok: true });
});

test('apiFetch lève une erreur si la réponse n\'est pas ok', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ error: 'Non trouvé' }), { status: 404 }),
  );

  await expect(apiFetch('/nope')).rejects.toThrow('Non trouvé');
});
