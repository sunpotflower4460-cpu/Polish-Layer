import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ErrorResponseSchema,
  GetAnimationInputSchema,
  GetIconInputSchema,
  GetScreenInputSchema,
  GetSoundInputSchema,
  InitProjectInputSchema,
  LicenseInfoSchema,
  QcCheckInputSchema,
  StyleBibleSchema,
  StyleBibleTemplateSchema,
} from '../src/mcp/schemas/index.js';

describe('schemas', () => {
  test('accepts valid inputs', () => {
    expect(() =>
      InitProjectInputSchema.parse({
        references: ['Linear'],
        category: 'productivity',
        platform: 'ios',
      }),
    ).not.toThrow();

    expect(() =>
      GetScreenInputSchema.parse({
        project_id: crypto.randomUUID(),
        intent: 'ログイン画面',
        framework: 'swiftui',
      }),
    ).not.toThrow();

    expect(() =>
      GetIconInputSchema.parse({
        project_id: crypto.randomUUID(),
        semantic: '設定',
        preferred_source: 'sf-symbols',
      }),
    ).not.toThrow();

    expect(() =>
      GetAnimationInputSchema.parse({
        project_id: crypto.randomUUID(),
        intent: '成功時のチェックマーク',
        max_results: 3,
      }),
    ).not.toThrow();

    expect(() =>
      GetSoundInputSchema.parse({
        project_id: crypto.randomUUID(),
        event: 'tap',
        duration_max_ms: 300,
      }),
    ).not.toThrow();

    expect(() =>
      QcCheckInputSchema.parse({
        project_id: crypto.randomUUID(),
        artifact_type: 'swiftui_code',
        content: 'struct ContentView: View {}',
      }),
    ).not.toThrow();
  });

  test('rejects invalid inputs', () => {
    expect(() =>
      InitProjectInputSchema.parse({
        category: 'productivity',
        platform: 'ios',
      }),
    ).toThrow();

    expect(() =>
      GetIconInputSchema.parse({
        project_id: 'not-a-uuid',
        semantic: '設定',
      }),
    ).toThrow();

    expect(() =>
      GetSoundInputSchema.parse({
        project_id: crypto.randomUUID(),
        event: 'invalid-event',
      }),
    ).toThrow();

    expect(() =>
      QcCheckInputSchema.parse({
        project_id: crypto.randomUUID(),
        artifact_type: 'video',
        content: 'x',
      }),
    ).toThrow();
  });

  test('license info enum matches docs/05 definition', () => {
    const validTypes = [
      'CC0',
      'MIT',
      'Apache-2.0',
      'free-commercial',
      'paid',
      'apple-system',
      'restricted',
    ] as const;

    for (const type of validTypes) {
      expect(() =>
        LicenseInfoSchema.parse({
          type,
          attribution_required: false,
          commercial_use: true,
          source_url: 'https://example.com',
        }),
      ).not.toThrow();
    }

    expect(() =>
      LicenseInfoSchema.parse({
        type: 'GPL',
        attribution_required: false,
        commercial_use: true,
        source_url: 'https://example.com',
      }),
    ).toThrow();
  });

  test('error response schema validates supported error codes', () => {
    expect(() =>
      ErrorResponseSchema.parse({
        error: {
          code: 'INVALID_INPUT',
          message: 'bad',
          details: {},
        },
      }),
    ).not.toThrow();

    expect(() =>
      ErrorResponseSchema.parse({
        error: {
          code: 'UNKNOWN',
          message: 'bad',
          details: {},
        },
      }),
    ).toThrow();
  });

  test('style bible template allows missing version while finalized schema requires version', () => {
    const templatePath = resolve(process.cwd(), 'templates/style-bible/productivity.json');
    const template = JSON.parse(readFileSync(templatePath, 'utf-8')) as Record<string, unknown>;
    const withoutVersion = { ...template };
    delete withoutVersion.version;

    expect(() => StyleBibleTemplateSchema.parse(withoutVersion)).not.toThrow();
    expect(() =>
      StyleBibleSchema.parse({
        ...withoutVersion,
        project_id: crypto.randomUUID(),
      }),
    ).toThrow();
  });

  test('all committed style-bible templates satisfy template schema', () => {
    const categories = ['productivity', 'social', 'finance', 'health', 'utility'];
    for (const category of categories) {
      const templatePath = resolve(process.cwd(), `templates/style-bible/${category}.json`);
      const template = JSON.parse(readFileSync(templatePath, 'utf-8'));
      expect(() => StyleBibleTemplateSchema.parse(template)).not.toThrow();
    }
  });
});
