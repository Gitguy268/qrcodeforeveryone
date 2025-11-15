import React from 'react'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Palette, Sliders, Zap } from 'lucide-react'

// Components
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Slider } from '@/components/ui/Slider'

// Types
import type { QROptions } from '@/types'

interface StyleEditorProps {
  control: Control<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

const StyleEditor: React.FC<StyleEditorProps> = ({
  control,
  watch,
  setValue
}) => {
  const options = watch('options') || {}
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  // Color presets
  const colorPresets = [
    { name: 'Classic', color: '#000000', background: '#FFFFFF' },
    { name: 'Dark', color: '#FFFFFF', background: '#000000' },
    { name: 'Blue', color: '#1e40af', background: '#dbeafe' },
    { name: 'Green', color: '#059669', background: '#d1fae5' },
    { name: 'Purple', color: '#7c3aed', background: '#ede9fe' },
    { name: 'Red', color: '#dc2626', background: '#fee2e2' }
  ]

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setValue('options', {
      ...options,
      color: preset.color,
      background: preset.background
    })
  }

  const toggleGradient = () => {
    if (options.gradient) {
      setValue('options', {
        ...options,
        gradient: undefined
      })
    } else {
      setValue('options', {
        ...options,
        gradient: {
          from: options.color || '#000000',
          to: options.background || '#FFFFFF'
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Style Options</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Sliders className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Simple' : 'Advanced'}
        </Button>
      </div>

      {/* Quick Color Presets */}
      <div>
        <label className="block text-glass-text font-medium mb-3">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {colorPresets.map((preset) => (
            <motion.button
              key={preset.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyPreset(preset)}
              className="glass p-3 rounded-lg hover:shadow-neon transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded border border-glass-border"
                  style={{
                    background: `linear-gradient(45deg, ${preset.color} 50%, ${preset.background} 50%)`
                  }}
                />
                <span className="text-glass-text text-sm">{preset.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-glass-text font-medium mb-3">
            Foreground Color
          </label>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Input
                type="color"
                value={options.color || '#000000'}
                onChange={(e) => setValue('options.color', e.target.value)}
                className="w-full h-12 cursor-pointer"
              />
              <Input
                type="text"
                value={options.color || '#000000'}
                onChange={(e) => setValue('options.color', e.target.value)}
                className="absolute inset-0 w-full h-12 opacity-0 pointer-events-none"
              />
            </div>
            <div
              className="w-12 h-12 rounded-lg border-2 border-glass-border"
              style={{ backgroundColor: options.color || '#000000' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-glass-text font-medium mb-3">
            Background Color
          </label>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Input
                type="color"
                value={options.background || '#FFFFFF'}
                onChange={(e) => setValue('options.background', e.target.value)}
                className="w-full h-12 cursor-pointer"
              />
              <Input
                type="text"
                value={options.background || '#FFFFFF'}
                onChange={(e) => setValue('options.background', e.target.value)}
                className="absolute inset-0 w-full h-12 opacity-0 pointer-events-none"
              />
            </div>
            <div
              className="w-12 h-12 rounded-lg border-2 border-glass-border"
              style={{ backgroundColor: options.background || '#FFFFFF' }}
            />
          </div>
        </div>
      </div>

      {/* Gradient Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-glass-text font-medium">Gradient Effect</label>
          <p className="text-glass-text-secondary text-sm">
            Apply gradient to QR code modules
          </p>
        </div>
        <Switch
          checked={!!options.gradient}
          onChange={toggleGradient}
        />
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6 pt-6 border-t border-glass-border"
        >
          {/* Size Slider */}
          <div>
            <label className="flex items-center justify-between text-glass-text font-medium mb-3">
              <span>QR Code Size</span>
              <span className="text-primary">{options.size || 512}px</span>
            </label>
            <Slider
              value={[options.size || 512]}
              onValueChange={([value]) => setValue('options.size', value)}
              min={128}
              max={2048}
              step={64}
              className="w-full"
            />
          </div>

          {/* Logo Scale */}
          <div>
            <label className="flex items-center justify-between text-glass-text font-medium mb-3">
              <span>Logo Scale</span>
              <span className="text-primary">{Math.round((options.logoScale || 0.2) * 100)}%</span>
            </label>
            <Slider
              value={[options.logoScale || 0.2]}
              onValueChange={([value]) => setValue('options.logoScale', value)}
              min={0.1}
              max={0.25}
              step={0.01}
              className="w-full"
            />
            <p className="text-glass-text-secondary text-sm mt-2">
              Recommended: 18-25% of QR size for best scanability
            </p>
          </div>

          {/* Rounded Modules */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-glass-text font-medium">Rounded Modules</label>
              <p className="text-glass-text-secondary text-sm">
                Apply rounded corners to QR modules
              </p>
            </div>
            <Switch
              checked={options.rounded || false}
              onChange={(checked) => setValue('options.rounded', checked)}
            />
          </div>

          {/* Error Correction */}
          <div>
            <label className="block text-glass-text font-medium mb-3">
              Error Correction
            </label>
            <select
              value={options.errorCorrection || 'H'}
              onChange={(e) => setValue('options.errorCorrection', e.target.value)}
              className="w-full input-glass"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%) - Recommended for logos</option>
            </select>
            <p className="text-glass-text-secondary text-sm mt-2">
              Higher levels allow more damage but increase QR size
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default StyleEditor