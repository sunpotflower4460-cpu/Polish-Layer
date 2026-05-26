import { ZodError } from 'zod';

import { googleFontsConnector } from '../../src/connectors/google-fonts.js';
import { getFont } from '../../src/mcp/methods/get-font.js';

describe('get_font method', () => {
  test('returns schema-valid response on success', async () => {
    const searchSpy = vi.spyOn(googleFontsConnector, 'search').mockResolvedValue([
      {
        family: 'Roboto',
        category: 'sans-serif',
        variants: ['regular'],
        subsets: ['latin'],
        source: 'google-fonts',
        preview_url: 'https://fonts.google.com/specimen/Roboto',
        license_info: {
          type: 'free-commercial',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://fonts.google.com/attribution',
        },
      },
    ]);

    const result = await getFont({
      project_id: crypto.randomUUID(),
      semantic: 'Roboto',
      category: 'sans-serif',
      max_results: 10,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.qc_passed).toBe(true);

    searchSpy.mockRestore();
  });

  test('throws INVALID_INPUT equivalent (ZodError) for invalid input', async () => {
    await expect(
      getFont({
        project_id: 'not-uuid',
        semantic: 'Roboto',
      }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  test('throws MISSING_ENV error when API key is missing', async () => {
    const originalApiKey = process.env.GOOGLE_FONTS_API_KEY;
    delete process.env.GOOGLE_FONTS_API_KEY;

    try {
      await expect(
        getFont({
          project_id: crypto.randomUUID(),
          semantic: 'Roboto',
        }),
      ).rejects.toMatchObject({ code: 'MISSING_ENV' });
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.GOOGLE_FONTS_API_KEY;
      } else {
        process.env.GOOGLE_FONTS_API_KEY = originalApiKey;
      }
    }
  });
});
