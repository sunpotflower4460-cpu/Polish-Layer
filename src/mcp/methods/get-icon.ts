import type { z } from 'zod';

import { GetIconInputSchema, GetIconOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetIconOutputSchema>;

export async function getIcon(rawInput: unknown): Promise<Output> {
  const input = GetIconInputSchema.parse(rawInput);
  void input;

  // TODO(Phase 2): Connect to SF Symbols / Iconify connectors.

  const output: Output = {
    candidates: [
      {
        name: 'gearshape',
        source: 'sf-symbols',
        preview_url: 'https://example.com/preview/gearshape.svg',
        license_info: {
          type: 'apple-system',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://developer.apple.com/sf-symbols/',
        },
      },
    ],
  };

  return GetIconOutputSchema.parse(output);
}
