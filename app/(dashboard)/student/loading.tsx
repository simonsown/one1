'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d0e13]">
      <div className="flex flex-col items-center gap-4 text-[#00d4aa]">
        <Loader2 className="animate-spin w-12 h-12" />
        <p className="text-sm font-medium animate-pulse text-white">Đang tải dữ liệu...</p>
      </div>
    </div>
  )
}
