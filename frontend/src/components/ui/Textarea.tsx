import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

const Textarea: React.FC<TextareaProps> = ({
  error,
  label,
  className = '',
  ...props
}) => {
  const baseClasses = 'glass w-full px-4 py-3 rounded-lg text-glass-text placeholder-glass-text-secondary focus-ring transition-all duration-300 border-none resize-none'

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
      <textarea
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

export { Textarea }