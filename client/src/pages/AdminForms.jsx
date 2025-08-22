import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'
import Pagination from '../components/Pagination'

export default function AdminForms(){
  const [q,setQ] = useState({ page:1, limit:4, search:'', status:'', today:false, date:'' })
  const [data,setData] = useState({ items:[], total:0 })
  const fetchData = async(p=q.page)=>{
    const params = {...q, page:p}
    const { data } = await api.get('/service-forms', { headers: authHeaders(), params })
    setData(data)
  }
  useEffect(()=>{ fetchData(1) },[])

  const del = async(id)=>{ if(!confirm('Delete?')) return; await api.delete(`/service-forms/${id}`, {headers:authHeaders()}); fetchData(q.page) }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Search name/phone/address" value={q.search} onChange={e=>setQ({...q, search:e.target.value})} />
        <select value={q.status} onChange={e=>setQ({...q, status:e.target.value})}>
          <option value="">All Status</option>
          {['Services Done','Installation Done','Complaint Done','Under Process'].map(s=>(<option key={s}>{s}</option>))}
        </select>
        <label className="flex items-center gap-2"><input type="checkbox" checked={q.today} onChange={e=>setQ({...q, today:e.target.checked})} />Today</label>
        <input type="date" value={q.date} onChange={e=>setQ({...q, date:e.target.value})} />
        <button className="px-3 py-2 bg-black text-white rounded-xl" onClick={()=>fetchData(1)}>Filter</button>
      </div>
      <div className="grid gap-3">
        {data.items.map(it=> (
          <div key={it._id} className="card">
            <div className="flex justify-between">
              <div className="font-semibold">{it.clientName} <span className="text-xs text-gray-500">({new Date(it.createdAt).toLocaleString()})</span></div>
              <button onClick={()=>del(it._id)} className="text-red-600">Delete</button>
            </div>
            <div className="text-sm">{it.phone} • {it.clientAddress}</div>
            <div className="text-sm">Status: {it.status} • Payment: ₹{it.payment||0}</div>
            <div className="text-sm">Technician: {it.technicianId?.name} ({it.technicianId?.phone})</div>
            <div className="mt-2">
              <div className="text-xs mb-1">Client Signature:</div>
              <img src={it.clientSignature} alt="signature" className="h-24 border rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <Pagination page={data.page} total={data.total} limit={data.limit} onPage={p=>fetchData(p)} />
    </div>
  )
}
