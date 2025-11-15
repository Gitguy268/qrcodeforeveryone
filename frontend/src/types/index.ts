// Re-export types from shared package
export type {
  CreateQRRequest,
  CreateQRResponse,
  QRCode,
  Scan,
  QROptions,
  UpdateQRRequest,
  ExportRequest,
  QRMode,
  SuccessResponse,
  ErrorResponse
} from '@qrforeverybody/shared'

// Additional frontend-specific types
export interface QRFormData {
  mode: QRMode
  content: string
  options?: QROptions
  logo?: string
}

export interface AnalyticsData {
  totalScans: number
  lastScannedAt: string | null
  recentScans: Array<{
    timestamp: string
    ipHash: string
    userAgent?: string
    referer?: string
  }>
}

export interface ExportOption {
  format: 'png' | 'jpeg' | 'svg'
  size: number
  label: string
  description: string
}

export interface ColorPreset {
  name: string
  color: string
  background: string
}

export interface LogoUploadState {
  url: string | null
  uploading: boolean
  error: string | null
}