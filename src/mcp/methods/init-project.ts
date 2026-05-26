import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import type { z } from 'zod';

import { OutputValidationError } from '../errors.js';
import {
  InitProjectInputSchema,
  InitProjectOutputSchema,
  StyleBibleSchema,
  StyleBibleTemplateSchema,
} from '../schemas/index.js';
import { resolveFromRoot } from '../../utils/paths.js';

type Output = z.infer<typeof InitProjectOutputSchema>;
const DEFAULT_STYLE_BIBLE_VERSION = '1.0.0';

const TEMPLATE_FILES = {
  productivity: 'productivity.json',
  social: 'social.json',
  finance: 'finance.json',
  health: 'health.json',
  utility: 'utility.json',
} as const;

export async function initProject(rawInput: unknown): Promise<Output> {
  const input = InitProjectInputSchema.parse(rawInput);

  // TODO(Phase 3): Replace template-only bootstrap with generated Style Bible refinement.
  // NOTE: distribution-time template bundling is out of Phase 1 scope.

  const templatePath = resolveFromRoot('templates/style-bible', TEMPLATE_FILES[input.category]);
  const templateText = await readFile(templatePath, 'utf-8');
  const parsedTemplate = StyleBibleTemplateSchema.safeParse(JSON.parse(templateText));
  if (!parsedTemplate.success) {
    throw new OutputValidationError('init_project template failed schema validation', parsedTemplate.error);
  }
  const template = parsedTemplate.data;
  const projectId = randomUUID();

  const parsedStyleBible = StyleBibleSchema.safeParse({
    ...template,
    category: input.category,
    platform: input.platform,
    references: input.references,
    project_id: projectId,
    version: template.version ?? DEFAULT_STYLE_BIBLE_VERSION,
  });
  if (!parsedStyleBible.success) {
    throw new OutputValidationError('init_project style_bible failed schema validation', parsedStyleBible.error);
  }
  const styleBible = parsedStyleBible.data;

  const output: Output = {
    project_id: styleBible.project_id,
    style_bible: styleBible,
  };

  const result = InitProjectOutputSchema.safeParse(output);
  if (!result.success) {
    throw new OutputValidationError('init_project output failed schema validation', result.error);
  }
  return result.data;
}
