import React, { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../store/auth'
import toast from 'react-hot-toast'

export default function Login(){
  const [mode, setMode] = useState('technician')  // admin | technician
  const [techMode, setTechMode] = useState('login') // login | register

  const [admin, setAdmin] = useState({ username:'', password:'' })
  const [tech, setTech] = useState({ phone:'', password:'' })
  const [reg, setReg] = useState({ name:'', phone:'', password:'' })
  const { login } = useAuth()

  const submitAdmin = async(e)=>{
    e.preventDefault()
    try{
      const { data } = await api.post('/admin/login', admin)
      login(data.token, 'admin', data.admin)
      toast.success('Admin login successful')
      window.location.href='/admin'
    }catch(err){ toast.error(err?.response?.data?.error || 'Login failed') }
  }

  const submitTechLogin = async(e)=>{
    e.preventDefault()
    try{
      const { data } = await api.post('/technicians/login', tech)
      login(data.token, 'technician', data.technician)
      toast.success('Technician login successful')
      window.location.href='/tech'
    }catch(err){ toast.error(err?.response?.data?.error || 'Login failed') }
  }

  const submitTechRegister = async(e)=>{
    e.preventDefault()
    try{
      const { data } = await api.post('/technicians/register', reg)
      login(data.token, 'technician', data.technician)
      toast.success('Technician registered')
      window.location.href='/tech'
    }catch(err){ toast.error(err?.response?.data?.error || 'Register failed') }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Chimney Solutions — CRM</h1>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button 
            className={`flex-1 py-2 rounded-xl ${mode==='admin'?'bg-black text-white':'bg-gray-200'}`}
            onClick={()=>{setMode('admin'); setTechMode('login')}}
          >
            Admin Login
          </button>
          <button 
            className={`flex-1 py-2 rounded-xl ${mode==='technician'?'bg-black text-white':'bg-gray-200'}`}
            onClick={()=>{setMode('technician'); setTechMode('login')}}
          >
            Technician
          </button>
        </div>

        {/* Admin Form */}
        {mode==='admin' && (
          <form onSubmit={submitAdmin} className="space-y-3">
            <input placeholder="Username" value={admin.username} onChange={e=>setAdmin({...admin, username:e.target.value})} className="w-full border p-2 rounded-xl" />
            <input placeholder="Password" type="password" value={admin.password} onChange={e=>setAdmin({...admin, password:e.target.value})} className="w-full border p-2 rounded-xl" />
            <button className="w-full py-2 bg-black text-white rounded-xl">Login</button>
          </form>
        )}

        {/* Technician Section */}
        {mode==='technician' && (
          <>
            {techMode==='login' ? (
              <form onSubmit={submitTechLogin} className="space-y-3">
                <h2 className="font-semibold text-center">Technician Login</h2>
                <input placeholder="Phone" value={tech.phone} onChange={e=>setTech({...tech, phone:e.target.value})} className="w-full border p-2 rounded-xl" />
                <input placeholder="Password" type="password" value={tech.password} onChange={e=>setTech({...tech, password:e.target.value})} className="w-full border p-2 rounded-xl" />
                <button className="w-full py-2 bg-black text-white rounded-xl">Login</button>
                <p className="text-sm text-center mt-2">
                  Don’t have an account?{" "}
                  <button type="button" className="text-blue-600 underline" onClick={()=>setTechMode('register')}>
                    Register
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={submitTechRegister} className="space-y-3">
                <h2 className="font-semibold text-center">Create Technician ID</h2>
                <input placeholder="Full Name" value={reg.name} onChange={e=>setReg({...reg, name:e.target.value})} className="w-full border p-2 rounded-xl" />
                <input placeholder="Phone" value={reg.phone} onChange={e=>setReg({...reg, phone:e.target.value})} className="w-full border p-2 rounded-xl" />
                <input placeholder="Password" type="password" value={reg.password} onChange={e=>setReg({...reg, password:e.target.value})} className="w-full border p-2 rounded-xl" />
                <button className="w-full py-2 bg-black text-white rounded-xl">Register</button>
                <p className="text-sm text-center mt-2">
                  Already have an account?{" "}
                  <button type="button" className="text-blue-600 underline" onClick={()=>setTechMode('login')}>
                    Login
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
