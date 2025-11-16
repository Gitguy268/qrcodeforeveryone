import React from 'react'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([Number(e.target.value)])
  }

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className="relative h-2 w-full glass rounded-full">
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary transition-all duration-200"
          style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)'
          }}
        />
      </div>
    </div>
  )
}

export { Slider }