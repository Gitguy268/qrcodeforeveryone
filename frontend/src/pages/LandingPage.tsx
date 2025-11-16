import React from 'react'
import { motion } from 'framer-motion'

// Components
import QRForm from '@/components/QRForm'
import QRPreview from '@/components/QRPreview'
import Header from '@/components/Header'
import Features from '@/components/Features'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero section with QR creation */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - QR creation form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 animate-float">
                QR Codes for
                <span className="block text-primary-light">Everybody</span>
              </h1>
              <p className="text-lg lg:text-xl text-glass-text-secondary mb-8">
                Create permanent QR codes with no signup. Add logos, customize colors,
                and manage with secret edit tokens.
              </p>
            </div>

            {/* QR Creation Form */}
            <QRForm />
          </motion.div>

          {/* Right side - Live preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-8"
          >
            <QRPreview />
          </motion.div>
        </div>

        {/* Features section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
        >
          <Features />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="glass mt-20 py-8"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-glass-text-secondary">
            Built with ❤️ using modern web technologies.
          </p>
          <div className="mt-4 space-x-4 text-sm text-glass-text-secondary">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/api" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default LandingPage