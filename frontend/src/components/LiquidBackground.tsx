import React from 'react'

const LiquidBackground: React.FC = () => {
  return (
    <div className="liquid-background">
      {/* Animated SVG blobs */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-30"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{ filter: 'blur(40px)' }}
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Morphing blob 1 */}
        <path
          d="M300,200 Q400,100 500,200 T700,200 Q800,300 700,400 T500,400 Q400,500 300,400 T100,400 Q0,300 100,200 Z"
          fill="url(#gradient1)"
          className="animate-blob"
          style={{
            transformOrigin: 'center',
            animation: 'blob 20s ease-in-out infinite',
          }}
        />

        {/* Morphing blob 2 */}
        <path
          d="M600,300 Q700,200 800,300 T900,400 Q1000,500 900,600 T600,600 Q500,700 400,600 T200,600 Q100,500 200,400 Z"
          fill="url(#gradient2)"
          className="animate-blob"
          style={{
            transformOrigin: 'center',
            animation: 'blob 25s ease-in-out infinite reverse',
            animationDelay: '-5s',
          }}
        />

        {/* Morphing blob 3 */}
        <path
          d="M200,500 Q300,400 400,500 T600,500 Q700,600 600,700 T400,700 Q300,800 200,700 T0,700 Q-100,600 0,500 Z"
          fill="url(#gradient3)"
          className="animate-blob"
          style={{
            transformOrigin: 'center',
            animation: 'blob 30s ease-in-out infinite',
            animationDelay: '-10s',
          }}
        />
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)',
        }}
      />
    </div>
  )
}

export default LiquidBackground