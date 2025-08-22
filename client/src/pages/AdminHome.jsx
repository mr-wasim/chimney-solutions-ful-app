import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'

export default function AdminHome(){
  const [stats, setStats] = useState({ techs:0, forms:0, calls:0, payments:0 })
  useEffect(()=>{
    async function load(){
      try{
        const [techs, forms, calls, pays] = await Promise.all([
          api.get('/technicians',{headers:authHeaders()}),
          api.get('/service-forms',{headers:authHeaders(), params:{limit:1}}),
          api.get('/calls/forwarded',{headers:authHeaders(), params:{limit:1}}),
          api.get('/payments',{headers:authHeaders(), params:{limit:1}}),
        ])
        setStats({ techs: techs.data.items.length, forms: forms.data.total, calls: calls.data.total, payments: pays.data.total })
      }catch{}
    }
    load()
  },[])
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {Object.entries(stats).map(([k,v])=> (
        <div key={k} className="card">
          <div className="text-sm uppercase text-gray-500">{k}</div>
          <div className="text-2xl font-bold">{v}</div>
        </div>
      ))}
    </div>
  )
}
