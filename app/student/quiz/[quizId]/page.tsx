'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, RefreshCw, AlertTriangle } from 'lucide-react'

// Ngân hàng đề thi Công Nghệ Thông Tin (Đa dạng)
const REAL_IT_QUESTIONS = [
  {
    id: 'q1',
    question: 'Đâu là thành phần đóng vai trò như "bộ não" xử lý trung tâm của máy tính?',
    options: ['RAM (Random Access Memory)', 'CPU (Central Processing Unit)', 'GPU (Graphics Processing Unit)', 'HDD (Hard Disk Drive)'],
    correctIndex: 1,
    explanation: 'CPU (Vi xử lý trung tâm) thực thi các lệnh của chương trình máy tính.'
  },
  {
    id: 'q2',
    question: 'Khi máy tính bị cúp điện đột ngột, dữ liệu trong linh kiện nào sau đây sẽ bị mất hoàn toàn?',
    options: ['Ổ cứng HDD', 'Ổ cứng SSD', 'ROM (Read-Only Memory)', 'RAM (Random Access Memory)'],
    correctIndex: 3,
    explanation: 'RAM là bộ nhớ bay hơi (volatile memory), cần nguồn điện liên tục để duy trì dữ liệu.'
  },
  {
    id: 'q3',
    question: 'Định dạng nào sau đây dùng để cấu hình tự động địa chỉ IP trong mạng LAN?',
    options: ['DNS (Domain Name System)', 'DHCP (Dynamic Host Configuration Protocol)', 'FTP (File Transfer Protocol)', 'HTTP (Hypertext Transfer Protocol)'],
    correctIndex: 1,
    explanation: 'DHCP tự động cấp phát địa chỉ IP và cấu hình mạng cho thiết bị client.'
  },
  {
    id: 'q4',
    question: 'Chức năng chính của Bo Mạch Chủ (Mainboard / Motherboard) là gì?',
    options: ['Cung cấp điện năng cho toàn bộ hệ thống', 'Lưu trữ hệ điều hành và phần mềm', 'Kết nối và truyền dẫn tín hiệu giữa các linh kiện', 'Xử lý các thuật toán đồ họa phức tạp'],
    correctIndex: 2,
    explanation: 'Mainboard là xương sống của hệ thống, giúp các linh kiện như CPU, RAM, GPU giao tiếp với nhau.'
  },
  {
    id: 'q5',
    question: 'Keo tản nhiệt (Thermal Paste) thường được bôi vào vị trí nào?',
    options: ['Giữa CPU và quạt tản nhiệt (Heatsink)', 'Giữa các thanh RAM và khe cắm DIMM', 'Giữa ổ cứng SSD và Mainboard', 'Giữa Nguồn (PSU) và vỏ Case'],
    correctIndex: 0,
    explanation: 'Keo tản nhiệt lấp đầy các khoảng trống vi mô giữa bề mặt CPU và Heatsink để tối ưu truyền nhiệt.'
  }
]

export default function QuizTakingPage({ params }: { params: { quizId: string } }) {
  const router = useRouter()
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  
  // Real-time tracking
  const [secondsLeft, setSecondsLeft] = useState(15 * 60) // 15 phút
  const [submitting, setSubmitting] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishQuiz(score) // Hết giờ tự động nộp bài
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isFinished, score])

  const currentQ = REAL_IT_QUESTIONS[currentQIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return
    setIsAnswered(true)
    if (selectedOption === currentQ.correctIndex) {
      setScore(prev => prev + 20) // Mỗi câu 20 điểm
    }
  }

  const handleNextQuestion = () => {
    if (currentQIndex < REAL_IT_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      handleFinishQuiz(score + (selectedOption === currentQ.correctIndex && !isAnswered ? 20 : 0))
    }
  }

  const handleFinishQuiz = async (finalScore: number) => {
    setIsFinished(true)
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Lưu lịch sử làm bài thật vào database
        await supabase.from('quiz_attempts').insert({
          student_id: user.id,
          quiz_id: params.quizId,
          score: finalScore,
          time_spent_seconds: (15 * 60) - secondsLeft,
          status: finalScore >= 80 ? 'passed' : 'failed'
        })
        
        // Lấy profile hiện tại để cập nhật điểm tổng (XP)
        const { data: profile } = await supabase.from('profiles').select('total_score').eq('id', user.id).single()
        if (profile) {
          await supabase.from('profiles').update({
            total_score: (profile.total_score || 0) + finalScore
          }).eq('id', user.id)
        }
      }
    } catch (e) {
      console.error('Lỗi khi nộp bài:', e)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        {submitting ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw size={32} className="animate-spin text-[#089e60]" />
            <h2 className="text-xl font-bold tracking-widest text-gray-300 uppercase">Đang nộp bài...</h2>
          </div>
        ) : (
          <div className="bg-[#11121d]/80 border border-[#e7e7e7] p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#089e60] to-blue-500"></div>
            <Trophy size={64} className={`mx-auto mb-6 ${score >= 80 ? 'text-yellow-400' : 'text-gray-400'}`} />
            <h2 className="text-3xl font-black mb-2 uppercase">Kết quả làm bài</h2>
            <p className="text-gray-400 text-sm mb-6">Bạn đã hoàn thành bài thi: {params.quizId}</p>
            
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#089e60] to-blue-400 mb-8 drop-shadow-[0_0_15px_rgba(0,212,170,0.4)]">
              {score}/100
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => router.push('/student/quiz')}
                className="relative z-50 pointer-events-auto px-6 py-3 bg-[#089e60]/10 hover:bg-[#089e60]/20 border border-[#089e60]/30 text-[#089e60] rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,212,170,0.1)] hover:shadow-[0_0_25px_rgba(8,158,96,0.3)]"
              >
                Quay Lại Ngân Hàng Đề Thi
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white flex flex-col relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <header className="bg-[#11121d]/90 border-b border-gray-800 p-4 sm:px-8 flex justify-between items-center backdrop-blur-md relative z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/student/quiz')}
            className="relative z-50 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-xs text-red-400 rounded-xl transition-all font-bold shadow-md cursor-pointer"
          >
            <ArrowLeft size={14} /> Thoát bài thi
          </button>
          <h2 className="font-black text-white text-sm md:text-base hidden sm:block">Đang làm bài #{params.quizId}</h2>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-xl border ${secondsLeft < 60 ? 'text-red-500 border-red-500/50 bg-red-500/10 animate-pulse' : 'text-[#089e60] border-[#089e60]/30 bg-[#089e60]/5'}`}>
          <Clock size={18} />
          {formatTime(secondsLeft)}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 relative z-10 flex flex-col justify-center">
        
        {/* Tiêu đề câu hỏi */}
        <div className="mb-8 p-6 bg-[#11121d]/70 border border-[#e7e7e7] rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#089e60] text-sm font-bold uppercase tracking-widest bg-[#089e60]/10 px-3 py-1 rounded-full border border-[#089e60]/20">
              Câu hỏi {currentQIndex + 1} / {REAL_IT_QUESTIONS.length}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">{currentQ.question}</h3>
        </div>

        {/* Danh sách lựa chọn */}
        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i
            let stateClass = "bg-[#11121d]/60 border-gray-800 hover:bg-gray-800/60 hover:border-gray-600"
            
            if (isAnswered) {
              if (i === currentQ.correctIndex) {
                stateClass = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              } else if (isSelected) {
                stateClass = "bg-red-500/20 border-red-500 text-red-300"
              } else {
                stateClass = "bg-[#11121d]/40 border-gray-800/50 text-gray-500" // Làm mờ đi
              }
            } else if (isSelected) {
              stateClass = "bg-[#089e60]/20 border-[#089e60] text-white shadow-[0_0_15px_rgba(8,158,96,0.2)]"
            }

            return (
              <label 
                key={i} 
                onClick={() => handleSelectOption(i)}
                className={`flex items-center gap-4 p-5 sm:p-6 border-2 rounded-2xl transition-all cursor-pointer ${stateClass}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected || (isAnswered && i === currentQ.correctIndex) ? 'border-transparent' : 'border-gray-600'}`}>
                  {isAnswered && i === currentQ.correctIndex ? (
                    <CheckCircle size={24} className="text-green-500 bg-black rounded-full" />
                  ) : isAnswered && isSelected ? (
                    <XCircle size={24} className="text-red-500 bg-black rounded-full" />
                  ) : isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#089e60] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-transparent" />
                  )}
                </div>
                <span className="text-lg font-medium">{opt}</span>
              </label>
            )
          })}
        </div>

        {/* Giải thích (Chỉ hiện khi đã chọn trả lời) */}
        {isAnswered && (
          <div className="mt-6 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
            <AlertTriangle className="text-blue-400 mt-0.5 shrink-0" size={20} />
            <div>
              <h4 className="text-blue-400 font-bold mb-1">Giải thích chi tiết:</h4>
              <p className="text-blue-200 text-sm">{currentQ.explanation}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#11121d]/90 border-t border-gray-800 p-4 sm:p-6 flex justify-end items-center relative z-50 backdrop-blur-xl">
        {!isAnswered ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
              selectedOption !== null 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            Kiểm tra đáp án
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className="px-8 py-3 bg-[#089e60] hover:bg-[#00e6b8] text-black rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(8,158,96,0.3)] animate-pulse hover:animate-none"
          >
            {currentQIndex < REAL_IT_QUESTIONS.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành Bài Thi'} 
          </button>
        )}
      </footer>
    </div>
  )
}
