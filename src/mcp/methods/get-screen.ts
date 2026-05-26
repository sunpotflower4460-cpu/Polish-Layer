import type { z } from 'zod';

import { OutputValidationError } from '../errors.js';
import { GetScreenInputSchema, GetScreenOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetScreenOutputSchema>;

export async function getScreen(rawInput: unknown): Promise<Output> {
  const input = GetScreenInputSchema.parse(rawInput);
  void input;

  // TODO(Phase 5): Generate framework-specific screen code from Style Bible + connectors.

  const output: Output = {
    code: '// polish-layer: generated\n// phase: 1\nstruct StubScreen {}',
    assets: [
      {
        type: 'icon',
        name: 'envelope',
        source: 'sf-symbols',
        license_info: {
          type: 'apple-system',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://developer.apple.com/sf-symbols/',
        },
      },
      {
        type: 'lottie',
        url: 'https://example.com/lottie/success.json',
        license_info: {
          type: 'free-commercial',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://lottiefiles.com/',
        },
      },
    ],
    qc_passed: true,
    warnings: [],
  };

  const result = GetScreenOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_screen output failed schema validation', result.error);
  }
  return result.data;
}
