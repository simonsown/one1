'use client'

import React, { useEffect, useState } from 'react'
import { startBuilderSession, endBuilderSession } from '@/lib/learning-actions'

export default function BuilderPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let currentSessionId: string | null = null

    async function initSession() {
      const id = await startBuilderSession()
      if (id) {
        setSessionId(id)
        currentSessionId = id
      }
    }
    initSession()

    return () => {
      if (currentSessionId) {
        endBuilderSession(currentSessionId, {
          components_used: [],
          tdp_calculated: 0,
          compatibility_score: 100
        })
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0d0e13] text-[#dde0ed]">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#00d4aa]">PC Builder Lab</h1>
        <p className="mt-2 text-gray-400">Thực hành lắp ráp PC (Đang theo dõi phiên)</p>
      </div>
    </div>
  )
}
