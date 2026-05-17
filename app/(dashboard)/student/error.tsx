'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d0e13]">
      <div className="bg-[#1a1c25] border border-red-500/20 p-8 rounded-2xl max-w-md text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Đã xảy ra lỗi hệ thống!</h2>
        <p className="text-slate-400 mb-8">Không thể tải dữ liệu. Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-[#00d4aa] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#00e6af] transition-colors"
        >
          <RotateCcw size={18} /> Thử lại
        </button>
      </div>
    </div>
  )
}
