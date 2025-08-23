import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [me, setMe] = useState(null)

  // localStorage sync on first load
  useEffect(() => {
    const t = localStorage.getItem('token')
    const r = localStorage.getItem('role')
    const m = localStorage.getItem('me')
    if (t && r && m) {
      setToken(t)
      setRole(r)
      setMe(JSON.parse(m))
    }
  }, [])

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
