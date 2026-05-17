'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { Trophy, ArrowLeft, RotateCcw, Check, X } from 'lucide-react'

export default function QuizResultsPage() {
  const [score, setScore] = useState(0)
  const targetScore = 85
  const passed = targetScore >= 80

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 2
      if (current >= targetScore) {
        clearInterval(interval)
        setScore(targetScore)
        if (targetScore >= 80) triggerConfetti()
      } else {
        setScore(current)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [targetScore])

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00d4aa', '#ffffff', '#3b82f6']
    })
  }

  return (
    <div className="min-h-screen bg-[#0d0e13] p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} /> Quay lại Dashboard
        </Link>

        <div className="bg-[#1a1c25] rounded-3xl border border-[#1e293b] p-8 md:p-12 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-50"></div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Kết quả bài thi</h1>
          <p className="text-slate-400 mb-8">Quiz: Phần Cứng Cơ Bản</p>

          <div className="relative inline-flex items-center justify-center w-48 h-48 rounded-full border-[8px] border-[#0d0e13] bg-[#1a1c25] shadow-[0_0_50px_rgba(0,212,170,0.15)] mb-8">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#1e293b" strokeWidth="12" />
              <circle 
                cx="50%" cy="50%" r="46%" 
                fill="none" 
                stroke={passed ? "#00d4aa" : "#ef4444"} 
                strokeWidth="12" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (289 * score) / 100}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-5xl font-black text-white">{score}</span>
              <span className="text-xl font-bold text-slate-500">/100</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${passed ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {passed ? 'XUẤT SẮC!' : 'CẦN CỐ GẮNG HƠN!'}
            </h2>
            <p className="text-slate-400 mt-2">
              {passed ? 'Bạn đã vượt qua bài kiểm tra này thành công.' : 'Bạn chưa đạt số điểm tối thiểu (80/100).'}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {passed ? (
              <button className="flex items-center gap-2 bg-[#00d4aa] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#00e6af] transition-colors shadow-lg shadow-[#00d4aa]/20">
                <Trophy size={20} /> Nhận Chứng Chỉ
              </button>
            ) : (
              <button className="flex items-center gap-2 bg-[#1e293b] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#2a3655] transition-colors">
                <RotateCcw size={20} /> Làm lại (Còn 2 lần)
              </button>
            )}
          </div>
        </div>

        {/* Phân tích kết quả */}
        <div className="bg-[#1a1c25] rounded-2xl border border-[#1e293b] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Phân tích chi tiết</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(q => (
              <div key={q} className="p-4 rounded-xl bg-[#0d0e13] border border-[#1e293b] flex items-start gap-4">
                <div className={`mt-1 p-1 rounded-full ${q === 2 ? 'bg-red-500/20 text-red-500' : 'bg-[#00d4aa]/20 text-[#00d4aa]'}`}>
                  {q === 2 ? <X size={16} /> : <Check size={16} />}
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Câu {q}: Thành phần nào chịu trách nhiệm xuất hình ảnh?</p>
                  <p className={`text-sm ${q === 2 ? 'text-red-400 line-through' : 'text-[#00d4aa]'}`}>
                    Đáp án của bạn: {q === 2 ? 'CPU' : 'GPU'}
                  </p>
                  {q === 2 && <p className="text-sm text-[#00d4aa] mt-1">Đáp án đúng: GPU</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
