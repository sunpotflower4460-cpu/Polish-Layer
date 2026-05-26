import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

let cachedRoot: string | null = null;

export function getProjectRoot(): string {
  if (cachedRoot) {
    return cachedRoot;
  }

  let current = dirname(fileURLToPath(import.meta.url));
  const visited: string[] = [];

  while (current !== dirname(current)) {
    visited.push(current);
    if (existsSync(resolve(current, 'package.json'))) {
      cachedRoot = current;
      return current;
    }
    current = dirname(current);
  }

  visited.push(current);
  throw new Error(
    `Polish Layer: could not locate project root (package.json) from ${visited.join(' -> ')}`,
  );
}

export function resolveFromRoot(...segments: string[]): string {
  return resolve(getProjectRoot(), ...segments);
}

export function readPackageVersion(): string {
  try {
    const packageJsonPath = resolveFromRoot('package.json');
    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
    return parsed.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}
