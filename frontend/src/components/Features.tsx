import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Shield,
  Palette,
  Download,
  Smartphone,
  Lock
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Create QR codes instantly with our optimized generation engine. No signup required.'
  },
  {
    icon: Shield,
    title: 'Never Expires',
    description: 'Your QR codes work forever. We use durable storage for permanent persistence.'
  },
  {
    icon: Palette,
    title: 'Customizable',
    description: 'Add logos, choose colors, apply gradients, and make QR codes uniquely yours.'
  },
  {
    icon: Download,
    title: 'Multiple Formats',
    description: 'Export in PNG, JPEG, or SVG. Get high-resolution files for any use case.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Responsive design works perfectly on all devices. Touch-friendly interface.'
  },
  {
    icon: Lock,
    title: 'Secure Management',
    description: 'Edit tokens ensure only you can modify your QR codes. No accounts needed.'
  }
]

const Features: React.FC = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Everything You Need
        </h2>
        <p className="text-xl text-glass-text-secondary max-w-2xl mx-auto">
          Professional QR code generation with advanced features,
          designed for both casual users and businesses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1
            }}
            className="glass p-6 rounded-xl hover:shadow-neon transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-glass-text-secondary leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Features