import { z } from 'zod';

import type { Connector } from './base.js';
import type { GetFontOutput, LicenseInfo } from '../mcp/schemas/index.js';
import { getRequiredEnv } from '../utils/env.js';

type GoogleFontsQuery = {
  semantic: string;
  category?: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  max_results?: number;
};

type GetFontCandidate = GetFontOutput['candidates'][number];

type GoogleFontApiItem = {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
};

type UpstreamError = Error & { code: 'UPSTREAM_ERROR' };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const GOOGLE_FONTS_LICENSE: LicenseInfo = {
  type: 'free-commercial',
  attribution_required: false,
  commercial_use: true,
  source_url: 'https://fonts.google.com/attribution',
};

const GoogleFontsApiResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          family: z.string().min(1),
          category: z.string().min(1),
          variants: z.array(z.string()),
          subsets: z.array(z.string()),
        })
        .strict(),
    ),
  })
  .strict();

function toUpstreamError(message: string, cause: unknown): UpstreamError {
  const error = new Error(message, {
    cause: cause instanceof Error ? cause : undefined,
  }) as UpstreamError;
  error.name = 'UpstreamError';
  error.code = 'UPSTREAM_ERROR';
  return error;
}

function getPreviewUrl(family: string): string {
  const slug = family.trim().replace(/\s+/g, '+');
  return `https://fonts.google.com/specimen/${encodeURIComponent(slug)}`;
}

export class GoogleFontsConnector implements Connector<GoogleFontsQuery, GetFontCandidate> {
  public readonly name = 'google-fonts';

  private cache:
    | {
        items: GoogleFontApiItem[];
        expiresAt: number;
      }
    | null = null;

  private async loadFonts(): Promise<GoogleFontApiItem[]> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.items;
    }

    const apiKey = getRequiredEnv('GOOGLE_FONTS_API_KEY');
    const url = new URL('https://www.googleapis.com/webfonts/v1/webfonts');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('sort', 'popularity');

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw toUpstreamError(
          `Google Fonts request failed with status ${response.status}`,
          response.statusText,
        );
      }

      const payload = GoogleFontsApiResponseSchema.parse(await response.json());
      this.cache = {
        items: payload.items,
        expiresAt: now + CACHE_TTL_MS,
      };

      return payload.items;
    } catch (error) {
      if ((error as { code?: string }).code === 'UPSTREAM_ERROR') {
        throw error;
      }
      throw toUpstreamError('Google Fonts upstream request failed', error);
    }
  }

  public async search(query: GoogleFontsQuery): Promise<GetFontCandidate[]> {
    const semantic = query.semantic.trim().toLowerCase();
    const maxResults = Math.min(query.max_results ?? 10, 10);

    const fonts = await this.loadFonts();
    const filtered = fonts.filter((item) => {
      if (query.category && item.category !== query.category) {
        return false;
      }
      if (!semantic) {
        return true;
      }
      return item.family.toLowerCase().includes(semantic);
    });

    return filtered.slice(0, maxResults).map((item) => this.normalize(item));
  }

  public normalize(raw: unknown): GetFontCandidate {
    const item = GoogleFontsApiResponseSchema.shape.items.element.parse(raw);
    const candidate: GetFontCandidate = {
      family: item.family,
      category: item.category,
      variants: item.variants,
      subsets: item.subsets,
      source: 'google-fonts',
      preview_url: getPreviewUrl(item.family),
      license_info: this.getLicenseInfo({
        family: item.family,
        category: item.category,
        variants: item.variants,
        subsets: item.subsets,
        source: 'google-fonts',
        preview_url: getPreviewUrl(item.family),
        license_info: GOOGLE_FONTS_LICENSE,
      }),
    };

    return candidate;
  }

  public getLicenseInfo(_item: GetFontCandidate): LicenseInfo {
    return { ...GOOGLE_FONTS_LICENSE };
  }
}

export const googleFontsConnector = new GoogleFontsConnector();
