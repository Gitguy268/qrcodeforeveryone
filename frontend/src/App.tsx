import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

// Pages
import LandingPage from '@/pages/LandingPage'
import ManagePage from '@/pages/ManagePage'
import RedirectPage from '@/pages/RedirectPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Components
import LiquidBackground from '@/components/LiquidBackground'

function App() {
  return (
    <div className="min-h-screen relative">
      {/* Animated liquid background */}
      <LiquidBackground />

      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/manage/:slug" element={<ManagePage />} />
          <Route path="/r/:slug" element={<RedirectPage />} />

          {/* 404 fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>

      {/* Global notifications */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          className: 'glass',
          style: {
            backdropFilter: 'blur(12px)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      />
    </div>
  )
}

export default App