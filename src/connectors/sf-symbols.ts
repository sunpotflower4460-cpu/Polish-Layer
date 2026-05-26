import { readFileSync } from 'node:fs';

import { z } from 'zod';

import type { Connector } from './base.js';
import type { GetIconOutput, LicenseInfo } from '../mcp/schemas/index.js';
import { resolveFromRoot } from '../utils/paths.js';

type SfSymbolsQuery = {
  semantic: string;
};

type GetIconCandidate = GetIconOutput['candidates'][number];

export const SfSymbolEntrySchema = z
  .object({
    name: z.string().min(1),
    tags: z.array(z.string()),
    category: z.string().min(1),
    ios_min_version: z.string().min(1),
  })
  .strict();

export type SfSymbolRecord = z.infer<typeof SfSymbolEntrySchema>;

function loadSfSymbolsData(): SfSymbolRecord[] {
  const dbPath = resolveFromRoot('assets/sf-symbols/sf-symbols.json');
  const raw: unknown = JSON.parse(readFileSync(dbPath, 'utf-8'));
  const entries = z.array(SfSymbolEntrySchema).parse(raw);

  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.name)) {
      throw new Error(`Duplicate SF Symbol name: ${entry.name}`);
    }
    seen.add(entry.name);
  }

  return entries;
}

const sfSymbolsData = loadSfSymbolsData();

const SF_SYMBOLS_LICENSE: LicenseInfo = {
  type: 'apple-system',
  attribution_required: false,
  commercial_use: true,
  source_url: 'https://developer.apple.com/sf-symbols/',
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getTagScore(query: string, tag: string): number {
  if (tag === query) {
    return 3;
  }
  if (tag.startsWith(query)) {
    return 2;
  }
  if (tag.includes(query)) {
    return 1;
  }
  return 0;
}

export class SfSymbolsConnector implements Connector<SfSymbolsQuery, GetIconCandidate> {
  public readonly name = 'sf-symbols';

  public async search(query: SfSymbolsQuery): Promise<GetIconCandidate[]> {
    const normalizedQuery = normalizeText(query.semantic);
    if (normalizedQuery === '') {
      return [];
    }
    const scored = sfSymbolsData
      .map((item) => {
        const bestScore = item.tags.reduce((maxScore, rawTag) => {
          const score = getTagScore(normalizedQuery, normalizeText(rawTag));
          return score > maxScore ? score : maxScore;
        }, 0);

        return {
          item,
          score: bestScore,
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.item.name.localeCompare(right.item.name);
      })
      .slice(0, 10);

    return scored.map(({ item }) => this.normalize(item));
  }

  public normalize(raw: unknown): GetIconCandidate {
    const item = SfSymbolEntrySchema.parse(raw);
    const base = {
      name: item.name,
      source: 'sf-symbols' as const,
      preview_url: `https://developer.apple.com/sf-symbols/#${item.name}`,
    };
    const candidate: GetIconCandidate = {
      ...base,
      license_info: this.getLicenseInfo({ ...base, license_info: SF_SYMBOLS_LICENSE }),
      metadata: {
        category: item.category,
        ios_min_version: item.ios_min_version,
      },
    };
    return candidate;
  }

  public getLicenseInfo(_item: GetIconCandidate): LicenseInfo {
    return { ...SF_SYMBOLS_LICENSE };
  }
}

export const sfSymbolsConnector = new SfSymbolsConnector();
