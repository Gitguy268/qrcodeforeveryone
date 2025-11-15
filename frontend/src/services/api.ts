import axios from 'axios'
import { type CreateQRRequest, type CreateQRResponse } from '@qrforeverybody/shared'

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response.data
  },
  (error) => {
    console.error('API Response Error:', error)

    // Extract error message from response
    if (error.response?.data?.error) {
      error.message = error.response.data.error
    } else if (error.message) {
      error.message = error.message
    } else {
      error.message = 'An unexpected error occurred'
    }

    return Promise.reject(error)
  }
)

// API service functions
export const qrApi = {
  // Create QR code
  async createQR(data: CreateQRRequest): Promise<CreateQRResponse> {
    const response = await api.post('/api/qrcodes', data)
    return response
  },

  // Get QR code details
  async getQR(id: string, editToken: string) {
    const response = await api.get(`/api/qrcodes/${id}`, {
      headers: {
        'x-edit-token': editToken
      }
    })
    return response
  },

  // Update QR code
  async updateQR(id: string, editToken: string, data: Partial<CreateQRRequest>) {
    const response = await api.patch(`/api/qrcodes/${id}`, data, {
      headers: {
        'x-edit-token': editToken
      }
    })
    return response
  },

  // Toggle QR code pause state
  async togglePause(id: string, editToken: string) {
    const response = await api.post(`/api/qrcodes/${id}/pause`, {}, {
      headers: {
        'x-edit-token': editToken
      }
    })
    return response
  },

  // Delete QR code
  async deleteQR(id: string, editToken: string) {
    await api.delete(`/api/qrcodes/${id}`, {
      headers: {
        'x-edit-token': editToken
      }
    })
  },

  // Upload temporary file
  async uploadFile(file: File): Promise<{ tempUrl: string; expiresAt: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/api/upload-temp', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response
  },

  // Export QR code
  async exportQR(id: string, format: 'png' | 'jpeg' | 'svg', size: number = 2048): Promise<Blob> {
    const response = await api.get(`/api/qrcodes/${id}/export`, {
      params: { format, size },
      responseType: 'blob'
    })

    return response
  }
}

// Utility functions
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

export default api