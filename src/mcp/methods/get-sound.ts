import type { z } from 'zod';

import { OutputValidationError } from '../errors.js';
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

  const result = GetSoundOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_sound output failed schema validation', result.error);
  }
  return result.data;
}
