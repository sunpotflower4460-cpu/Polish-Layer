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
