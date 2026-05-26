import type { z } from 'zod';

import { GetSoundInputSchema, GetSoundOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetSoundOutputSchema>;

export async function getSound(rawInput: unknown): Promise<Output> {
  const input = GetSoundInputSchema.parse(rawInput);
  void input;

  // TODO(Phase 2): Connect to freesound connector.

  const output: Output = {
    candidates: [
      {
        url: 'https://example.com/sounds/tap.aac',
        format: 'aac',
        loudness_lufs: -16,
        license_info: {
          type: 'CC0',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://freesound.org/',
        },
      },
    ],
  };

  return GetSoundOutputSchema.parse(output);
}
