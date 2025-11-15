import { z } from 'zod';

// QR Mode enum
export enum QRMode {
  EMBED = 'EMBED',
  REDIRECT = 'REDIRECT'
}

// QR Options schema
export const QROptionsSchema = z.object({
  size: z.number().min(128).max(4096).default(512),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  gradient: z.object({
    from: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    to: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }).optional(),
  rounded: z.boolean().default(false),
  logoScale: z.number().min(0.1).max(0.25).default(0.2),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('H')
});

export type QROptions = z.infer<typeof QROptionsSchema>;

// QR Code creation request schema
export const CreateQRRequestSchema = z.object({
  mode: z.nativeEnum(QRMode),
  content: z.string().min(1).max(2048),
  options: QROptionsSchema.optional(),
  logo: z.string().optional() // Base64 encoded image or temp URL
});

export type CreateQRRequest = z.infer<typeof CreateQRRequestSchema>;

// QR Code response schema
export const CreateQRResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  editToken: z.string(),
  publicUrl: z.string(),
  managementUrl: z.string(),
  expires: z.null()
});

export type CreateQRResponse = z.infer<typeof CreateQRResponseSchema>;

// QR Code database model schema
export const QRCodeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  mode: z.nativeEnum(QRMode),
  content: z.string(),
  targetUrl: z.string().nullable(),
  options: QROptionsSchema,
  logoUrl: z.string().nullable(),
  ownerEditTokenHash: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  scanCount: z.number(),
  lastScannedAt: z.date().nullable()
});

export type QRCode = z.infer<typeof QRCodeSchema>;

// Scan analytics schema
export const ScanSchema = z.object({
  id: z.string(),
  qrcodeId: z.string(),
  timestamp: z.date(),
  ipHash: z.string().nullable(),
  userAgent: z.string().nullable(),
  referer: z.string().nullable()
});

export type Scan = z.infer<typeof ScanSchema>;

// API error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any()
});

export type SuccessResponse<T = any> = {
  success: true;
  data: T;
};

// Export request query schema
export const ExportRequestSchema = z.object({
  format: z.enum(['png', 'jpeg', 'svg']),
  size: z.number().min(128).max(4096).default(2048)
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// Update QR request schema
export const UpdateQRRequestSchema = z.object({
  mode: z.nativeEnum(QRMode).optional(),
  content: z.string().min(1).max(2048).optional(),
  targetUrl: z.string().url().optional(),
  options: QROptionsSchema.optional(),
  active: z.boolean().optional()
});

export type UpdateQRRequest = z.infer<typeof UpdateQRRequestSchema>;

// Environment variable schema
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.string().optional(), // For MinIO
  BASE_URL: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('50'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('86400000'), // 24 hours in ms
  ADMIN_SECRET: z.string().optional()
});

export type Env = z.infer<typeof EnvSchema>;