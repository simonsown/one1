'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { ClipboardCheck, Plus, Search, Filter, Loader2, Calendar, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  async function fetchAssignments() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('assignments')
        .select(`
          *,
          classes (name),
          lessons (title)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      setAssignments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-[#00d2a0] mb-2 font-bold uppercase tracking-widest text-[10px]">
             <ClipboardCheck size={14} /> Quản lý bài tập
           </div>
           <h1 className="text-4xl font-black">Danh sách <span className="text-[#00d2a0]">Nhiệm vụ</span></h1>
        </div>
        <Link href="/teacher/assignments/new" className="px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl shadow-lg hover:shadow-[#00d2a0]/40 transition-all flex items-center gap-2">
           <Plus size={20} /> Giao bài mới
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập đã giao..." 
              className="w-full bg-[#16213e] border border-[#1e293b] rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#00d2a0] transition-all"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d2a0]" /></div>
      ) : assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((asg) => (
            <motion.div 
              key={asg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#16213e] border border-[#1e293b] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#00d2a0]/30 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{asg.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1"><Users size={12} /> {asg.classes?.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Hạn: {asg.due_date ? new Date(asg.due_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="flex-1 md:text-right px-6">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Trạng thái</div>
                    <div className="flex items-center gap-2 justify-end">
                       <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                       <span className="text-sm font-bold text-white">Đang mở</span>
                    </div>
                 </div>
                 <Link href={`/teacher/assignments/${asg.id}`} className="p-4 bg-[#1e293b] rounded-2xl text-slate-400 hover:text-white transition-all">
                    <ArrowRight size={20} />
                 </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#16213e]/30 border border-dashed border-[#1e293b] rounded-[40px]">
           <ClipboardCheck size={48} className="mx-auto text-slate-600 mb-4" />
           <p className="text-slate-500 font-medium italic">Bạn chưa giao nhiệm vụ nào cho lớp.</p>
        </div>
      )}
    </div>
  )
}
