import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input: React.FC<InputProps> = ({
  error,
  label,
  className = '',
  ...props
}) => {
  const baseClasses = 'input-glass'

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
      <input
        className={classes}
        {...props}
      />
      {error && (
        <p className="form-error mt-2">
          {error}
        </p>
      )}
    </div>
  )
}

export { Input }