import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ZodError } from 'zod';

import { OutputValidationError } from '../src/mcp/errors.js';
import { getAnimation } from '../src/mcp/methods/get-animation.js';
import { getIcon } from '../src/mcp/methods/get-icon.js';
import { getScreen } from '../src/mcp/methods/get-screen.js';
import { getSound } from '../src/mcp/methods/get-sound.js';
import { initProject } from '../src/mcp/methods/init-project.js';
import { qcCheck } from '../src/mcp/methods/qc-check.js';
import {
  GetAnimationOutputSchema,
  GetIconOutputSchema,
  GetScreenOutputSchema,
  GetSoundOutputSchema,
  QcCheckOutputSchema,
  StyleBibleSchema,
} from '../src/mcp/schemas/index.js';

describe('methods', () => {
  test('all stub methods return schema-valid dummy responses', async () => {
    const project_id = crypto.randomUUID();

    const screen = await getScreen({ project_id, intent: 'ログイン画面', framework: 'swiftui' });
    const icon = await getIcon({ project_id, semantic: '設定', preferred_source: 'sf-symbols' });
    const animation = await getAnimation({ project_id, intent: '成功時アニメ', max_results: 1 });
    const sound = await getSound({ project_id, event: 'tap', duration_max_ms: 500 });
    const qc = await qcCheck({ project_id, artifact_type: 'swiftui_code', content: 'struct S {}' });

    expect(() => GetScreenOutputSchema.parse(screen)).not.toThrow();
    expect(() => GetIconOutputSchema.parse(icon)).not.toThrow();
    expect(() => GetAnimationOutputSchema.parse(animation)).not.toThrow();
    expect(() => GetSoundOutputSchema.parse(sound)).not.toThrow();
    expect(() => QcCheckOutputSchema.parse(qc)).not.toThrow();
  });

  test('init-project loads template and injects uuid/references', async () => {
    const references = ['Linear', 'Things 3'];

    const result = await initProject({
      references,
      category: 'productivity',
      platform: 'ios',
    });

    expect(result.project_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result.style_bible.project_id).toBe(result.project_id);
    expect(result.style_bible.references).toEqual(references);
    expect(result.style_bible.category).toBe('productivity');
    expect(result.style_bible.platform).toBe('ios');

    expect(() => StyleBibleSchema.parse(result.style_bible)).not.toThrow();
  });

  test('init-project output aligns with specs/style-bible.schema.json contract keys', async () => {
    const specPath = resolve(process.cwd(), 'specs/style-bible.schema.json');
    const spec = JSON.parse(readFileSync(specPath, 'utf-8')) as {
      required: string[];
      properties: Record<string, unknown>;
    };

    const result = await initProject({
      references: ['Linear'],
      category: 'finance',
      platform: 'ios',
    });

    const requiredKeys = new Set(spec.required);
    for (const key of requiredKeys) {
      expect(result.style_bible).toHaveProperty(key);
    }
    expect(Object.keys(result.style_bible).sort()).toEqual(Object.keys(spec.properties).sort());
  });

  test('invalid input throws ZodError', async () => {
    await expect(getIcon({ project_id: 'not-a-uuid', semantic: '設定' })).rejects.toBeInstanceOf(ZodError);
  });

  test('output schema mismatch throws OutputValidationError', async () => {
    const safeParseSpy = vi.spyOn(GetIconOutputSchema, 'safeParse');
    safeParseSpy.mockReturnValueOnce({
      success: false,
      error: new ZodError([]),
    });

    await expect(
      getIcon({
        project_id: crypto.randomUUID(),
        semantic: '設定',
      }),
    ).rejects.toBeInstanceOf(OutputValidationError);

    safeParseSpy.mockRestore();
  });
});
