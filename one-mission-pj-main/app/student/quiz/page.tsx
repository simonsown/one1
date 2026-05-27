'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { HelpCircle, Zap, Star, Loader2, Search, Award, Flame, Play, ArrowLeft, BrainCircuit, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QUIZ_BANK } from '@/data/quiz-bank'

function Flashcards() {
  const [cards] = useState(() => {
    const all = QUIZ_BANK.slice(0, 15).map(q => ({
      front: q.title,
      back: `${q.questions.length} câu hỏi về ${q.lessonTitle} - ${q.difficulty}`
    }))
    return all
  })
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BrainCircuit size={20} className="text-[#00d4aa]" />
        Flashcard Thuật Ngữ ({current + 1}/{cards.length})
      </h2>
      <div className="relative" style={{ perspective: '1000px', height: '180px' }}>
        <motion.div
          key={current}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          className="w-full h-full cursor-pointer"
          onClick={() => setFlipped(!flipped)}
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f53] to-[#0f1a2e] border border-[#00d4aa]/20 rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-lg font-bold text-white text-center">{cards[current].front}</span>
            <span className="text-xs text-gray-400 mt-2">Chạm để xem chi tiết</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/10 to-teal-500/10 border border-[#00d4aa]/30 rounded-2xl p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-sm text-white text-center">{cards[current].back}</span>
          </div>
        </motion.div>
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={() => { setFlipped(false); setCurrent(c => Math.max(0, c - 1)) }} disabled={current === 0}
          className="px-4 py-2 bg-[#16213e]/50 border border-gray-800 rounded-xl text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-all">
          ← Trước
        </button>
        <button onClick={() => { setFlipped(false); setCurrent(c => (c + 1) % cards.length) }}
          className="px-4 py-2 bg-[#16213e]/50 border border-gray-800 rounded-xl text-xs text-gray-400 hover:text-white transition-all">
          Sau →
        </button>
        <button onClick={() => { setFlipped(false); setCurrent(Math.floor(Math.random() * cards.length)) }}
          className="px-4 py-2 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl text-xs text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-all flex items-center gap-1">
          <RotateCcw size={12} /> Ngẫu nhiên
        </button>
      </div>
    </div>
  )
}

export default function StudentQuizPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [motivation, setMotivation] = useState('Đang tải...')
  const [accuracy, setAccuracy] = useState('Đang tải...')
  const [streak, setStreak] = useState('Đang tải...')
  const [xpBoost, setXpBoost] = useState(false)
  const [unlockedCount, setUnlockedCount] = useState(5)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchQuizzes()
    fetchRealTimeStats()
  }, [])

  async function fetchRealTimeStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Accuracy from quiz attempts
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score, total_questions, created_at')
        .eq('user_id', user.id)

      if (attempts && attempts.length > 0) {
        const totalScore = attempts.reduce((s, a) => s + (a.score || 0), 0)
        const totalQ = attempts.reduce((s, a) => s + (a.total_questions || 0), 0)
        const avg = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0
        setAccuracy(`${avg}%`)
        
        // XP boost - if did quiz today
        const today = new Date().toISOString().split('T')[0]
        const todayAttempts = attempts.filter(a => 
          a.created_at && a.created_at.startsWith(today)
        )
        const hasDoneToday = todayAttempts.length > 0
        setXpBoost(!hasDoneToday)
        setMotivation(!hasDoneToday ? 'X2 điểm XP hôm nay' : 'Đã nhận thưởng hôm nay')
      } else {
        setAccuracy('0%')
        setMotivation('Làm quiz ngay để nhận XP!')
      }

      // Streak from lesson_progress
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (progress && progress.length > 0) {
        let streakCount = 0
        const today = new Date()
        for (let i = 0; i < progress.length; i++) {
          const d = new Date(progress[i].completed_at)
          const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
          if (diff === streakCount || diff === 0) {
            streakCount++
            today.setDate(today.getDate() - 1)
          } else break
        }
        setStreak(`${streakCount} Ngày`)
      } else {
        setStreak('0 Ngày')
      }

      // Auto-unlock: base on XP earned
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', user.id)
        .single()

      const xp = (profile?.total_score as number) || 0
      // Unlock 1 quiz per 100 XP, starting with 5
      const unlocked = Math.min(5 + Math.floor(xp / 100), QUIZ_BANK.length)
      setUnlockedCount(unlocked)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  async function fetchQuizzes() {
    try {
      setLoading(true)
      
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select(`*, lessons (title)`)
        .eq('content_type', 'quiz')

      if (sections && sections.length > 0) {
        setQuizzes(sections.map(s => ({
          ...s,
          id: s.id,
          title: s.title,
          lessons: s.lessons,
          estimated_minutes: s.estimated_minutes || 15,
          difficulty: s.difficulty || 'Trung bình',
          xp: s.xp || 100
        })))
      } else {
        // Use the comprehensive quiz bank
        setQuizzes(QUIZ_BANK.map(q => ({
          id: q.id,
          title: q.title,
          lessons: { title: q.lessonTitle },
          estimated_minutes: q.estimated_minutes,
          difficulty: q.difficulty,
          xp: q.xp
        })))
      }
    } catch (err) {
      console.error('Error fetching student quizzes:', err)
      setQuizzes(QUIZ_BANK.map(q => ({
        id: q.id,
        title: q.title,
        lessons: { title: q.lessonTitle },
        estimated_minutes: q.estimated_minutes,
        difficulty: q.difficulty,
        xp: q.xp
      })))
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.lessons?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#00d4aa]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                Ngân Hàng <span className="text-[#00d4aa]">Đề Thi & Quiz</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{unlockedCount}/{QUIZ_BANK.length} bài đã mở khóa</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                placeholder="Tìm kiếm bài trắc nghiệm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16213e]/50 border border-gray-800 focus:border-[#00d4aa] outline-none pl-11 pr-4 py-2.5 rounded-2xl text-xs transition-all text-white placeholder-gray-500"
              />
            </div>

            <button 
              onClick={() => router.push('/builder')}
              className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại
            </button>
          </div>
        </div>

        <div className="relative w-full sm:hidden mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Tìm kiếm bài trắc nghiệm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16213e]/50 border border-gray-800 focus:border-[#00d4aa] outline-none pl-11 pr-4 py-2 rounded-2xl text-xs transition-all text-white placeholder-gray-500"
          />
        </div>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-6 bg-gradient-to-br from-[#00d4aa]/10 to-teal-500/10 border border-[#00d4aa]/20 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4aa]/25 text-[#00d4aa] flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Động lực học tập</p>
              <h3 className="text-xl font-bold mt-0.5">{motivation}</h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 bg-[#16213e]/40 border border-gray-800 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Độ chính xác trung bình</p>
              <h3 className="text-xl font-bold mt-0.5">{accuracy}</h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-6 bg-[#16213e]/40 border border-gray-800 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Học tập chuyên cần</p>
              <h3 className="text-xl font-bold mt-0.5">{streak}</h3>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-[#00d4aa]" size={40} />
            <span className="text-xs text-gray-500">Đang đồng bộ ngân hàng đề thi...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => {
                const isUnlocked = index < unlockedCount
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`bg-[#1a1c25]/80 border rounded-3xl p-6 transition-all flex flex-col justify-between group ${isUnlocked ? 'border-gray-800 hover:shadow-[0_0_30px_rgba(0,212,170,0.05)] hover:border-gray-700' : 'border-gray-800/50 opacity-50'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-gray-900/60 px-2.5 py-1 rounded-md">
                          {quiz.lessons?.title || 'Chương Trình PC'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          !isUnlocked ? 'bg-gray-500/10 text-gray-500' :
                          quiz.difficulty === 'Dễ' ? 'bg-green-500/10 text-green-400' :
                          quiz.difficulty === 'Khó' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {isUnlocked ? (quiz.difficulty || 'Trung bình') : '🔒 Khóa'}
                        </span>
                      </div>

                      <h3 className={`text-lg font-bold mb-6 line-clamp-2 ${isUnlocked ? 'text-white group-hover:text-[#00d4aa] transition-colors' : 'text-gray-500'}`}>
                        {quiz.title}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>⏱️ {quiz.estimated_minutes || 15} phút</span>
                        <span className="text-[#00d4aa] font-bold">⚡ +{quiz.xp || 100} XP</span>
                      </div>

                      {isUnlocked ? (
                        <Link 
                          href={`/student/quiz/${quiz.id}`}
                          className="w-full py-3 bg-[#0d0e13] text-white border border-gray-800 hover:border-[#00d4aa] hover:text-[#00d4aa] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                        >
                          BẮT ĐẦU LÀM BÀI <Play size={14} fill="currentColor" />
                        </Link>
                      ) : (
                        <div className="w-full py-3 bg-gray-900/50 text-gray-600 border border-gray-800/50 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm">
                          🔒 Mở khóa sau {index - unlockedCount + 1} ngày
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Flashcards Section */}
            <Flashcards />
          </>
        )}
      </div>
    </div>
  )
}
