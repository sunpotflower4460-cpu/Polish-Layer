import { GoogleFontsConnector } from '../../src/connectors/google-fonts.js';

describe('google-fonts connector', () => {
  const originalApiKey = process.env.GOOGLE_FONTS_API_KEY;

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.GOOGLE_FONTS_API_KEY;
    } else {
      process.env.GOOGLE_FONTS_API_KEY = originalApiKey;
    }
    vi.restoreAllMocks();
  });

  test('throws MissingEnvError when API key is missing', async () => {
    delete process.env.GOOGLE_FONTS_API_KEY;
    const connector = new GoogleFontsConnector();

    await expect(connector.search({ semantic: 'Roboto' })).rejects.toMatchObject({
      code: 'MISSING_ENV',
      envName: 'GOOGLE_FONTS_API_KEY',
    });
  });

  test('filters by category', async () => {
    process.env.GOOGLE_FONTS_API_KEY = 'test-key';
    const connector = new GoogleFontsConnector();

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              family: 'Roboto',
              category: 'sans-serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
            {
              family: 'Lora',
              category: 'serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const results = await connector.search({ semantic: '', category: 'serif' });

    expect(results).toHaveLength(1);
    expect(results[0]?.family).toBe('Lora');
  });

  test('reuses cache within TTL', async () => {
    process.env.GOOGLE_FONTS_API_KEY = 'test-key';
    const connector = new GoogleFontsConnector();

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              family: 'Roboto',
              category: 'sans-serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await connector.search({ semantic: 'Roboto' });
    await connector.search({ semantic: 'Roboto' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('matches family name by semantic query', async () => {
    process.env.GOOGLE_FONTS_API_KEY = 'test-key';
    const connector = new GoogleFontsConnector();

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              family: 'Modern Antiqua',
              category: 'serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
            {
              family: 'Roboto',
              category: 'sans-serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const results = await connector.search({ semantic: 'modern' });

    expect(results).toHaveLength(1);
    expect(results[0]?.family).toBe('Modern Antiqua');
  });

  test('adds license_info to every candidate', async () => {
    process.env.GOOGLE_FONTS_API_KEY = 'test-key';
    const connector = new GoogleFontsConnector();

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              family: 'Roboto',
              category: 'sans-serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
            {
              family: 'Lora',
              category: 'serif',
              variants: ['regular'],
              subsets: ['latin'],
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const results = await connector.search({ semantic: '' });

    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.license_info.type).toBe('free-commercial');
      expect(item.license_info.attribution_required).toBe(false);
    }
  });
});
