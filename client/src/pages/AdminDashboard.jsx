import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function AdminDashboard(){
  const { logout } = useAuth()
  const { pathname } = useLocation()
  const tabs = [
    ['/admin','Dashboard'],
    ['/admin/forms','Service Forms'],
    ['/admin/forward','Call Forwarding'],
    ['/admin/forwarded','Forwarded Calls'],
    ['/admin/payments','Payments / Reports'],
    ['/admin/techs','Technicians'],
  ]
  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-4">Chimney CRM</h1>
        <nav className="flex flex-col gap-2">
          {tabs.map(([to,label])=> (
            <Link key={to} to={to} className={`px-3 py-2 rounded-xl ${pathname===to?'bg-black text-white':'bg-gray-100'}`}>{label}</Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-6 px-3 py-2 rounded-xl bg-red-50 text-red-700">Logout</button>
      </aside>
      <main className="p-4"><Outlet /></main>
    </div>
  )
}
