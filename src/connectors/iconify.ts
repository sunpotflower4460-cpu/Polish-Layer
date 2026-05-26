import { z } from 'zod';

import type { Connector } from './base.js';
import type { GetIconOutput, LicenseInfo } from '../mcp/schemas/index.js';

type IconifyQuery = {
  semantic: string;
};

type GetIconCandidate = GetIconOutput['candidates'][number];

type UpstreamError = Error & { code: 'UPSTREAM_ERROR' };

const ICONIFY_LICENSE: LicenseInfo = {
  type: 'free-commercial',
  attribution_required: false,
  commercial_use: true,
  source_url: 'https://iconify.design/docs/license/',
};

const IconifySearchResponseSchema = z
  .object({
    icons: z.array(z.string()),
  })
  .strict();

function isEnglishQuery(value: string): boolean {
  return /^[\u0020-\u007E]+$/.test(value);
}

function toUpstreamError(message: string, cause: unknown): UpstreamError {
  const error = new Error(message, {
    cause: cause instanceof Error ? cause : undefined,
  }) as UpstreamError;
  error.name = 'UpstreamError';
  error.code = 'UPSTREAM_ERROR';
  return error;
}

function parseIconName(icon: string): { prefix: string; name: string } {
  const [prefix, name] = icon.split(':', 2);
  if (!prefix || !name) {
    throw new Error(`Invalid icon name format: ${icon}`);
  }
  return { prefix, name };
}

function buildPreviewUrl(icon: string): string {
  const parsed = parseIconName(icon);
  return `https://api.iconify.design/${encodeURIComponent(parsed.prefix)}/${encodeURIComponent(parsed.name)}.svg`;
}

export class IconifyConnector implements Connector<IconifyQuery, GetIconCandidate> {
  public readonly name = 'iconify';

  public async search(query: IconifyQuery): Promise<GetIconCandidate[]> {
    const semantic = query.semantic.trim();
    if (!semantic || !isEnglishQuery(semantic)) {
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    try {
      const searchUrl = new URL('https://api.iconify.design/search');
      searchUrl.searchParams.set('query', semantic);
      searchUrl.searchParams.set('limit', '10');

      const response = await fetch(searchUrl, { signal: controller.signal });
      if (!response.ok) {
        throw toUpstreamError(`Iconify search failed with status ${response.status}`, response.statusText);
      }

      const payload = IconifySearchResponseSchema.parse(await response.json());
      return payload.icons.slice(0, 10).map((icon) => this.normalize({ icon }));
    } catch (error) {
      if ((error as { code?: string }).code === 'UPSTREAM_ERROR') {
        throw error;
      }
      throw toUpstreamError('Iconify upstream request failed', error);
    } finally {
      clearTimeout(timeout);
    }
  }

  public normalize(raw: unknown): GetIconCandidate {
    const parsed = z
      .object({
        icon: z.string().regex(/^[^:]+:[^:]+$/),
      })
      .strict()
      .parse(raw);

    const previewUrl = buildPreviewUrl(parsed.icon);
    const candidate: GetIconCandidate = {
      name: parsed.icon,
      source: 'iconify',
      preview_url: previewUrl,
      license_info: this.getLicenseInfo({
        name: parsed.icon,
        source: 'iconify',
        preview_url: previewUrl,
        license_info: ICONIFY_LICENSE,
      }),
    };

    return candidate;
  }

  public getLicenseInfo(_item: GetIconCandidate): LicenseInfo {
    return { ...ICONIFY_LICENSE };
  }
}

export const iconifyConnector = new IconifyConnector();
