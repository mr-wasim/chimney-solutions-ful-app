import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, authHeaders } from '../api'

export default function TechnicianDetail(){
  const { id } = useParams()
  const [from,setFrom] = useState('')
  const [to,setTo] = useState('')
  const [data,setData] = useState({ forms:[], payments:[], totalCollected:0 })
  const load = async()=>{
    const { data } = await api.get(`/technicians/${id}/summary`, { headers: authHeaders(), params: { from, to } })
    setData(data)
  }
  useEffect(()=>{ load() },[])
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="px-3 py-2 bg-black text-white rounded-xl" onClick={load}>Filter</button>
      </div>
      <div className="card">
        <div className="font-semibold">Total Collection: ₹{data.totalCollected}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="card">
          <div className="font-semibold mb-2">Service Forms</div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {data.forms.map(f=> (
              <div key={f._id} className="border-b pb-2">
                <div className="font-semibold">{f.clientName} <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span></div>
                <div className="text-sm">{f.clientAddress} • {f.phone}</div>
                <div className="text-sm">Status: {f.status} • Payment: ₹{f.payment||0}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="font-semibold mb-2">Payments</div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {data.payments.map(p=> (
              <div key={p._id} className="border-b pb-2">
                <div className="text-sm">{new Date(p.createdAt).toLocaleString()} — {p.mode}</div>
                <div>Online: ₹{p.amountOnline} • Cash: ₹{p.amountCash}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
