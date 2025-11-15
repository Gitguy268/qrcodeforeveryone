import React from 'react'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md glass p-8 rounded-2xl"
      >
        {/* 404 Icon */}
        <div className="text-6xl mb-4 font-bold text-primary">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-glass-text-secondary mb-8">
          The QR code or page you're looking for doesn't exist or has been deleted.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            <Home size={16} className="mr-2" />
            Back to Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <Search size={16} className="mr-2" />
            Go Back
          </motion.button>
        </div>

        {/* Helpful links */}
        <div className="mt-8 pt-6 border-t border-glass-border">
          <p className="text-glass-text-secondary text-sm mb-3">
            Looking for something else?
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a
              href="/"
              className="text-primary hover:text-primary-light transition-colors"
            >
              Create QR Code
            </a>
            <a
              href="/api"
              className="text-primary hover:text-primary-light transition-colors"
            >
              API Docs
            </a>
            <a
              href="/privacy"
              className="text-primary hover:text-primary-light transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage