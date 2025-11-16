import React from 'react'

interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  label
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  return (
    <label className={`relative inline-flex items-center cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`
        relative w-11 h-6 rounded-full transition-colors duration-200
        ${checked ? 'bg-primary' : 'bg-gray-600'}
      `}>
        <div className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </div>
      {label && (
        <span className="ml-3 text-glass-text font-medium">
          {label}
        </span>
      )}
    </label>
  )
}

export { Switch }