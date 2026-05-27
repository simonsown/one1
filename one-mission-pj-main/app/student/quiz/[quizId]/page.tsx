'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, RefreshCw, AlertTriangle } from 'lucide-react'
import { QUIZ_BANK } from '@/data/quiz-bank'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizTakingPage({ params }: { params: { quizId: string } }) {
  const router = useRouter()
  const quizDef = QUIZ_BANK.find(q => q.id === params.quizId)
  
  const [questions] = useState(() => quizDef ? shuffleArray(quizDef.questions.map(q => {
    const shuffledOpts = shuffleArray(q.options)
    return {
      question: q.q,
      options: shuffledOpts,
      correctAnswer: q.options[q.answer],
      correctIndex: shuffledOpts.indexOf(q.options[q.answer]),
      explanation: ''
    }
  })) : [])

  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (isFinished || !quizDef) return
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishQuiz(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isFinished, score])

  const currentQ = questions[currentQIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQ) return
    setIsAnswered(true)
    if (selectedOption === currentQ.correctIndex) {
      setScore(prev => prev + 10)
    }
  }

  const handleNextQuestion = () => {
    if (!currentQ) return
    const finalScore = score + (selectedOption === currentQ.correctIndex && !isAnswered ? 10 : 0)
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      handleFinishQuiz(finalScore)
    }
  }

  const handleFinishQuiz = async (finalScore: number) => {
    setIsFinished(true)
    setScore(finalScore)
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('quiz_attempts').insert({
          student_id: user.id,
          quiz_id: params.quizId,
          score: finalScore,
          total_questions: questions.length,
          time_spent_seconds: (15 * 60) - secondsLeft,
          status: finalScore >= 80 ? 'passed' : 'failed'
        })

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

  if (!quizDef) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài quiz</h2>
        <button onClick={() => router.push('/student/quiz')} className="px-6 py-3 bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa] rounded-xl font-bold">
          Quay lại
        </button>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        {submitting ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw size={32} className="animate-spin text-[#00d4aa]" />
            <h2 className="text-xl font-bold tracking-widest text-gray-300 uppercase">Đang nộp bài...</h2>
          </div>
        ) : (
          <div className="bg-[#11121d]/80 border border-[#1e293b] p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00d4aa] to-blue-500"></div>
            <Trophy size={64} className={`mx-auto mb-6 ${score >= 80 ? 'text-yellow-400' : 'text-gray-400'}`} />
            <h2 className="text-3xl font-black mb-2 uppercase">Kết quả làm bài</h2>
            <p className="text-gray-400 text-sm mb-6">{quizDef.title}</p>
            
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d4aa] to-blue-400 mb-8 drop-shadow-[0_0_15px_rgba(0,212,170,0.4)]">
              {score}/{questions.length * 10}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => router.push('/student/quiz')}
                className="relative z-50 pointer-events-auto px-6 py-3 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border border-[#00d4aa]/30 text-[#00d4aa] rounded-xl font-bold transition-all">
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
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <header className="bg-[#11121d]/90 border-b border-gray-800 p-4 sm:px-8 flex justify-between items-center backdrop-blur-md relative z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/student/quiz')}
            className="relative z-50 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-xs text-red-400 rounded-xl transition-all font-bold shadow-md cursor-pointer">
            <ArrowLeft size={14} /> Thoát
          </button>
          <h2 className="font-black text-white text-sm md:text-base hidden sm:block">{quizDef.title}</h2>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-xl border ${secondsLeft < 60 ? 'text-red-500 border-red-500/50 bg-red-500/10 animate-pulse' : 'text-[#00d4aa] border-[#00d4aa]/30 bg-[#00d4aa]/5'}`}>
          <Clock size={18} />
          {formatTime(secondsLeft)}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 relative z-10 flex flex-col justify-center">
        <div className="mb-8 p-6 bg-[#11121d]/70 border border-[#1e293b] rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#00d4aa] text-sm font-bold uppercase tracking-widest bg-[#00d4aa]/10 px-3 py-1 rounded-full border border-[#00d4aa]/20">
              Câu hỏi {currentQIndex + 1} / {questions.length}
            </span>
            <span className="text-gray-500 text-sm">Điểm: {score}/{currentQIndex * 10 + (isAnswered ? (selectedOption === currentQ?.correctIndex ? 10 : 0) : 0)}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">{currentQ?.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQ?.options.map((opt, i) => {
            const isSelected = selectedOption === i
            let stateClass = "bg-[#11121d]/60 border-gray-800 hover:bg-gray-800/60 hover:border-gray-600"
            
            if (isAnswered) {
              if (i === currentQ.correctIndex) {
                stateClass = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              } else if (isSelected) {
                stateClass = "bg-red-500/20 border-red-500 text-red-300"
              } else {
                stateClass = "bg-[#11121d]/40 border-gray-800/50 text-gray-500"
              }
            } else if (isSelected) {
              stateClass = "bg-[#00d4aa]/20 border-[#00d4aa] text-white shadow-[0_0_15px_rgba(0,212,170,0.2)]"
            }

            return (
              <label key={i} onClick={() => handleSelectOption(i)}
                className={`flex items-center gap-4 p-5 sm:p-6 border-2 rounded-2xl transition-all cursor-pointer ${stateClass}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected || (isAnswered && i === currentQ.correctIndex) ? 'border-transparent' : 'border-gray-600'}`}>
                  {isAnswered && i === currentQ.correctIndex ? (
                    <CheckCircle size={24} className="text-green-500 bg-black rounded-full" />
                  ) : isAnswered && isSelected ? (
                    <XCircle size={24} className="text-red-500 bg-black rounded-full" />
                  ) : isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#00d4aa] flex items-center justify-center">
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
      </main>

      <footer className="bg-[#11121d]/90 border-t border-gray-800 p-4 sm:p-6 flex justify-end items-center relative z-50 backdrop-blur-xl">
        {!isAnswered ? (
          <button onClick={handleCheckAnswer} disabled={selectedOption === null}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
              selectedOption !== null 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}>
            Kiểm tra đáp án
          </button>
        ) : (
          <button onClick={handleNextQuestion}
            className="px-8 py-3 bg-[#00d4aa] hover:bg-[#00e6b8] text-black rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)]">
            {currentQIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành Bài Thi'} 
          </button>
        )}
      </footer>
    </div>
  )
}
