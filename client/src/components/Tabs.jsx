export default function Tabs({ tabs, active, onChange }){
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map(t => (
        <button key={t.value}
          onClick={()=>onChange(t.value)}
          className={`px-3 py-2 rounded-2xl ${active===t.value?'bg-black text-white':'bg-gray-100'}`}>
          {t.label}{t.badge ? <span className="ml-2 badge-red">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  )
}
