import axios from 'axios'
import { useAuth } from './store/auth'

export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const api = axios.create({ baseURL: API_BASE })

export function authHeaders(){
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
