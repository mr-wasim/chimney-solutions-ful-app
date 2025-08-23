import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [role, setRole] = useState(localStorage.getItem('role') || null)
  const [me, setMe] = useState(JSON.parse(localStorage.getItem('me') || 'null'))

  const login = (t, r, m) => {
    setToken(t); setRole(r); setMe(m)
    localStorage.setItem('token', t)
    localStorage.setItem('role', r)
    localStorage.setItem('me', JSON.stringify(m))
  }
  const logout = () => {
    setToken(null); setRole(null); setMe(null)
    localStorage.clear()
    window.location.href = '/'
  }

  return <AuthContext.Provider value={{token, role, me, login, logout}}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }
