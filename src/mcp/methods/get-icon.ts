import type { z } from 'zod';

import { sfSymbolsConnector } from '../../connectors/sf-symbols.js';
import { OutputValidationError } from '../errors.js';
import { GetIconInputSchema, GetIconOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetIconOutputSchema>;

export async function getIcon(rawInput: unknown): Promise<Output> {
  const input = GetIconInputSchema.parse(rawInput);

  let candidates: Output['candidates'] = [];
  if (!input.preferred_source || input.preferred_source === 'sf-symbols') {
    candidates = await sfSymbolsConnector.search({ semantic: input.semantic });
  } else {
    throw new Error('Connector not implemented in Phase 2A (will be added in Phase 2B)');
  }

  const output: Output = { candidates };

  const result = GetIconOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_icon output failed schema validation', result.error);
  }
  return result.data;
}
