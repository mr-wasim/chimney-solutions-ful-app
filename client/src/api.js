import axios from 'axios'
import { useAuth } from '../store/auth'

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://chimney-solutions-ful-app.onrender.com/api'

export const api = axios.create({ baseURL: API_BASE })

// 🔑 Token hamesha attach rahe request me
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
