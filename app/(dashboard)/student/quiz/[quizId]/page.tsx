'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

type QuizState = 'intro' | 'active' | 'submitting' | 'results'

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const [state, setState] = useState<QuizState>('intro')
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (state === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && state === 'active') {
      handleSubmit()
    }
    return () => clearInterval(timer)
  }, [state, timeLeft])

  const handleSubmit = async () => {
    setState('submitting')
    // Simulate server action
    await new Promise(r => setTimeout(r, 1500))
    // Redirect to results
    router.push(`/student/quiz/${params.quizId}/results`)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (state === 'intro') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0e13]">
        <div className="bg-[#1a1c25] p-8 rounded-2xl border border-[#1e293b] max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#00d4aa]/20 text-[#00d4aa] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz: Phần Cứng Cơ Bản</h1>
          <p className="text-slate-400 mb-6">Bạn có 15 phút để hoàn thành 10 câu hỏi trắc nghiệm. Kết quả sẽ được ghi nhận vào hệ thống.</p>
          
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock size={16} className="text-[#00d4aa]" /> 15 phút
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <AlertTriangle size={16} className="text-yellow-400" /> 1 lần thử
            </div>
          </div>

          <button onClick={() => setState('active')} className="w-full py-3 bg-[#00d4aa] text-black font-bold rounded-xl hover:bg-[#00e6af] transition-colors">
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    )
  }

  if (state === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0e13] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa] mb-4"></div>
        <p className="text-slate-400">Đang chấm điểm...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0e13] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1c25] border-b border-[#1e293b] p-4 flex justify-between items-center">
        <h2 className="text-white font-semibold">Quiz: Phần Cứng Cơ Bản</h2>
        <div className={`font-mono text-lg font-bold px-4 py-1 rounded-md ${timeLeft <= 300 ? 'bg-red-500/20 text-red-500' : 'bg-[#1e293b] text-[#00d4aa]'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full p-6 gap-6">
        <div className="flex-1">
          <div className="bg-[#1a1c25] rounded-2xl p-8 border border-[#1e293b]">
            <span className="text-[#00d4aa] text-sm font-bold tracking-wider mb-4 block">Câu hỏi {currentQuestion + 1} / 10</span>
            <h3 className="text-xl text-white mb-6 leading-relaxed">Đâu là thành phần được ví như "bộ não" của máy tính?</h3>
            
            <div className="flex flex-col gap-3">
              {['CPU', 'GPU', 'RAM', 'SSD'].map((opt, i) => (
                <button key={i} className="text-left w-full p-4 rounded-xl border border-[#1e293b] bg-[#0d0e13] hover:border-[#00d4aa] text-slate-300 hover:text-white transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="px-6 py-2.5 rounded-lg border border-[#1e293b] text-slate-300 hover:bg-[#1e293b] disabled:opacity-50"
            >
              Câu trước
            </button>
            {currentQuestion === 9 ? (
              <button onClick={handleSubmit} className="px-8 py-2.5 rounded-lg bg-[#00d4aa] text-black font-bold hover:bg-[#00e6af]">
                Nộp bài
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-6 py-2.5 rounded-lg border border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa]/10"
              >
                Câu tiếp
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-64 hidden md:block">
          <div className="bg-[#1a1c25] rounded-2xl p-4 border border-[#1e293b]">
            <h4 className="text-white text-sm font-bold mb-4">Danh sách câu hỏi</h4>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(10)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors
                    ${currentQuestion === i ? 'bg-[#00d4aa] text-black' : 'bg-[#0d0e13] border border-[#1e293b] text-slate-400 hover:border-slate-500'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
