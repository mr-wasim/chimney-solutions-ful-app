import React, { useEffect, useMemo, useState } from 'react'
import { api, authHeaders } from '../api'
import { useAuth } from '../store/auth'
import SignaturePad from '../components/SignaturePad'
import Tabs from '../components/Tabs'
import Pagination from '../components/Pagination'
import toast from 'react-hot-toast'
import { FileEdit, PhoneCall, Wallet, User } from 'lucide-react' // ⬅️ icons

export default function TechnicianDashboard(){
  const { me, logout } = useAuth()
  const [active, setActive] = useState('form') // form|calls|payment|user
  const [sig, setSig] = useState('')
  const [form, setForm] = useState({ clientName:'', clientAddress:'', phone:'', payment:0, status:'Under Process' })
  const [calls, setCalls] = useState({ tab:'all', page:1, limit:4, total:0, items:[] })
  const [pay, setPay] = useState({ recipientName:'', mode:'Online', amountOnline:0, amountCash:0, recipientSignature:'', note:'' })

  // Notifications poll
  useEffect(()=>{
    let last = new Date(0).toISOString()
    const interval = setInterval(async()=>{
      try{
        const { data } = await api.get('/notifications', { headers: authHeaders(), params: { since:last }})
        if (data.items?.length) { toast.success('New call received'); fetchCalls(calls.tab, 1) }
        last = data.now
      }catch{}
    }, 15000)
    return ()=>clearInterval(interval)
  }, [])

  const submitServiceForm = async(e)=>{
    e.preventDefault()
    if (!sig) return toast.error('Client signature required')
    try{
      await api.post('/service-forms', { ...form, clientSignature: sig }, { headers: authHeaders() })
      toast.success('Form submitted')
      setForm({ clientName:'', clientAddress:'', phone:'', payment:0, status:'Under Process' })
      setSig('')
    }catch(err){ toast.error(err?.response?.data?.error || 'Submit failed') }
  }

  const fetchCalls = async(tab=calls.tab, page=calls.page)=>{
    try{
      const { data } = await api.get('/technicians/my-calls', { headers: authHeaders(), params: { tab, page, limit:calls.limit }})
      setCalls({ ...calls, tab, page, total:data.total, items:data.items })
    }catch{}
  }
  useEffect(()=>{ fetchCalls('all',1) }, [])

  const setStatus = async(callId, status)=>{
    try{
      await api.post('/technicians/call-status', { callId, status }, { headers: authHeaders() })
      toast.success('Status updated')
      fetchCalls(calls.tab, calls.page)
    }catch{ toast.error('Update failed') }
  }

  const tabs = [
    { value:'all', label:'All Calls' },
    { value:'today', label:'Today Calls', badge:'NEW' },
    { value:'pending', label:'Pending' },
    { value:'inprocess', label:'In Process' },
    { value:'completed', label:'Completed' },
    { value:'closed', label:'Closed' },
  ]

  const submitPayment = async(e)=>{
    e.preventDefault()
    if (!pay.recipientSignature) return toast.error('Recipient signature required')
    let mode = pay.mode
    if (pay.mode==='Both' || (pay.amountCash>0 && pay.amountOnline>0)) mode = 'Both'
    try{
      await api.post('/payments', { ...pay, mode }, { headers: authHeaders() })
      toast.success('Payment recorded')
      setPay({ recipientName:'', mode:'Online', amountOnline:0, amountCash:0, recipientSignature:'', note:'' })
    }catch(err){ toast.error(err?.response?.data?.error || 'Failed') }
  }

  // ---------- Modern Mobile Bottom Nav (icons only, glow bubble) ----------
  const iconMap = {
    form: FileEdit,
    calls: PhoneCall,
    payment: Wallet,
    user: User
  }

  const bottomNav = (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto bg-white/85 backdrop-blur-xl border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4">
          {['form','calls','payment','user'].map(key=>{
            const Icon = iconMap[key]
            const isActive = active===key
            return (
              <button
                key={key}
                onClick={()=>setActive(key)}
                className="relative flex items-center justify-center py-3"
                aria-label={key}
              >
                {isActive && (
                  <span className="absolute -top-2 h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg" />
                )}
                <Icon
                  size={isActive?26:22}
                  className={`relative transition-all ${isActive?'text-white':'text-gray-600'}`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen p-3 pb-24 md:pb-6 bg-gray-50">
      <header className="flex items-center justify-between mb-4">
        <div className="font-bold">Chimney Solutions</div>
        <div className="text-sm truncate max-w-[40%] text-right">Tech ID: {me?.name}</div>
        <button onClick={logout} className="bg-red-50 text-red-700 px-3 py-1 rounded-xl">Logout</button>
      </header>

      {/* Section Switchers (for desktop) */}
      <div className="hidden md:flex gap-3 mb-4">
        <button className={`px-3 py-2 rounded-xl ${active==='form'?'bg-black text-white':'bg-gray-100'}`} onClick={()=>setActive('form')}>Service Form</button>
        <button className={`px-3 py-2 rounded-xl ${active==='calls'?'bg-black text-white':'bg-gray-100'}`} onClick={()=>setActive('calls')}>Call Forward</button>
        <button className={`px-3 py-2 rounded-xl ${active==='payment'?'bg-black text-white':'bg-gray-100'}`} onClick={()=>setActive('payment')}>Payment Mode</button>
        <button className={`px-3 py-2 rounded-xl ${active==='user'?'bg-black text-white':'bg-gray-100'}`} onClick={()=>setActive('user')}>User</button>
      </div>

      {active==='form' && (
        <div className="card">
          <h2 className="font-semibold mb-3">Service Form</h2>
          <form onSubmit={submitServiceForm} className="grid md:grid-cols-2 gap-3">
            <input placeholder="Client Name" value={form.clientName} onChange={e=>setForm({...form, clientName:e.target.value})} />
            <input placeholder="Client Address" value={form.clientAddress} onChange={e=>setForm({...form, clientAddress:e.target.value})} />
            <input placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
              {['Services Done','Installation Done','Complaint Done','Under Process'].map(s=>(<option key={s}>{s}</option>))}
            </select>
            <input placeholder="Payment Amount" type="number" value={form.payment} onChange={e=>setForm({...form, payment:parseInt(e.target.value||'0')})} />
            <div className="md:col-span-2">
              <label className="text-sm block mb-1">Client Signature</label>
              <SignaturePad onChange={setSig} />
            </div>
            <button className="md:col-span-2 bg-black text-white py-2 rounded-xl">Submit</button>
          </form>
        </div>
      )}

      {active==='calls' && (
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold mb-3">Forwarded Calls</h2>
            <button onClick={()=>fetchCalls(calls.tab, 1)} className="px-3 py-1 bg-gray-100 rounded-xl">Refresh</button>
          </div>

          {/* Mobile-friendly tiny pills (overflow-x scroll). Desktop = original Tabs */}
          <div className="md:hidden -mt-1 mb-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max pr-1">
              {tabs.map(t=>(
                <button
                  key={t.value}
                  onClick={()=>fetchCalls(t.value,1)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${calls.tab===t.value?'bg-indigo-600 text-white':'bg-gray-100 text-gray-600'}`}
                >
                  {t.label}{t.badge && <sup className="ml-1 text-[10px] px-1 py-0.5 rounded bg-white/20">{t.badge}</sup>}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Tabs tabs={tabs} active={calls.tab} onChange={(v)=>fetchCalls(v,1)} />
          </div>

          <div className="divide-y">
            {calls.items.map(c => (
              <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="truncate">{c.clientName}</span>
                    <a className="link shrink-0" href={`tel:${c.phone}`}>Call</a>
                  </div>
                  <div className="text-sm text-gray-600 break-words">{c.phone}</div>
                  <div className="text-sm break-words">{c.address}</div>
                  <div className="text-xs mt-1">Status: <span className="badge bg-gray-100">{c.status}</span></div>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <a className="px-3 py-2 bg-gray-100 rounded-xl" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address)}`}>Go</a>
                  <select defaultValue={c.status} onChange={(e)=>setStatus(c._id, e.target.value)} className="text-sm max-w-[140px]">
                    {['Pending','In Process','Completed','Closed'].map(s=>(<option key={s}>{s}</option>))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={calls.page} total={calls.total} limit={calls.limit} onPage={(p)=>fetchCalls(calls.tab, p)} />
        </div>
      )}

      {active==='payment' && (
        <div className="card">
          <h2 className="font-semibold mb-3">Payment Mode</h2>
          <form onSubmit={submitPayment} className="grid md:grid-cols-2 gap-3">
            <input placeholder="Paying to (name)" value={pay.recipientName} onChange={e=>setPay({...pay, recipientName:e.target.value})} />
            <select value={pay.mode} onChange={e=>setPay({...pay, mode:e.target.value})}>
              <option>Online</option>
              <option>Cash</option>
              <option>Both</option>
            </select>
            <input placeholder="Amount Online" type="number" value={pay.amountOnline} onChange={e=>setPay({...pay, amountOnline:parseInt(e.target.value||'0')})} />
            <input placeholder="Amount Cash" type="number" value={pay.amountCash} onChange={e=>setPay({...pay, amountCash:parseInt(e.target.value||'0')})} />
            <div className="md:col-span-2">
              <label className="text-sm block mb-1">Recipient Signature</label>
              <SignaturePad onChange={(v)=>setPay({...pay, recipientSignature:v})} />
            </div>
            <textarea placeholder="Note (optional)" className="md:col-span-2" value={pay.note} onChange={e=>setPay({...pay, note:e.target.value})} />
            <button className="md:col-span-2 bg-black text-white py-2 rounded-xl">Submit</button>
          </form>
        </div>
      )}

      {active==='user' && (
        <div className="card">
          <h2 className="font-semibold mb-2">Profile</h2>
          <div className="break-words">Name: {me?.name}</div>
          <div className="break-words">Phone: {me?.phone}</div>
          <div className="text-xs text-gray-600 mt-2">Keep your phone handy for new call alerts.</div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {bottomNav}
    </div>
  )
}
