import axios from 'axios'

// Request interceptor to log all requests
axios.interceptors.request.use(
  (config) => {
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`)
    console.log('[Axios Request] Headers:', config.headers)
    console.log('[Axios Request] Data:', config.data)
    return config
  },
  (error) => {
    console.error('[Axios Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor to log all responses
axios.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`)
    return response
  },
  (error) => {
    console.error(`[Axios Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
    console.error('[Axios Response Error] Status:', error.response?.status)
    console.error('[Axios Response Error] Data:', error.response?.data)
    console.error('[Axios Response Error] Headers:', error.response?.headers)
    return Promise.reject(error)
  }
)
