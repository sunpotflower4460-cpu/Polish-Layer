import type { LicenseInfo } from '../mcp/schemas/index.js';

export interface Connector<TQuery, TResult> {
  readonly name: string;
  search(query: TQuery): Promise<TResult[]>;
  normalize(raw: unknown): TResult;
  getLicenseInfo(item: TResult): LicenseInfo;
}
