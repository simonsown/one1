'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { ClipboardCheck, ArrowLeft, Send, Loader2, Calendar, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewAssignmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    class_id: '',
    lesson_id: '',
    due_date: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cls } = await supabase.from('classes').select('*').eq('teacher_id', user.id)
    const { data: lsn } = await supabase.from('lessons').select('*').eq('teacher_id', user.id)
    
    setClasses(cls || [])
    setLessons(lsn || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('assignments').insert({
        ...formData,
        teacher_id: user.id
      })

      if (error) throw error
      router.push('/teacher/assignments')
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi giao bài.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/teacher/assignments" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
         <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-black mb-4">Giao <span className="text-[#00d2a0]">Nhiệm vụ</span> Mới</h1>
        <p className="text-slate-400 font-medium">Thiết lập bài tập, thời hạn và chọn lớp để gửi nội dung.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#16213e] p-10 rounded-[40px] border border-[#1e293b]">
         <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tiêu đề nhiệm vụ</label>
            <input 
              required
              type="text" 
              placeholder="Ví dụ: Kiểm tra kiến thức Mainboard tuần 1"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-4 outline-none focus:border-[#00d2a0] transition-all"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} /> Chọn Lớp học
               </label>
               <select 
                 required
                 value={formData.class_id}
                 onChange={e => setFormData({...formData, class_id: e.target.value})}
                 className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-4 outline-none focus:border-[#00d2a0] transition-all appearance-none"
               >
                 <option value="">-- Chọn lớp --</option>
                 {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} /> Gắn với Bài giảng (Tùy chọn)
               </label>
               <select 
                 value={formData.lesson_id}
                 onChange={e => setFormData({...formData, lesson_id: e.target.value})}
                 className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-4 outline-none focus:border-[#00d2a0] transition-all appearance-none"
               >
                 <option value="">-- Không gắn bài giảng --</option>
                 {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
               </select>
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Calendar size={14} /> Thời hạn hoàn thành
            </label>
            <input 
              required
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-4 outline-none focus:border-[#00d2a0] transition-all"
            />
         </div>

         <button 
           disabled={loading}
           type="submit"
           className="w-full py-5 bg-[#00d2a0] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#00d2a0]/20 disabled:opacity-50"
         >
           {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> GỬI NHIỆM VỤ NGAY</>}
         </button>
      </form>
    </div>
  )
}
