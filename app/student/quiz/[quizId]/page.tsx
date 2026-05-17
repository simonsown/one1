'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type QuizState = 'intro' | 'active' | 'reviewing' | 'submitting' | 'results'

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter()
  const [state, setState] = useState<QuizState>('intro')
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 mins default
  
  useEffect(() => {
    if (state !== 'active') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state])

  const handleSubmit = async () => {
    setState('submitting')
    // Giả lập Server Action delay
    await new Promise(res => setTimeout(res, 1500))
    router.push(`/student/quiz/attempt-${params.quizId}/results`)
  }

  if (state === 'intro') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0e13] text-[#dde0ed]">
        <div className="bg-[#1a1c25] p-8 rounded-xl border border-gray-800 max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-[#00d4aa]">Bài Kiểm Tra {params.quizId}</h1>
          <div className="space-y-4 mb-8 text-gray-300 text-left">
            <p>📝 Số câu hỏi: 20</p>
            <p>⏱️ Thời gian: 15 phút</p>
            <p>🎯 Điểm đạt: 70%</p>
          </div>
          <button 
            onClick={() => setState('active')}
            className="w-full bg-[#00d4aa] text-[#0d0e13] py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    )
  }

  if (state === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0e13] text-[#dde0ed]">
        <div className="w-12 h-12 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Đang nộp bài...</p>
      </div>
    )
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isWarning = timeLeft < 300

  return (
    <div className="min-h-screen bg-[#0d0e13] text-[#dde0ed] flex flex-col">
      <header className="bg-[#1a1c25] border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="font-bold">Bài kiểm tra #{params.quizId}</h2>
        <div className={`font-mono text-xl font-bold ${isWarning ? 'text-red-500 animate-pulse' : 'text-[#00d4aa]'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-8">
        <div className="mb-8">
          <span className="text-gray-400 text-sm">Câu 1 / 20</span>
          <h3 className="text-2xl font-semibold mt-2">Đâu là thành phần xử lý trung tâm của máy tính?</h3>
        </div>

        <div className="space-y-4">
          {['CPU', 'RAM', 'GPU', 'HDD'].map((opt, i) => (
            <label key={i} className="flex items-center gap-4 p-4 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
              <input type="radio" name={`q1`} className="w-5 h-5 accent-[#00d4aa]" />
              <span className="text-lg">{opt}</span>
            </label>
          ))}
        </div>
      </main>

      <footer className="bg-[#1a1c25] border-t border-gray-800 p-4 flex justify-between items-center">
        <button className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white">
          Câu trước
        </button>
        <button 
          onClick={handleSubmit}
          className="bg-[#00d4aa] text-[#0d0e13] px-8 py-2 rounded-lg font-bold"
        >
          Nộp bài
        </button>
      </footer>
    </div>
  )
}
