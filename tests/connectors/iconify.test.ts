import { IconifyConnector } from '../../src/connectors/iconify.js';

describe('iconify connector', () => {
  test('returns results for english query', async () => {
    const connector = new IconifyConnector();
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ icons: ['mdi:home', 'ph:house'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const results = await connector.search({ semantic: 'home' });

    expect(results).toHaveLength(2);
    expect(results[0]?.name).toBe('mdi:home');
    expect(results[0]?.source).toBe('iconify');

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('query=home');
    expect(requestUrl).toContain('limit=10');

    fetchMock.mockRestore();
  });

  test('handles empty results', async () => {
    const connector = new IconifyConnector();
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ icons: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(connector.search({ semantic: 'unknown' })).resolves.toEqual([]);

    fetchMock.mockRestore();
  });

  test('returns UPSTREAM_ERROR on network error', async () => {
    const connector = new IconifyConnector();
    const fetchMock = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network failed'));

    await expect(connector.search({ semantic: 'home' })).rejects.toMatchObject({
      code: 'UPSTREAM_ERROR',
    });

    fetchMock.mockRestore();
  });

  test('adds license_info to every candidate', async () => {
    const connector = new IconifyConnector();
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ icons: ['mdi:home', 'mdi:account'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const results = await connector.search({ semantic: 'home' });

    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.license_info.type).toBe('free-commercial');
      expect(item.license_info.commercial_use).toBe(true);
    }

    fetchMock.mockRestore();
  });
});
