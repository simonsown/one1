'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { HelpCircle, Zap, Star, Loader2, Search, Award, Flame, Play } from 'lucide-react'
import Link from 'next/link'

export default function StudentQuizPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    try {
      setLoading(true)
      
      // Fetch sections of type 'quiz'
      const { data: sections } = await supabase
        .from('lesson_sections')
        .select(`
          *,
          lessons (title)
        `)
        .eq('content_type', 'quiz')

      if (sections && sections.length > 0) {
        setQuizzes(sections)
      } else {
        // High-fidelity fallback exams if DB does not have entries yet
        setQuizzes([
          {
            id: 'quiz-cpu-base',
            title: 'Trắc Nghiệm Kiến Thức CPU Căn Bản',
            lessons: { title: 'Bộ vi xử lý (CPU)' },
            estimated_minutes: 15,
            difficulty: 'Dễ',
            xp: 50
          },
          {
            id: 'quiz-ram-ssd',
            title: 'Hệ Thống Nhớ & Lưu Trữ Tốc Độ Cao',
            lessons: { title: 'RAM & SSD' },
            estimated_minutes: 20,
            difficulty: 'Trung bình',
            xp: 100
          },
          {
            id: 'quiz-gpu-gaming',
            title: 'Card Đồ Họa & Khả Năng Xử Lý Đồ Họa 3D',
            lessons: { title: 'Card đồ họa (GPU)' },
            estimated_minutes: 15,
            difficulty: 'Khó',
            xp: 150
          },
          {
            id: 'quiz-psu-cooling',
            title: 'Nguồn Điện (PSU) & Hệ Thống Tản Nhiệt PC',
            lessons: { title: 'Nguồn & Tản nhiệt' },
            estimated_minutes: 25,
            difficulty: 'Trung bình',
            xp: 100
          }
        ])
      }
    } catch (err) {
      console.error('Error fetching student quizzes:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.lessons?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0d0e13] text-white pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Award className="text-[#00d4aa]" size={36} />
              Ngân Hàng <span className="text-[#00d4aa]">Đề Thi & Quiz</span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">Đánh giá kiến thức phần cứng, tích lũy điểm XP để mở khóa danh hiệu mới</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm bài trắc nghiệm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16213e]/50 border border-gray-800 focus:border-[#00d4aa] outline-none pl-11 pr-4 py-2.5 rounded-2xl text-sm transition-all"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-gradient-to-br from-[#00d4aa]/10 to-teal-500/10 border border-[#00d4aa]/20 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4aa]/25 text-[#00d4aa] flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Động lực học tập</p>
              <h3 className="text-xl font-bold mt-0.5">X2 điểm XP hôm nay</h3>
            </div>
          </div>

          <div className="p-6 bg-[#16213e]/40 border border-gray-800 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Độ chính xác trung bình</p>
              <h3 className="text-xl font-bold mt-0.5">85% Mục tiêu đạt</h3>
            </div>
          </div>

          <div className="p-6 bg-[#16213e]/40 border border-gray-800 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Học tập chuyên cần</p>
              <h3 className="text-xl font-bold mt-0.5">5 Ngày Liên Tiếp</h3>
            </div>
          </div>
        </div>

        {/* Loading / Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-[#00d4aa]" size={40} />
            <span className="text-xs text-gray-500">Đang đồng bộ ngân hàng đề thi...</span>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1a1c25]/80 border border-gray-800 rounded-3xl p-6 hover:shadow-[0_0_30px_rgba(0,212,170,0.05)] hover:border-gray-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-gray-900/60 px-2.5 py-1 rounded-md">
                      {quiz.lessons?.title || 'Chương Trình PC'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      quiz.difficulty === 'Dễ' ? 'bg-green-500/10 text-green-400' :
                      quiz.difficulty === 'Khó' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {quiz.difficulty || 'Trung bình'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-6 text-white group-hover:text-[#00d4aa] transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>⏱️ {quiz.estimated_minutes || 15} phút</span>
                    <span className="text-[#00d4aa] font-bold">⚡ +{quiz.xp || 100} XP</span>
                  </div>

                  <Link 
                    href={`/student/quiz/${quiz.id}`}
                    className="w-full py-3 bg-[#0d0e13] text-white border border-gray-800 hover:border-[#00d4aa] hover:text-[#00d4aa] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    BẮT ĐẦU LÀM BÀI <Play size={14} fill="currentColor" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#16213e]/20 border border-dashed border-gray-800 rounded-[32px]">
            <HelpCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium italic">Không tìm thấy bài trắc nghiệm nào phù hợp.</p>
          </div>
        )}

      </div>
    </div>
  )
}
