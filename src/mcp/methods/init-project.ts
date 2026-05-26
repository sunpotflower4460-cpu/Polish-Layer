import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { z } from 'zod';

import {
  InitProjectInputSchema,
  InitProjectOutputSchema,
  StyleBibleSchema,
  StyleBibleTemplateSchema,
} from '../schemas/index.js';

type Output = z.infer<typeof InitProjectOutputSchema>;

const currentDir = dirname(fileURLToPath(import.meta.url));

export async function initProject(rawInput: unknown): Promise<Output> {
  const input = InitProjectInputSchema.parse(rawInput);

  // TODO(Phase 3): Replace template-only bootstrap with generated Style Bible refinement.

  const templatePath = resolve(currentDir, '../../../templates/style-bible', `${input.category}.json`);
  const templateText = await readFile(templatePath, 'utf-8');
  const template = StyleBibleTemplateSchema.parse(JSON.parse(templateText));

  const styleBible = StyleBibleSchema.parse({
    ...template,
    category: input.category,
    platform: input.platform,
    references: input.references,
    project_id: randomUUID(),
    version: template.version,
  });

  const output: Output = {
    project_id: styleBible.project_id,
    style_bible: styleBible,
  };

  return InitProjectOutputSchema.parse(output);
}
