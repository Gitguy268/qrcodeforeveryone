import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface LogoUploaderProps {
  onLogoUploaded: (url: string) => void
  onLogoRemoved: () => void
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  onLogoUploaded,
  onLogoRemoved
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to temporary storage
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-temp', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const url = result.data.tempUrl
        setUploadedUrl(url)
        onLogoUploaded(url)
        toast.success('Logo uploaded successfully')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }, [onLogoUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading || !!uploadedUrl
  })

  const removeLogo = useCallback(() => {
    setUploadedUrl(null)
    setPreview(null)
    onLogoRemoved()
    toast.info('Logo removed')
  }, [onLogoRemoved])

  return (
    <div>
      <label className="block text-glass-text font-medium mb-3">
        Logo (Optional)
      </label>

      {!uploadedUrl ? (
        <div
          {...getRootProps()}
          className={`dropzone cursor-pointer ${
            isDragActive ? 'active' : ''
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-glass-text">Uploading logo...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-glass-text font-medium">
                  {isDragActive
                    ? 'Drop the logo here'
                    : 'Drop logo here or click to browse'
                  }
                </p>
                <p className="text-glass-text-secondary text-sm mt-2">
                  PNG, JPG, WebP • Max 5MB • Recommended: 100-400px
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <div className="glass p-4 rounded-lg">
              <div className="w-full aspect-square max-w-32 mx-auto relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Logo preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary/50" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-glass-text font-medium">Logo uploaded successfully</p>
            <p className="text-glass-text-secondary text-sm">
              Logo will be centered in the QR code
            </p>
          </div>

          {/* Upload new logo */}
          <button
            onClick={() => {
              setUploadedUrl(null)
              setPreview(null)
              onLogoRemoved()
            }}
            className="w-full btn-secondary"
          >
            Upload different logo
          </button>
        </div>
      )}
    </div>
  )
}

export default LogoUploader