import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const RedirectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  useEffect(() => {
    // This page should redirect to the actual QR content
    // The server handles the actual redirect logic
    if (slug) {
      window.location.href = `/r/${slug}`
    }
  }, [slug])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-glass-text">Redirecting to QR code...</p>
      </div>
    </div>
  )
}

export default RedirectPage