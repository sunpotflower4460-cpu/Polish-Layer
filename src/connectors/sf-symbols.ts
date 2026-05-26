import { readFileSync } from 'node:fs';

import type { Connector } from './base.js';
import type { GetIconOutput, LicenseInfo } from '../mcp/schemas/index.js';
import { resolveFromRoot } from '../utils/paths.js';

type SfSymbolsQuery = {
  semantic: string;
};

type GetIconCandidate = GetIconOutput['candidates'][number];

type SfSymbolRecord = {
  name: string;
  tags: string[];
  category: string;
  ios_min_version: string;
};

const SF_SYMBOLS_DB_PATH = resolveFromRoot('src/connectors/data/sf-symbols.json');
const sfSymbolsData = JSON.parse(readFileSync(SF_SYMBOLS_DB_PATH, 'utf-8')) as SfSymbolRecord[];

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

function isSfSymbolRecord(value: unknown): value is SfSymbolRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<SfSymbolRecord>;
  return (
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === 'string') &&
    typeof candidate.category === 'string' &&
    typeof candidate.ios_min_version === 'string'
  );
}

export class SfSymbolsConnector implements Connector<SfSymbolsQuery, GetIconCandidate> {
  public readonly name = 'sf-symbols';

  public async search(query: SfSymbolsQuery): Promise<GetIconCandidate[]> {
    const normalizedQuery = normalizeText(query.semantic);
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
    if (!isSfSymbolRecord(raw)) {
      throw new Error('sf-symbols normalize received invalid record');
    }
    const item = raw;
    const base = {
      name: item.name,
      source: 'sf-symbols' as const,
      preview_url: `https://developer.apple.com/sf-symbols/#${item.name}`,
    };
    const candidate: GetIconCandidate = {
      ...base,
      license_info: this.getLicenseInfo({ ...base, license_info: SF_SYMBOLS_LICENSE }),
    };
    return candidate;
  }

  public getLicenseInfo(_item: GetIconCandidate): LicenseInfo {
    return { ...SF_SYMBOLS_LICENSE };
  }
}

export const sfSymbolsConnector = new SfSymbolsConnector();
