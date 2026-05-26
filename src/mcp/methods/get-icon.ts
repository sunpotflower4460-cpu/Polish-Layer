import type { z } from 'zod';

import { iconifyConnector } from '../../connectors/iconify.js';
import { sfSymbolsConnector } from '../../connectors/sf-symbols.js';
import { ConnectorNotImplementedError, OutputValidationError } from '../errors.js';
import { GetIconInputSchema, GetIconOutputSchema } from '../schemas/index.js';

type Output = z.infer<typeof GetIconOutputSchema>;

export async function getIcon(rawInput: unknown): Promise<Output> {
  const input = GetIconInputSchema.parse(rawInput);

  let candidates: Output['candidates'] = [];
  if (!input.preferred_source || input.preferred_source === 'sf-symbols') {
    candidates = await sfSymbolsConnector.search({ semantic: input.semantic });
  } else if (input.preferred_source === 'iconify') {
    candidates = await iconifyConnector.search({ semantic: input.semantic });
  } else {
    throw new ConnectorNotImplementedError(input.preferred_source);
  }

  const output: Output = { candidates };

  const result = GetIconOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('get_icon output failed schema validation', result.error);
  }
  return result.data;
}
