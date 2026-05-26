import type { z } from 'zod';

import { googleFontsConnector } from '../../connectors/google-fonts.js';
import { OutputValidationError } from '../errors.js';
import { GetFontInputSchema, GetFontOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetFontOutputSchema>;

export async function getFont(rawInput: unknown): Promise<Output> {
  const input = GetFontInputSchema.parse(rawInput);

  const candidates = await googleFontsConnector.search({
    semantic: input.semantic,
    category: input.category,
    max_results: input.max_results,
  });

  const output: Output = {
    candidates,
    qc_passed: true,
  };

  const result = GetFontOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_font output failed schema validation', result.error);
  }

  return result.data;
}
