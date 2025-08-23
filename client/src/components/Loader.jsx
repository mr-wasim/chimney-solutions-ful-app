// src/components/Loader.jsx
import React from "react"

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 z-50">
      <div className="relative flex items-center justify-center">
        
        {/* Outer rotating ring */}
        <div className="w-32 h-32 border-8 border-transparent border-t-blue-500 border-b-purple-600 rounded-full animate-spin-slow"></div>

        {/* Middle pulsing ring */}
        <div className="absolute w-20 h-20 border-4 border-dashed border-cyan-400 rounded-full animate-spin-fast"></div>

        {/* Inner glowing ball */}
        <div className="absolute w-10 h-10 bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full shadow-[0_0_25px_10px_rgba(255,100,150,0.8)] animate-bounce"></div>
      </div>
    </div>
  )
}
