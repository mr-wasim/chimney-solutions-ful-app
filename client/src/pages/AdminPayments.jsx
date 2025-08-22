import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'
import Pagination from '../components/Pagination'

export default function AdminPayments(){
  const [q,setQ] = useState({ page:1, limit:4, search:'', today:false, from:'', to:'', technicianId:'' })
  const [data,setData] = useState({ items:[], total:0, totals:[] })
  const [techs,setTechs] = useState([])
  const fetchData = async(p=q.page)=>{
    const { data } = await api.get('/payments', { headers: authHeaders(), params: {...q, page:p} })
    setData(data)
  }
  useEffect(()=>{ api.get('/technicians',{headers:authHeaders()}).then(r=>setTechs(r.data.items)); fetchData(1) },[])
  const del = async(id)=>{ if(!confirm('Delete?')) return; await api.delete(`/payments/${id}`, {headers:authHeaders()}); fetchData(q.page) }
  const totalOverall = data.items.reduce((s,p)=> s + (p.amountCash||0)+(p.amountOnline||0), 0)
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Search by recipient" value={q.search} onChange={e=>setQ({...q, search:e.target.value})} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={q.today} onChange={e=>setQ({...q, today:e.target.checked})} />Today</label>
        <input type="date" value={q.from} onChange={e=>setQ({...q, from:e.target.value})} />
        <input type="date" value={q.to} onChange={e=>setQ({...q, to:e.target.value})} />
        <select value={q.technicianId} onChange={e=>setQ({...q, technicianId:e.target.value})}>
          <option value="">All Techs</option>
          {techs.map(t=>(<option key={t._id} value={t._id}>{t.name}</option>))}
        </select>
        <button className="px-3 py-2 bg-black text-white rounded-xl" onClick={()=>fetchData(1)}>Filter</button>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Totals by Technician</div>
        <div className="grid md:grid-cols-3 gap-3">
          {data.totals.map(t=>{
            const tech = techs.find(x=>x._id===t._id)
            return <div key={t._id} className="p-3 bg-gray-50 rounded-xl">{tech?.name || t._id}: ₹{(t.totalCash||0)+(t.totalOnline||0)}</div>
          })}
          <div className="p-3 bg-gray-50 rounded-xl font-semibold">Overall: ₹{totalOverall}</div>
        </div>
      </div>
      <div className="grid gap-3">
        {data.items.map(it=> (
          <div key={it._id} className="card">
            <div className="flex justify-between">
              <div className="font-semibold">{it.recipientName} — {it.mode}</div>
              <button onClick={()=>del(it._id)} className="text-red-600">Delete</button>
            </div>
            <div className="text-sm">Tech: {it.technicianId?.name} ({it.technicianId?.phone}) • Date: {new Date(it.createdAt).toLocaleString()}</div>
            <div className="text-sm">Online: ₹{it.amountOnline} • Cash: ₹{it.amountCash}</div>
            <div className="mt-2">
              <div className="text-xs mb-1">Recipient Signature:</div>
              <img src={it.recipientSignature} alt="signature" className="h-24 border rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <Pagination page={data.page} total={data.total} limit={data.limit} onPage={p=>fetchData(p)} />
    </div>
  )
}
