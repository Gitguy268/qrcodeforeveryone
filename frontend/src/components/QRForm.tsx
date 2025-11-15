import React, { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// Types and validation
import { CreateQRRequestSchema, QRMode, type CreateQRRequest } from '@qrforeverybody/shared'
import type { QROptions } from '@/types'

// Components
import LogoUploader from '@/components/LogoUploader'
import StyleEditor from '@/components/StyleEditor'
import ExportOptions from '@/components/ExportOptions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

// Services
import { qrApi } from '@/services/api'

interface QRFormData extends CreateQRRequest {
  size?: number
  color?: string
  background?: string
  logoScale?: number
  errorCorrection?: string
}

const QRForm: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [createdQR, setCreatedQR] = useState<any>(null)
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<QRFormData>({
    resolver: zodResolver(CreateQRRequestSchema),
    defaultValues: {
      mode: QRMode.REDIRECT,
      content: '',
      options: {
        size: 512,
        color: '#000000',
        background: '#FFFFFF',
        errorCorrection: 'H',
        logoScale: 0.2,
        rounded: false
      }
    }
  })

  const watchedValues = watch()
  const mode = watchedValues.mode
  const content = watchedValues.content

  // Form submission
  const onSubmit = useCallback(async (data: QRFormData) => {
    setIsCreating(true)

    try {
      // Prepare request data
      const requestData: CreateQRRequest = {
        mode: data.mode,
        content: data.content,
        options: {
          size: data.options?.size || 512,
          color: data.options?.color || '#000000',
          background: data.options?.background || '#FFFFFF',
          errorCorrection: data.options?.errorCorrection || 'H',
          logoScale: data.options?.logoScale || 0.2,
          rounded: data.options?.rounded || false,
          gradient: data.options?.gradient
        },
        logo: tempLogoUrl
      }

      const response = await qrApi.createQR(requestData)

      if (response.success) {
        setCreatedQR(response.data)
        toast.success('QR code created successfully!')

        // Copy edit token to clipboard
        await navigator.clipboard.writeText(response.data.editToken)
        toast.info('Edit token copied to clipboard!')
      } else {
        toast.error(response.error || 'Failed to create QR code')
      }
    } catch (error) {
      console.error('QR creation error:', error)
      toast.error('Failed to create QR code. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }, [tempLogoUrl])

  // Reset form
  const resetForm = useCallback(() => {
    setCreatedQR(null)
    setTempLogoUrl(null)
    // Reset form values
    setValue('mode', QRMode.REDIRECT)
    setValue('content', '')
    setValue('options', {
      size: 512,
      color: '#000000',
      background: '#FFFFFF',
      errorCorrection: 'H',
      logoScale: 0.2,
      rounded: false
    })
  }, [setValue])

  return (
    <div className="glass p-6 rounded-2xl space-y-6">
      <AnimatePresence mode="wait">
        {!createdQR ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Mode Selection */}
            <div>
              <label className="block text-glass-text font-medium mb-3">
                QR Code Mode
              </label>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: QRMode.REDIRECT, label: '🔗 Create redirect URL' },
                      { value: QRMode.EMBED, label: '📄 Embed text directly' }
                    ]}
                    className="w-full"
                  />
                )}
              />
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-glass-text font-medium mb-3">
                {mode === QRMode.REDIRECT ? 'Target URL' : 'Content to Embed'}
              </label>
              <Textarea
                {...register('content')}
                placeholder={
                  mode === QRMode.REDIRECT
                    ? 'https://example.com'
                    : 'Enter text to embed in QR code...'
                }
                rows={3}
                maxLength={2048}
                className="w-full"
                error={errors.content?.message}
              />
              <div className="flex justify-between mt-2 text-sm text-glass-text-secondary">
                <span>
                  {mode === QRMode.REDIRECT
                    ? 'QR will redirect to this URL'
                    : 'Text will be embedded directly in QR'}
                </span>
                <span>{content?.length || 0}/2048</span>
              </div>
            </div>

            {/* Logo Upload */}
            <LogoUploader
              onLogoUploaded={setTempLogoUrl}
              onLogoRemoved={() => setTempLogoUrl(null)}
            />

            {/* Style Options */}
            <StyleEditor
              control={control}
              watch={watch}
              setValue={setValue}
            />

            {/* Create Button */}
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isCreating}
              loading={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <span className="loading-dots">
                  Creating<span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                '✨ Create QR Code'
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                QR Code Created!
              </h3>
              <p className="text-glass-text-secondary">
                Your QR code is ready to use. The edit token has been copied to your clipboard.
              </p>
            </div>

            {/* QR Info */}
            <div className="glass p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-glass-text-secondary">Public URL:</span>
                <a
                  href={createdQR.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  Open QR →
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-glass-text-secondary">Management:</span>
                <a
                  href={createdQR.managementUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  Manage →
                </a>
              </div>
            </div>

            {/* Export Options */}
            <ExportOptions
              qrId={createdQR.id}
              slug={createdQR.slug}
              options={watchedValues.options}
            />

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigator.clipboard.writeText(createdQR.editToken)}
                variant="secondary"
                className="w-full"
              >
                📋 Copy Edit Token Again
              </Button>
              <Button
                onClick={resetForm}
                variant="secondary"
                className="w-full"
              >
                ➕ Create Another QR Code
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QRForm