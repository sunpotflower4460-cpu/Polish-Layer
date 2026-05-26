import type { ZodError } from 'zod';

export class OutputValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: ZodError,
  ) {
    super(message);
    this.name = 'OutputValidationError';
  }
}

export class ConnectorNotImplementedError extends Error {
  constructor(public readonly connectorName: string) {
    super(`Connector not implemented: ${connectorName} (will be added in Phase 2B)`);
    this.name = 'ConnectorNotImplementedError';
  }
}
