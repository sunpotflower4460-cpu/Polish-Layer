import type { z } from 'zod';

import { OutputValidationError } from '../errors.js';
import { GetAnimationInputSchema, GetAnimationOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetAnimationOutputSchema>;

export async function getAnimation(rawInput: unknown): Promise<Output> {
  const input = GetAnimationInputSchema.parse(rawInput);
  void input;

  // TODO(Phase 2): Connect to LottieFiles connector.

  const output: Output = {
    candidates: [
      {
        url: 'https://example.com/lottie/check.json',
        preview_url: 'https://example.com/lottie/check-preview.gif',
        duration_ms: 1200,
        license_info: {
          type: 'free-commercial',
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://lottiefiles.com/',
        },
      },
    ],
  };

  const result = GetAnimationOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_animation output failed schema validation', result.error);
  }
  return result.data;
}
