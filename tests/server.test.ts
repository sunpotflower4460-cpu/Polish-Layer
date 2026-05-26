import { z } from 'zod';

import { createServer, TOOL_DEFINITIONS } from '../src/mcp/server.js';
import {
  GetAnimationInputSchema,
  GetIconInputSchema,
  GetScreenInputSchema,
  GetSoundInputSchema,
  InitProjectInputSchema,
  QcCheckInputSchema,
} from '../src/mcp/schemas/index.js';

function getRequiredKeys(schema: Record<string, unknown>): string[] {
  const required = schema.required;
  if (!Array.isArray(required)) {
    return [];
  }
  return required.filter((value): value is string => typeof value === 'string');
}

function getZodRequiredKeys(schema: z.ZodObject<z.ZodRawShape>): string[] {
  return Object.entries(schema.shape)
    .filter(([, value]) => !(value as z.ZodTypeAny).isOptional())
    .map(([key]) => key);
}

describe('mcp server', () => {
  test('server can be created and has six registered tools', () => {
    const server = createServer();

    expect(server).toBeTruthy();
    expect(TOOL_DEFINITIONS).toHaveLength(6);
  });

  test('tool names follow polish.* format', () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.name).toMatch(/^polish\.[a-z_]+$/);
    }
  });

  test('generated tool inputSchema required fields exactly match zod contracts', () => {
    const expectedRequiredByTool: Record<string, string[]> = {
      'polish.init_project': getZodRequiredKeys(InitProjectInputSchema),
      'polish.get_screen': getZodRequiredKeys(GetScreenInputSchema),
      'polish.get_icon': getZodRequiredKeys(GetIconInputSchema),
      'polish.get_animation': getZodRequiredKeys(GetAnimationInputSchema),
      'polish.get_sound': getZodRequiredKeys(GetSoundInputSchema),
      'polish.qc_check': getZodRequiredKeys(QcCheckInputSchema),
    };

    for (const tool of TOOL_DEFINITIONS) {
      const expectedRequired = expectedRequiredByTool[tool.name];
      expect(expectedRequired).toBeDefined();

      const required = getRequiredKeys(tool.inputSchema);
      expect(new Set(required)).toEqual(new Set(expectedRequired));
    }
  });
});
