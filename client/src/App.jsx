import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import TechnicianDashboard from './pages/TechnicianDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminHome from './pages/AdminHome'
import AdminForms from './pages/AdminForms'
import AdminForward from './pages/AdminForward'
import AdminForwardedList from './pages/AdminForwardedList'
import AdminPayments from './pages/AdminPayments'
import AdminTechnicians from './pages/AdminTechnicians'
import TechnicianDetail from './pages/TechnicianDetail'
import { AuthProvider, useAuth } from './store/auth'

function Private({ role, children }){
  const { token, role: myRole } = useAuth()
  if (!token || (role && role !== myRole)) return <Navigate to="/" replace />
  return children
}

export default function App(){
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tech" element={<Private role="technician"><TechnicianDashboard /></Private>} />
        <Route path="/admin" element={<Private role="admin"><AdminDashboard /></Private>}>
          <Route index element={<AdminHome />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="forward" element={<AdminForward />} />
          <Route path="forwarded" element={<AdminForwardedList />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="techs" element={<AdminTechnicians />} />
          <Route path="techs/:id" element={<TechnicianDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
