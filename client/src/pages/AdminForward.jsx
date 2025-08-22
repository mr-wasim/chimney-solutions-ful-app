import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'
import toast from 'react-hot-toast'

export default function AdminForward(){
  const [techs, setTechs] = useState([])
  const [f, setF] = useState({ clientName:'', phone:'', address:'', technicianId:'' })
  useEffect(()=>{
    api.get('/technicians',{headers:authHeaders()}).then(res=>setTechs(res.data.items))
  },[])
  const submit = async (e)=>{
    e.preventDefault()
    try{
      await api.post('/calls/forward', f, { headers: authHeaders() })
      toast.success('Call forwarded')
      setF({ clientName:'', phone:'', address:'', technicianId:'' })
    }catch(err){ toast.error(err?.response?.data?.error || 'Failed') }
  }
  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Call Forwarding</h2>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
        <input placeholder="Client Name" value={f.clientName} onChange={e=>setF({...f, clientName:e.target.value})} />
        <input placeholder="Client Phone" value={f.phone} onChange={e=>setF({...f, phone:e.target.value})} />
        <input placeholder="Address" className="md:col-span-2" value={f.address} onChange={e=>setF({...f, address:e.target.value})} />
        <select value={f.technicianId} onChange={e=>setF({...f, technicianId:e.target.value})} className="md:col-span-2">
          <option value="">Select Technician</option>
          {techs.map(t=>(<option key={t._id} value={t._id}>{t.name} ({t.phone})</option>))}
        </select>
        <button className="md:col-span-2 bg-black text-white py-2 rounded-xl">Forward</button>
      </form>
    </div>
  )
}
