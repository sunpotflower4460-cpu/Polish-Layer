import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ZodError, type z } from 'zod';

import { OutputValidationError, ConnectorNotImplementedError } from './errors.js';
import { getAnimation } from './methods/get-animation.js';
import { getFont } from './methods/get-font.js';
import { getIcon } from './methods/get-icon.js';
import { getScreen } from './methods/get-screen.js';
import { getSound } from './methods/get-sound.js';
import { initProject } from './methods/init-project.js';
import { qcCheck } from './methods/qc-check.js';
import {
  ErrorResponseSchema,
  GetAnimationInputSchema,
  GetFontInputSchema,
  GetIconInputSchema,
  GetScreenInputSchema,
  GetSoundInputSchema,
  InitProjectInputSchema,
  QcCheckInputSchema,
} from './schemas/index.js';
import { readPackageVersion } from '../utils/paths.js';
import { MissingEnvError } from '../utils/env.js';

type ErrorCode =
  | 'INVALID_INPUT'
  | 'PROJECT_NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'LICENSE_RESTRICTED'
  | 'RATE_LIMITED'
  | 'MISSING_ENV'
  | 'NOT_IMPLEMENTED';

type ToolHandler = (rawInput: unknown) => Promise<unknown>;

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: ToolHandler;
};

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
  if (error instanceof ConnectorNotImplementedError) {
    return createErrorResponse('NOT_IMPLEMENTED', error.message, {
      connector: error.connectorName,
    });
  }

  if (error instanceof OutputValidationError) {
    return createErrorResponse('UPSTREAM_ERROR', error.message, {
      kind: 'output_validation',
      issues: error.zodError.issues,
    });
  }

  if (error instanceof ZodError) {
    return createErrorResponse('INVALID_INPUT', 'Input schema validation failed', {
      issues: error.issues,
    });
  }

  if (error instanceof MissingEnvError) {
    return createErrorResponse('MISSING_ENV', error.message, {
      env: error.envName,
    });
  }

  const message = error instanceof Error ? error.message : 'Unknown upstream error';
  return createErrorResponse('UPSTREAM_ERROR', message);
}

function toMcpInputSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  return zodToJsonSchema(schema, {
    target: 'jsonSchema7',
    $refStrategy: 'none',
  }) as Record<string, unknown>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'polish.init_project',
    description: 'Initialize a project with a Style Bible template and references',
    inputSchema: toMcpInputSchema(InitProjectInputSchema),
    handler: initProject,
  },
  {
    name: 'polish.get_screen',
    description: 'Get a polished screen code stub and associated assets',
    inputSchema: toMcpInputSchema(GetScreenInputSchema),
    handler: getScreen,
  },
  {
    name: 'polish.get_icon',
    description: 'Get icon candidates by semantic intent',
    inputSchema: toMcpInputSchema(GetIconInputSchema),
    handler: getIcon,
  },
  {
    name: 'polish.get_animation',
    description: 'Get animation candidates by intent',
    inputSchema: toMcpInputSchema(GetAnimationInputSchema),
    handler: getAnimation,
  },
  {
    name: 'polish.get_font',
    description: 'Search Google Fonts by family name or category. Returns up to 10 candidates with license info.',
    inputSchema: toMcpInputSchema(GetFontInputSchema),
    handler: getFont,
  },
  {
    name: 'polish.get_sound',
    description: 'Get sound effect candidates by event',
    inputSchema: toMcpInputSchema(GetSoundInputSchema),
    handler: getSound,
  },
  {
    name: 'polish.qc_check',
    description: 'Run a QC check against generated artifacts',
    inputSchema: toMcpInputSchema(QcCheckInputSchema),
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
