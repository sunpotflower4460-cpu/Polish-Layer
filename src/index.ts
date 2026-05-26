import { startServer } from './mcp/server.js';

startServer().catch((err) => {
  console.error('Failed to start Polish Layer MCP server:', err);
  process.exit(1);
});
