import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, Download, Pause, Play, Trash2, Edit, Save, X } from 'lucide-react'

// Components
import Header from '@/components/Header'
import QRPreview from '@/components/QRPreview'
import ExportOptions from '@/components/ExportOptions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'

// Services
import { qrApi } from '@/services/api'

// Types
import type { QRCode, QRMode, QROptions } from '@/types'

const ManagePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const editToken = searchParams.get('token')

  const [qrCode, setQrCode] = useState<QRCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<QRCode>>({})
  const [showToken, setShowToken] = useState(false)

  // Load QR code data
  useEffect(() => {
    if (!slug || !editToken) {
      setError('Missing slug or edit token')
      setLoading(false)
      return
    }

    const loadQRCode = async () => {
      try {
        const response = await qrApi.getQR(slug, editToken)
        if (response.success) {
          setQrCode(response.data)
          setEditedData(response.data)
        } else {
          setError(response.error || 'Failed to load QR code')
        }
      } catch (error) {
        console.error('Load error:', error)
        setError('Failed to load QR code')
      } finally {
        setLoading(false)
      }
    }

    loadQRCode()
  }, [slug, editToken])

  // Save changes
  const saveChanges = async () => {
    if (!qrCode || !editToken) return

    try {
      const updateData = {
        mode: editedData.mode,
        content: editedData.content,
        options: editedData.options,
        active: editedData.active
      }

      const response = await qrApi.updateQR(qrCode.id, editToken, updateData)
      if (response.success) {
        setQrCode(response.data)
        setEditedData(response.data)
        setIsEditing(false)
        toast.success('QR code updated successfully!')
      } else {
        toast.error(response.error || 'Failed to update QR code')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update QR code')
    }
  }

  // Toggle pause state
  const togglePause = async () => {
    if (!qrCode || !editToken) return

    try {
      const response = await qrApi.togglePause(qrCode.id, editToken)
      if (response.success) {
        setQrCode(response.data)
        setEditedData(response.data)
        toast.success(response.data.active ? 'QR code activated' : 'QR code paused')
      } else {
        toast.error(response.error || 'Failed to toggle pause state')
      }
    } catch (error) {
      console.error('Pause error:', error)
      toast.error('Failed to toggle pause state')
    }
  }

  // Delete QR code
  const deleteQR = async () => {
    if (!qrCode || !editToken) return

    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return
    }

    try {
      await qrApi.deleteQR(qrCode.id, editToken)
      toast.success('QR code deleted successfully')
      // Redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete QR code')
    }
  }

  // Copy management link
  const copyManagementLink = async () => {
    if (!slug || !editToken) return

    const link = `${window.location.origin}/manage/${slug}?token=${editToken}`
    const success = await navigator.clipboard.writeText(link)

    if (success) {
      toast.success('Management link copied to clipboard')
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-glass-text">Loading QR code...</p>
        </div>
      </div>
    )
  }

  if (error || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Access Denied
          </h2>
          <p className="text-glass-text-secondary mb-6">
            {error || 'Invalid edit token or QR code not found'}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - QR details and editing */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header with actions */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Manage QR Code
                  </h1>
                  <p className="text-glass-text-secondary text-sm">
                    Slug: {qrCode.slug}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyManagementLink}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>

              {/* Edit token (hidden by default) */}
              {showToken && editToken && (
                <div className="glass p-3 rounded-lg mb-4">
                  <p className="text-xs text-glass-text-secondary mb-1">Edit Token:</p>
                  <code className="text-xs text-glass-text break-all">
                    {editToken}
                  </code>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <Button
                  variant={isEditing ? 'primary' : 'secondary'}
                  onClick={isEditing ? saveChanges : () => setIsEditing(true)}
                  disabled={isEditing}
                >
                  {isEditing ? <Save size={16} className="mr-2" /> : <Edit size={16} className="mr-2" />}
                  {isEditing ? 'Save Changes' : 'Edit'}
                </Button>

                {isEditing ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedData(qrCode)
                    }}
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={togglePause}
                  >
                    {qrCode.active ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                    {qrCode.active ? 'Pause' : 'Activate'}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={deleteQR}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* QR Code Details */}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                QR Code Details
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-glass-text font-medium mb-2">
                      Mode
                    </label>
                    <select
                      value={editedData.mode}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        mode: e.target.value as QRMode
                      }))}
                      className="w-full input-glass"
                    >
                      <option value="REDIRECT">🔗 Create redirect URL</option>
                      <option value="EMBED">📄 Embed text directly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-glass-text font-medium mb-2">
                      {editedData.mode === 'REDIRECT' ? 'Target URL' : 'Content'}
                    </label>
                    <Textarea
                      value={editedData.content || ''}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      rows={4}
                      maxLength={2048}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={editedData.active || false}
                      onChange={(checked) => setEditedData(prev => ({
                        ...prev,
                        active: checked
                      }))}
                    />
                    <label className="text-glass-text font-medium">
                      QR Code Active
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-glass-text-secondary">Mode:</span>
                    <span className="text-white font-medium">
                      {qrCode.mode === 'REDIRECT' ? '🔗 Redirect' : '📄 Embed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-text-secondary">Status:</span>
                    <span className={`font-medium ${qrCode.active ? 'text-green-400' : 'text-yellow-400'}`}>
                      {qrCode.active ? '✅ Active' : '⏸️ Paused'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-text-secondary">Created:</span>
                    <span className="text-white font-medium">
                      {new Date(qrCode.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-glass-text-secondary">Content:</span>
                    <span className="text-white font-medium truncate max-w-xs">
                      {qrCode.content}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics */}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                Analytics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-glass-text-secondary">Total Scans:</span>
                  <span className="text-white font-medium text-2xl">
                    {qrCode.scanCount}
                  </span>
                </div>
                {qrCode.lastScannedAt && (
                  <div className="flex justify-between">
                    <span className="text-glass-text-secondary">Last Scan:</span>
                    <span className="text-white font-medium">
                      {new Date(qrCode.lastScannedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right side - Preview and export */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Live Preview */}
            <div className="lg:sticky lg:top-8">
              <QRPreview
                content={editedData.content || qrCode.content}
                options={editedData.options as QROptions}
                logoUrl={editedData.logoUrl || qrCode.logoUrl || undefined}
              />

              {/* Export Options */}
              <div className="mt-6">
                <ExportOptions
                  qrId={qrCode.id}
                  slug={qrCode.slug}
                  options={editedData.options as QROptions}
                />
              </div>

              {/* Public URL */}
              <div className="glass p-4 rounded-lg mt-4">
                <p className="text-glass-text-secondary text-sm mb-2">Public QR URL:</p>
                <a
                  href={`/r/${qrCode.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light break-all"
                >
                  {window.location.origin}/r/{qrCode.slug}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ManagePage