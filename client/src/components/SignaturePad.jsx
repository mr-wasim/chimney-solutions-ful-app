import React, { useRef, useState, useEffect } from 'react'

export default function SignaturePad({ onChange }){
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(()=>{
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    return { x, y }
  }

  const start = (e) => { setDrawing(true); const {x,y}=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(x,y) }
  const move = (e) => { if(!drawing) return; const {x,y}=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.lineTo(x,y); ctx.stroke() }
  const end = () => { setDrawing(false); onChange && onChange(canvasRef.current.toDataURL()) }
  const clear = () => { const c=canvasRef.current; c.getContext('2d').clearRect(0,0,c.width,c.height); onChange && onChange('') }

  return (
    <div className="space-y-2">
      <div className="border rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-36 touch-none"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>
      <button type="button" onClick={clear} className="px-3 py-2 rounded-xl bg-gray-100">Clear</button>
    </div>
  )
}
