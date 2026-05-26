import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ZodError } from 'zod';

import { getAnimation } from './methods/get-animation.js';
import { getIcon } from './methods/get-icon.js';
import { getScreen } from './methods/get-screen.js';
import { getSound } from './methods/get-sound.js';
import { initProject } from './methods/init-project.js';
import { qcCheck } from './methods/qc-check.js';
import { ErrorResponseSchema } from './schemas/index.js';

type ErrorCode = 'INVALID_INPUT' | 'PROJECT_NOT_FOUND' | 'UPSTREAM_ERROR' | 'LICENSE_RESTRICTED' | 'RATE_LIMITED';

type ToolHandler = (rawInput: unknown) => Promise<unknown>;

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: ToolHandler;
};

function readPackageVersion(): string {
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
    return parsed.version ?? '0.0.0';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read package version from package.json: ${message}`);
  }
}

function createErrorResponse(code: ErrorCode, message: string, details: Record<string, unknown> = {}) {
  return ErrorResponseSchema.parse({
    error: {
      code,
      message,
      details,
    },
  });
}

function toToolError(error: unknown) {
  if (error instanceof ZodError) {
    return createErrorResponse('INVALID_INPUT', 'Input schema validation failed', {
      issues: error.issues,
    });
  }

  const message = error instanceof Error ? error.message : 'Unknown upstream error';
  return createErrorResponse('UPSTREAM_ERROR', message);
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'polish.init_project',
    description: 'Initialize a project with a Style Bible template and references',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['references', 'category', 'platform'],
      properties: {
        references: { type: 'array', items: { type: 'string' } },
        category: { type: 'string', enum: ['productivity', 'social', 'finance', 'health', 'utility'] },
        platform: { type: 'string', enum: ['ios', 'android', 'both'] },
      },
    },
    handler: initProject,
  },
  {
    name: 'polish.get_screen',
    description: 'Get a polished screen code stub and associated assets',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['project_id', 'intent', 'framework'],
      properties: {
        project_id: { type: 'string', format: 'uuid' },
        intent: { type: 'string' },
        framework: { type: 'string', enum: ['swiftui', 'react-native'] },
      },
    },
    handler: getScreen,
  },
  {
    name: 'polish.get_icon',
    description: 'Get icon candidates by semantic intent',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['project_id', 'semantic'],
      properties: {
        project_id: { type: 'string', format: 'uuid' },
        semantic: { type: 'string' },
        preferred_source: { type: 'string', enum: ['sf-symbols', 'iconify', 'lucide', 'phosphor'] },
      },
    },
    handler: getIcon,
  },
  {
    name: 'polish.get_animation',
    description: 'Get animation candidates by intent',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['project_id', 'intent'],
      properties: {
        project_id: { type: 'string', format: 'uuid' },
        intent: { type: 'string' },
        max_results: { type: 'integer', minimum: 1 },
      },
    },
    handler: getAnimation,
  },
  {
    name: 'polish.get_sound',
    description: 'Get sound effect candidates by event',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['project_id', 'event'],
      properties: {
        project_id: { type: 'string', format: 'uuid' },
        event: { type: 'string', enum: ['tap', 'success', 'error', 'notification'] },
        duration_max_ms: { type: 'integer', minimum: 1 },
      },
    },
    handler: getSound,
  },
  {
    name: 'polish.qc_check',
    description: 'Run a QC check against generated artifacts',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['project_id', 'artifact_type', 'content'],
      properties: {
        project_id: { type: 'string', format: 'uuid' },
        artifact_type: { type: 'string', enum: ['swiftui_code', 'image', 'audio'] },
        content: { type: 'string' },
      },
    },
    handler: qcCheck,
  },
];

export function createServer() {
  const server = new Server(
    {
      name: 'polish-layer',
      version: readPackageVersion(),
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOL_DEFINITIONS.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = TOOL_DEFINITIONS.find((candidate) => candidate.name === request.params.name);

    if (!tool) {
      const error = createErrorResponse('INVALID_INPUT', `Unknown tool: ${request.params.name}`);
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify(error) }],
        structuredContent: error,
      };
    }

    try {
      const result = await tool.handler(request.params.arguments ?? {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
      };
    } catch (error) {
      const structuredError = toToolError(error);
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify(structuredError) }],
        structuredContent: structuredError,
      };
    }
  });

  return server;
}

export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
}
