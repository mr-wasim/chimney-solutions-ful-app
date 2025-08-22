import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'
import Pagination from '../components/Pagination'

export default function AdminForwardedList(){
  const [q,setQ] = useState({ page:1, limit:4, search:'', today:false, status:'', technicianId:'' })
  const [data,setData] = useState({ items:[], total:0 })
  const [techs,setTechs] = useState([])
  const fetchData = async(p=q.page)=>{
    const { data } = await api.get('/calls/forwarded', { headers: authHeaders(), params: {...q, page:p} })
    setData(data)
  }
  useEffect(()=>{ api.get('/technicians',{headers:authHeaders()}).then(r=>setTechs(r.data.items)); fetchData(1) },[])
  const del = async(id)=>{ if(!confirm('Delete?')) return; await api.delete(`/calls/${id}`, {headers:authHeaders()}); fetchData(q.page) }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Search name/phone/address" value={q.search} onChange={e=>setQ({...q, search:e.target.value})} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={q.today} onChange={e=>setQ({...q, today:e.target.checked})} />Today</label>
        <select value={q.status} onChange={e=>setQ({...q, status:e.target.value})}>
          <option value="">All</option>
          {['Pending','In Process','Completed','Closed'].map(s=>(<option key={s}>{s}</option>))}
        </select>
        <select value={q.technicianId} onChange={e=>setQ({...q, technicianId:e.target.value})}>
          <option value="">All Techs</option>
          {techs.map(t=>(<option key={t._id} value={t._id}>{t.name}</option>))}
        </select>
        <button className="px-3 py-2 bg-black text-white rounded-xl" onClick={()=>fetchData(1)}>Filter</button>
      </div>
      <div className="grid gap-3">
        {data.items.map(it=> (
          <div key={it._id} className="card">
            <div className="flex justify-between">
              <div className="font-semibold">{it.clientName}</div>
              <button onClick={()=>del(it._id)} className="text-red-600">Delete</button>
            </div>
            <div className="text-sm">{it.phone} • {it.address}</div>
            <div className="text-sm">Status: {it.status}</div>
          </div>
        ))}
      </div>
      <Pagination page={data.page} total={data.total} limit={data.limit} onPage={p=>fetchData(p)} />
    </div>
  )
}
