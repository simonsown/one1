'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Clock, Send, 
  AlertTriangle, CheckCircle2, List, Timer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { submitExamAttempt } from '@/lib/exam-actions'
import { supabase } from '@/lib/supabase'

type Question = {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'boolean' | 'fill' | 'essay';
  options?: { id: string; text: string }[];
  correctAnswer?: any;
}

type ExamPlayerProps = {
  examId: string;
  attemptId: string;
  questions: Question[];
  timeLimit: number; // in minutes
}

export default function ExamPlayer({ examId, attemptId, questions, timeLimit }: ExamPlayerProps) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleAnswer = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  // Real-time progress update (Mega Prompt #6 Requirement)
  useEffect(() => {
    const updateProgress = async () => {
      const answeredCount = Object.keys(answers).length
      if (answeredCount > 0) {
        await supabase
          .from('exam_attempts')
          .update({ progress: answeredCount })
          .eq('id', attemptId)
      }
    }
    updateProgress()
  }, [answers, attemptId])

  const handleAutoSubmit = () => {
    if (!isSubmitting) handleSubmit()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simple mock score calculation
    const score = Math.floor(Math.random() * 50) + 50 // 50-100
    const timeSpent = timeLimit * 60 - timeLeft
    
    const res = await submitExamAttempt(attemptId, answers, score, timeSpent)
    if (res.success) {
      router.push(`/exam/${examId}/result/${attemptId}`)
    } else {
      alert("Lỗi khi nộp bài: " + res.error)
      setIsSubmitting(false)
    }
  }

  const activeQ = questions[currentIdx]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">
      {/* Header / Timer Bar */}
      <header className="h-20 bg-[#16213e] border-b border-[#1e293b] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#00d2a0]/10 rounded-lg text-[#00d2a0]">
            <Timer size={24} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Thời gian còn lại</div>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
           {questions.map((_, i) => (
             <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all 
                  ${i === currentIdx ? 'bg-[#00d2a0] w-6' : (answers[questions[i].id] ? 'bg-[#00b4d8]' : 'bg-slate-700')}
                `}
             />
           ))}
        </div>

        <button 
          onClick={() => { if(confirm("Bạn chắc chắn muốn nộp bài?")) handleSubmit() }}
          disabled={isSubmitting}
          className="bg-[#00d2a0] text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,160,0.4)] transition-all disabled:opacity-50"
        >
          <Send size={18} /> {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Navigation Sidebar */}
        <aside className="w-20 md:w-64 bg-[#16213e]/50 border-r border-[#1e293b] overflow-y-auto p-4 hidden md:block">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">Danh sách câu hỏi</h3>
           <div className="grid grid-cols-1 gap-2">
             {questions.map((q, i) => (
               <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${currentIdx === i ? 'bg-[#00d2a0]/10 border-[#00d2a0] text-[#00d2a0]' : 
                      (answers[q.id] ? 'bg-[#0f0f1a] border-[#1e293b] text-[#00b4d8]' : 'bg-transparent border-transparent text-slate-500 hover:bg-[#1e293b]')
                    }
                  `}
               >
                 <span className="font-bold text-sm">Câu {i + 1}</span>
                 {answers[q.id] && <CheckCircle2 size={14} className="ml-auto" />}
               </button>
             ))}
           </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-10">
                <span className="inline-block px-3 py-1 bg-[#00b4d8]/10 text-[#00b4d8] rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                  {activeQ.type === 'single' ? 'Trắc nghiệm 1 đáp án' : 
                   activeQ.type === 'multiple' ? 'Trắc nghiệm nhiều đáp án' : 
                   activeQ.type === 'boolean' ? 'Đúng / Sai' : 
                   activeQ.type === 'fill' ? 'Điền vào chỗ trống' : 'Tự luận ngắn'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  <span className="text-slate-500 mr-4 italic">Câu {currentIdx + 1}.</span>
                  {activeQ.text}
                </h2>
              </div>

              {/* Answers Input */}
              <div className="space-y-4 mb-20">
                {activeQ.type === 'single' && activeQ.options?.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(activeQ.id, opt.id)}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4
                      ${answers[activeQ.id] === opt.id ? 'bg-[#00d2a0]/10 border-[#00d2a0]' : 'bg-[#16213e] border-[#1e293b] hover:border-slate-500'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs
                      ${answers[activeQ.id] === opt.id ? 'border-[#00d2a0] bg-[#00d2a0] text-black' : 'border-slate-500 text-slate-500'}
                    `}>{opt.id}</div>
                    <span className="text-lg font-medium">{opt.text}</span>
                  </button>
                ))}

                {activeQ.type === 'boolean' && (
                  <div className="flex gap-4">
                     {['Đúng', 'Sai'].map(val => (
                       <button
                         key={val}
                         onClick={() => handleAnswer(activeQ.id, val)}
                         className={`flex-1 p-8 rounded-3xl border-2 font-bold text-xl transition-all
                           ${answers[activeQ.id] === val ? 'bg-[#00d2a0] border-[#00d2a0] text-black shadow-[0_0_30px_rgba(0,210,160,0.2)]' : 'bg-[#16213e] border-[#1e293b]'}
                         `}
                       >
                         {val}
                       </button>
                     ))}
                  </div>
                )}

                {activeQ.type === 'fill' && (
                  <input 
                    type="text"
                    value={answers[activeQ.id] || ''}
                    onChange={(e) => handleAnswer(activeQ.id, e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-6 bg-[#16213e] border-2 border-[#1e293b] rounded-2xl focus:outline-none focus:border-[#00d2a0] text-xl font-bold transition-all"
                  />
                )}

                {activeQ.type === 'essay' && (
                  <textarea 
                    rows={8}
                    value={answers[activeQ.id] || ''}
                    onChange={(e) => handleAnswer(activeQ.id, e.target.value)}
                    placeholder="Viết câu trả lời tự luận tại đây..."
                    className="w-full p-6 bg-[#16213e] border-2 border-[#1e293b] rounded-2xl focus:outline-none focus:border-[#00d2a0] text-lg leading-relaxed transition-all"
                  />
                )}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-10 border-t border-[#1e293b]">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="p-4 rounded-xl bg-[#16213e] border border-[#1e293b] disabled:opacity-30 hover:bg-[#1e293b] transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={20} /> Câu trước
                </button>
                <div className="text-slate-500 font-bold text-sm">Câu {currentIdx + 1} / {questions.length}</div>
                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="p-4 rounded-xl bg-[#16213e] border border-[#1e293b] disabled:opacity-30 hover:bg-[#1e293b] transition-all flex items-center gap-2 text-[#00d2a0]"
                >
                  Câu sau <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
