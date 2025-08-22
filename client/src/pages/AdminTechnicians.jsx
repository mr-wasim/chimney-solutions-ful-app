import React, { useEffect, useState } from 'react'
import { api, authHeaders } from '../api'
import { Link } from 'react-router-dom'

export default function AdminTechnicians(){
  const [techs,setTechs] = useState([])
  useEffect(()=>{ api.get('/technicians',{headers:authHeaders()}).then(r=>setTechs(r.data.items)) },[])
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {techs.map(t=> (
        <Link to={`/admin/techs/${t._id}`} key={t._id} className="card hover:shadow-lg transition">
          <div className="font-semibold">{t.name}</div>
          <div className="text-sm">{t.phone}</div>
          <div className="text-xs text-gray-500">Joined {new Date(t.createdAt).toLocaleDateString()}</div>
        </Link>
      ))}
    </div>
  )
}
