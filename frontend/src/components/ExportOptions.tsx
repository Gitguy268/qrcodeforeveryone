import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Types
import type { QROptions } from '@/types'

interface ExportOptionsProps {
  qrId: string
  slug: string
  options?: QROptions
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  qrId,
  slug,
  options
}) => {
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({})

  const downloadQR = async (format: 'png' | 'jpeg' | 'svg', size: number = 2048) => {
    setDownloading(prev => ({ ...prev, [`${format}-${size}`]: true }))

    try {
      const response = await fetch(`/api/qrcodes/${qrId}/export?format=${format}&size=${size}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get blob from response
      const blob = await response.blob()

      // Create download URL
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${slug}-${size}px.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(url)

      toast.success(`QR code downloaded as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download QR code')
    } finally {
      setDownloading(prev => ({ ...prev, [`${format}-${size}`]: false }))
    }
  }

  const exportFormats = [
    { format: 'svg' as const, label: 'SVG', description: 'Vector format, scalable' },
    { format: 'png' as const, label: 'PNG', description: 'Best for web' },
    { format: 'jpeg' as const, label: 'JPEG', description: 'Smaller file size' }
  ]

  const sizes = [512, 1024, 2048]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-white mb-2">
          Export Options
        </h4>
        <p className="text-glass-text-secondary text-sm">
          Download your QR code in different formats and sizes
        </p>
      </div>

      {/* Quick Downloads */}
      <div className="grid grid-cols-3 gap-3">
        {exportFormats.map((format) => (
          <motion.button
            key={format.format}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => downloadQR(format.format)}
            disabled={downloading[`${format.format}-2048`]}
            className="glass p-4 rounded-lg hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading[`${format.format}-2048`] ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            ) : (
              <Download className="w-5 h-5 mx-auto mb-2" />
            )}
            <div className="text-sm font-medium text-white">
              {format.label}
            </div>
            <div className="text-xs text-glass-text-secondary">
              {format.description}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Size Options */}
      <details className="glass p-4 rounded-lg">
        <summary className="cursor-pointer text-white font-medium hover:text-primary-light transition-colors">
          More size options ▼
        </summary>

        <div className="mt-4 space-y-3">
          {sizes.map((size) => (
            <div key={size} className="flex items-center justify-between glass p-3 rounded">
              <span className="text-glass-text">{size}×{size}px</span>
              <div className="flex space-x-2">
                {exportFormats.map((format) => (
                  <motion.button
                    key={`${format.format}-${size}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => downloadQR(format.format, size)}
                    disabled={downloading[`${format.format}-${size}`]}
                    className="w-8 h-8 glass rounded flex items-center justify-center hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading[`${format.format}-${size}`] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : downloading[`${format.format}-${size}` === false ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Print-friendly version */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // Open print-friendly version
          window.open(`/r/${slug}?print=true`, '_blank')
        }}
        className="w-full glass p-4 rounded-lg hover:shadow-neon transition-all duration-300 text-white font-medium"
      >
        🖨️ Print-Friendly Version
      </motion.button>
    </div>
  )
}

export default ExportOptions