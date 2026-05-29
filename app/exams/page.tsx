'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { FileText, Clock, Trophy, ArrowRight, Loader2, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function ExamsListingPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  async function fetchExams() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // In this LMS, exams might be assignments of type 'exam' 
      // or we just fetch from an assignments table where title contains 'Thi' or 'Kiểm tra'
      const { data } = await supabase
        .from('assignments')
        .select(`
          *,
          classes (name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setExams(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Trung tâm <span className="text-[#089e60]">Khảo thí</span></h1>
          <p className="text-slate-400">Danh sách các bài kiểm tra và kỳ thi chính thức dành cho bạn.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm kỳ thi..." 
                className="w-full bg-[#ffffff] border border-[#e7e7e7] rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#089e60] transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-[#ffffff] border border-[#e7e7e7] rounded-xl hover:bg-[#e7e7e7] transition-all">
              <Filter size={18} /> Lọc
           </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#089e60]" size={40} />
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#ffffff] border border-[#e7e7e7] rounded-3xl p-6 hover:border-[#089e60]/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-[#089e60]/10 text-[#089e60] rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thời gian</span>
                    <p className="text-xs font-bold text-white flex items-center gap-1 justify-end mt-1">
                      <Clock size={12} /> 45 Phút
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-[#089e60] transition-colors">{exam.title}</h3>
                <p className="text-sm text-slate-400 mb-6 font-medium">Lớp: {exam.classes?.name || 'Toàn trường'}</p>

                <div className="flex items-center justify-between pt-6 border-t border-[#e7e7e7]">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-xs font-bold text-slate-500">100 XP</span>
                  </div>
                  <Link 
                    href={`/exams/${exam.id}`}
                    className="px-6 py-2 bg-[#089e60] text-black text-xs font-bold rounded-lg hover:bg-[#0b755b] transition-all flex items-center gap-2"
                  >
                    BẮT ĐẦU THI <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#ffffff]/30 border border-dashed border-[#e7e7e7] rounded-[40px]">
             <FileText size={48} className="mx-auto text-slate-600 mb-4" />
             <p className="text-slate-500 font-medium italic">Hiện tại chưa có kỳ thi nào đang diễn ra.</p>
          </div>
        )}
      </main>
    </div>
  )
}
