// config/apiConfig.js
// Centralized API configuration based on environment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export { API_BASE_URL }

