import React from 'react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  label?: string
  error?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = 'input-glass cursor-pointer'

  const classes = `
    ${baseClasses}
    ${error ? 'border-red-400 focus:ring-red-400' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div>
      {label && (
        <label className="block text-glass-text font-medium mb-2">
          {label}
        </label>
      )}
      <select
        className={classes}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="form-error mt-2">
          {error}
        </p>
      )}
    </div>
  )
}

export { Select }