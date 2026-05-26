import { createServer, TOOL_DEFINITIONS } from '../src/mcp/server.js';

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
});
