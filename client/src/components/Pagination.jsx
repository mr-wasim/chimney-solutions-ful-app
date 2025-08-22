export default function Pagination({ page, total, limit, onPage }){
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={()=>onPage(Math.max(1, page-1))} className="px-3 py-2 bg-gray-100 rounded-xl">Prev</button>
      <div className="text-sm">Page {page} / {pages}</div>
      <button onClick={()=>onPage(Math.min(pages, page+1))} className="px-3 py-2 bg-gray-100 rounded-xl">Next</button>
    </div>
  )
}
