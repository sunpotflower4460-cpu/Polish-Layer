import { z } from 'zod';

export const LicenseInfoSchema = z
  .object({
    type: z.enum([
      'CC0',
      'MIT',
      'Apache-2.0',
      'free-commercial',
      'paid',
      'apple-system',
      'restricted',
    ]),
    attribution_required: z.boolean(),
    commercial_use: z.boolean(),
    source_url: z.string().min(1),
  })
  .strict();

const ColorPaletteSchema = z
  .object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    bg: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    label: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary_label: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    separator: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  })
  .strict();

const DesignSystemSchema = z
  .object({
    color: z
      .object({
        mode: z.enum(['auto', 'light', 'dark']),
        light: ColorPaletteSchema,
        dark: ColorPaletteSchema,
        semantic: z.string().optional(),
      })
      .strict(),
    typography: z
      .object({
        family: z.string(),
        scale: z.string(),
        weights: z.array(z.number().int().min(100).max(900).multipleOf(100)),
      })
      .strict(),
    spacing: z
      .object({
        base: z.number().int().min(1),
        scale: z.array(z.number().int().min(0)),
      })
      .strict(),
    corner_radius: z
      .object({
        card: z.number().min(0),
        button: z.number().min(0),
        sheet: z.number().min(0),
      })
      .strict(),
    elevation: z.enum(['subtle', 'flat', 'strong']),
  })
  .strict();

const MotionSchema = z
  .object({
    easing: z.string(),
    duration: z
      .object({
        micro: z.number().int().min(0),
        standard: z.number().int().min(0),
        emphasized: z.number().int().min(0),
      })
      .strict(),
    spring: z
      .object({
        stiffness: z.number().min(0),
        damping: z.number().min(0),
      })
      .strict(),
  })
  .strict();

const SoundSchema = z
  .object({
    enabled: z.boolean(),
    ui_se_set: z.enum(['subtle_haptic_complement', 'rich', 'minimal']),
    loudness_target_lufs: z.number(),
  })
  .strict();

const CopySchema = z
  .object({
    tone: z.enum(['friendly_professional', 'playful', 'formal']),
    person: z.enum(['first', 'second', 'third']),
    locale: z.array(z.string().regex(/^[a-z]{2}$/)).min(1),
  })
  .strict();

const QcThresholdsSchema = z
  .object({
    wcag: z.enum(['AA', 'AAA']),
    min_tap_target_pt: z.number().int().min(44),
    max_bundle_mb: z.number().min(0),
    min_fps: z.number().int().min(0),
  })
  .strict();

const StyleBibleCoreSchema = z
  .object({
    platform: z.enum(['ios', 'android', 'both']),
    references: z.array(z.string()),
    category: z.enum(['productivity', 'social', 'finance', 'health', 'utility']),
    design_system: DesignSystemSchema,
    motion: MotionSchema,
    sound: SoundSchema,
    copy: CopySchema,
    qc_thresholds: QcThresholdsSchema,
  })
  .strict();

export const StyleBibleTemplateSchema = StyleBibleCoreSchema.extend({
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
}).strict();

export const StyleBibleSchema = StyleBibleCoreSchema.extend({
  project_id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
}).strict();

export const InitProjectInputSchema = z
  .object({
    references: z.array(z.string()),
    category: z.enum(['productivity', 'social', 'finance', 'health', 'utility']),
    platform: z.enum(['ios', 'android', 'both']),
  })
  .strict();

export const InitProjectOutputSchema = z
  .object({
    project_id: z.string().uuid(),
    style_bible: StyleBibleSchema,
  })
  .strict();

export const GetScreenInputSchema = z
  .object({
    project_id: z.string().uuid(),
    intent: z.string().min(1),
    framework: z.enum(['swiftui', 'react-native']),
  })
  .strict();

const ScreenAssetSchema = z
  .object({
    type: z.enum(['icon', 'lottie', 'sound']),
    name: z.string().optional(),
    source: z.string().optional(),
    url: z.string().optional(),
    license_info: LicenseInfoSchema,
  })
  .strict();

export const GetScreenOutputSchema = z
  .object({
    code: z.string(),
    assets: z.array(ScreenAssetSchema),
    qc_passed: z.boolean(),
    warnings: z.array(z.string()),
  })
  .strict();

export const GetIconInputSchema = z
  .object({
    project_id: z.string().uuid(),
    semantic: z.string().min(1),
    preferred_source: z.enum(['sf-symbols', 'iconify', 'lucide', 'phosphor']).optional(),
  })
  .strict();

export const GetIconOutputSchema = z
  .object({
    candidates: z.array(
      z
        .object({
          name: z.string().min(1),
          source: z.enum(['sf-symbols', 'iconify', 'lucide', 'phosphor']),
          preview_url: z.string().min(1),
          license_info: LicenseInfoSchema,
          metadata: z
            .object({
              category: z.string().optional(),
              ios_min_version: z.string().optional(),
            })
            .optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const GetAnimationInputSchema = z
  .object({
    project_id: z.string().uuid(),
    intent: z.string().min(1),
    max_results: z.number().int().positive().optional(),
  })
  .strict();

export const GetAnimationOutputSchema = z
  .object({
    candidates: z.array(
      z
        .object({
          url: z.string().min(1),
          preview_url: z.string().min(1),
          duration_ms: z.number().int().min(0),
          license_info: LicenseInfoSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const GetSoundInputSchema = z
  .object({
    project_id: z.string().uuid(),
    event: z.enum(['tap', 'success', 'error', 'notification']),
    duration_max_ms: z.number().int().positive().optional(),
  })
  .strict();

export const GetSoundOutputSchema = z
  .object({
    candidates: z.array(
      z
        .object({
          url: z.string().min(1),
          format: z.enum(['aac', 'mp3', 'wav', 'm4a', 'ogg']),
          loudness_lufs: z.number(),
          license_info: LicenseInfoSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const QcCheckInputSchema = z
  .object({
    project_id: z.string().uuid(),
    artifact_type: z.enum(['swiftui_code', 'image', 'audio']),
    content: z.string(),
  })
  .strict();

export const QcCheckOutputSchema = z
  .object({
    passed: z.boolean(),
    violations: z.array(
      z
        .object({
          rule: z.string(),
          severity: z.enum(['error', 'warning']),
          message: z.string(),
          suggestion: z.string().optional(),
          location: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const ErrorResponseSchema = z
  .object({
    error: z
      .object({
        code: z.enum([
          'INVALID_INPUT',
          'PROJECT_NOT_FOUND',
          'UPSTREAM_ERROR',
          'LICENSE_RESTRICTED',
          'RATE_LIMITED',
          'NOT_IMPLEMENTED',
        ]),
        message: z.string(),
        details: z.record(z.unknown()).default({}),
      })
      .strict(),
  })
  .strict();

export type LicenseInfo = z.infer<typeof LicenseInfoSchema>;
export type StyleBibleTemplate = z.infer<typeof StyleBibleTemplateSchema>;
export type StyleBible = z.infer<typeof StyleBibleSchema>;
export type InitProjectInput = z.infer<typeof InitProjectInputSchema>;
export type InitProjectOutput = z.infer<typeof InitProjectOutputSchema>;
export type GetScreenInput = z.infer<typeof GetScreenInputSchema>;
export type GetScreenOutput = z.infer<typeof GetScreenOutputSchema>;
export type GetIconInput = z.infer<typeof GetIconInputSchema>;
export type GetIconOutput = z.infer<typeof GetIconOutputSchema>;
export type GetAnimationInput = z.infer<typeof GetAnimationInputSchema>;
export type GetAnimationOutput = z.infer<typeof GetAnimationOutputSchema>;
export type GetSoundInput = z.infer<typeof GetSoundInputSchema>;
export type GetSoundOutput = z.infer<typeof GetSoundOutputSchema>;
export type QcCheckInput = z.infer<typeof QcCheckInputSchema>;
export type QcCheckOutput = z.infer<typeof QcCheckOutputSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
