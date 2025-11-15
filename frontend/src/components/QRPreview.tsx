import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'

// Types
import type { QROptions } from '@/types'

interface QRPreviewProps {
  content?: string
  options?: QROptions
  logoUrl?: string
}

const QRPreview: React.FC<QRPreviewProps> = ({
  content = '',
  options = {},
  logoUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Default options
  const defaultOptions: QROptions = {
    size: 512,
    color: '#000000',
    background: '#FFFFFF',
    errorCorrection: 'H',
    logoScale: 0.2,
    rounded: false
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Generate QR code when content or options change
  useEffect(() => {
    const generateQR = async () => {
      if (!content) {
        setQrDataUrl('')
        return
      }

      setIsLoading(true)

      try {
        const qrOptions = {
          width: mergedOptions.size,
          margin: 4,
          color: {
            dark: mergedOptions.color,
            light: mergedOptions.background
          },
          errorCorrectionLevel: mergedOptions.errorCorrection
        }

        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(content, qrOptions)
        setQrDataUrl(dataUrl)

        // Apply logo if present
        if (logoUrl && canvasRef.current) {
          await compositeLogo(dataUrl, logoUrl)
        }
      } catch (error) {
        console.error('QR generation error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateQR()
  }, [content, mergedOptions, logoUrl])

  // Composite logo onto QR code
  const compositeLogo = async (qrDataUrl: string, logoUrl: string) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = mergedOptions.size
    canvas.height = mergedOptions.size

    // Draw QR code
    const qrImage = new Image()
    qrImage.onload = async () => {
      ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height)

      try {
        // Load and draw logo
        const logoImage = new Image()
        logoImage.crossOrigin = 'anonymous'
        logoImage.onload = () => {
          const logoSize = Math.floor(mergedOptions.size * (mergedOptions.logoScale || 0.2))
          const logoX = (canvas.width - logoSize) / 2
          const logoY = (canvas.height - logoSize) / 2

          // Add white background for logo
          ctx.fillStyle = 'white'
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)

          // Update QR data URL
          setQrDataUrl(canvas.toDataURL())
        }
        logoImage.src = logoUrl
      } catch (error) {
        console.error('Logo composition error:', error)
      }
    }
    qrImage.src = qrDataUrl
  }

  return (
    <div className="qr-preview-container">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Live Preview
        </h3>
        <p className="text-glass-text-secondary">
          Your QR code updates in real-time
        </p>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="w-full aspect-square flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : qrDataUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full aspect-square max-w-md mx-auto"
          >
            <img
              src={qrDataUrl}
              alt="QR Code Preview"
              className="qr-preview-image"
              style={{
                borderRadius: mergedOptions.rounded ? '1rem' : '0'
              }}
            />

            {/* Scanability indicator */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                qrDataUrl && content
                  ? 'bg-green-500/20 text-green-400 glass'
                  : 'bg-yellow-500/20 text-yellow-400 glass'
              }`}>
                {qrDataUrl && content ? '✓ Scannable' : '⚠ Low contrast'}
              </div>
            </div>

            {/* Size indicator */}
            <div className="absolute bottom-4 left-4">
              <div className="glass px-3 py-1 rounded-full text-xs font-medium text-glass-text-secondary">
                {mergedOptions.size}×{mergedOptions.size}px
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🔳</div>
              <p className="text-glass-text-secondary">
                Enter content to see your QR code
              </p>
            </div>
          </div>
        )}

        {/* Hidden canvas for logo composition */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={mergedOptions.size}
          height={mergedOptions.size}
        />
      </div>

      {/* Preview stats */}
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-2 text-sm"
        >
          <div className="flex justify-between text-glass-text-secondary">
            <span>Content length:</span>
            <span>{content.length} characters</span>
          </div>
          <div className="flex justify-between text-glass-text-secondary">
            <span>Error correction:</span>
            <span>{mergedOptions.errorCorrection} (High)</span>
          </div>
          {logoUrl && (
            <div className="flex justify-between text-glass-text-secondary">
              <span>Logo:</span>
              <span>Included</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default QRPreview