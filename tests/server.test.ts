import { createServer, TOOL_DEFINITIONS } from '../src/mcp/server.js';
import {
  GetScreenInputSchema,
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

  test('generated tool inputSchema required fields align with zod contracts', () => {
    const expectedRequiredByTool: Record<string, string[]> = {
      'polish.init_project': Object.keys(InitProjectInputSchema.shape),
      'polish.get_screen': Object.keys(GetScreenInputSchema.shape),
      'polish.get_icon': ['project_id', 'semantic'],
      'polish.get_animation': ['project_id', 'intent'],
      'polish.get_sound': ['project_id', 'event'],
      'polish.qc_check': Object.keys(QcCheckInputSchema.shape),
    };

    for (const tool of TOOL_DEFINITIONS) {
      const expectedRequired = expectedRequiredByTool[tool.name];
      expect(expectedRequired).toBeDefined();

      const required = getRequiredKeys(tool.inputSchema);
      for (const key of expectedRequired) {
        expect(required).toContain(key);
      }
    }
  });
});
