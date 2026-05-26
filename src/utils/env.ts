export class MissingEnvError extends Error {
  public readonly code = 'MISSING_ENV' as const;

  constructor(public readonly envName: string) {
    super(`Missing required environment variable: ${envName}`);
    this.name = 'MissingEnvError';
  }
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new MissingEnvError(name);
  }
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}
