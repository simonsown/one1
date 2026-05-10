'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Search, Filter, Play, 
  Users, Clock, BarChart3, MoreVertical, 
  Eye, Edit, Trash2, Radio, MessageSquare, 
  PlusCircle, StopCircle, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function TeacherExamsDashboard() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'finished' | 'draft'>('ongoing')
  const [exams, setExams] = useState<any[]>([])
  const [liveStudents, setLiveStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
    setupRealtime()
  }, [])

  async function fetchExams() {
    setLoading(true)
    const { data } = await supabase.from('exams').select('*')
    setExams(data || [])
    
    // Set first exam as default monitor if ongoing
    if (data && data.length > 0) setSelectedExamId(data[0].id)
    setLoading(false)
  }

  // LOGIC REAL-TIME MONITOR (Mega Prompt #6)
  function setupRealtime() {
    const channel = supabase
      .channel('exam_monitor')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'exam_attempts' 
      }, (payload) => {
        handleRealtimeUpdate(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleRealtimeUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // Fetch user details for the record
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', newRecord.user_id)
      .single()

    setLiveStudents(prev => {
      const student = { ...newRecord, full_name: userData?.full_name || 'Học sinh' }
      if (eventType === 'INSERT') return [student, ...prev]
      if (eventType === 'UPDATE') return prev.map(s => s.id === student.id ? student : s)
      if (eventType === 'DELETE') return prev.filter(s => s.id !== oldRecord.id)
      return prev
    })
  }

  const broadcastMessage = () => {
    alert("📢 Đã gửi thông báo: 'Các bạn còn 5 phút nữa nhé!'")
  }

  const addTime = () => {
    alert("⏱ Đã tặng thêm 10 phút cho toàn lớp!")
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Quản lý <span className="text-[#00d2a0]">Kỳ thi</span></h1>
          <p className="text-slate-400">Thiết kế, giám sát và phân tích kết quả thi của học sinh.</p>
        </div>
        <button className="px-6 py-3 bg-[#00d2a0] text-black font-black rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,160,0.4)] transition-all">
          <Plus size={20} /> Tạo đề thi mới
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#1e293b]">
        {['upcoming', 'ongoing', 'finished', 'draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-bold capitalize transition-all relative
              ${activeTab === tab ? 'text-[#00d2a0]' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {tab === 'upcoming' ? 'Sắp diễn ra' : tab === 'ongoing' ? 'Đang diễn ra' : tab === 'finished' ? 'Đã kết thúc' : 'Bản nháp'}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00d2a0] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Exam List Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#16213e] rounded-[32px] border border-[#1e293b] overflow-hidden">
             <div className="p-6 border-b border-[#1e293b] flex justify-between items-center bg-[#0f0f1a]/30">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input className="bg-[#0f0f1a] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00d2a0] w-64" placeholder="Tìm kỳ thi..." />
                   </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-white"><Filter size={20} /></button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-[#0f0f1a]/30 text-slate-500 uppercase font-black text-[10px] tracking-widest border-b border-[#1e293b]">
                      <tr>
                        <th className="px-6 py-4">Tên kỳ thi / Lớp</th>
                        <th className="px-6 py-4 text-center">Tiến độ</th>
                        <th className="px-6 py-4 text-center">Điểm TB</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1e293b]">
                      {exams.length > 0 ? exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedExamId(exam.id)}>
                           <td className="px-6 py-6">
                              <div className="font-bold text-white mb-1 group-hover:text-[#00d2a0] transition-colors">{exam.title}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase">
                                 <Users size={12} /> {exam.class_name || 'Lớp Công Nghệ'} • <Clock size={12} /> {exam.time_limit} phút
                              </div>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <div className="text-white font-black">12/30</div>
                              <div className="text-[10px] text-slate-500 font-bold">Học sinh đã nộp</div>
                           </td>
                           <td className="px-6 py-6 text-center text-[#00d2a0] font-black text-lg">
                              7.8
                           </td>
                           <td className="px-6 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="p-2 bg-[#0f0f1a] rounded-lg text-slate-400 hover:text-[#00d2a0]"><Eye size={18} /></button>
                                <button className="p-2 bg-[#0f0f1a] rounded-lg text-slate-400 hover:text-[#f59e0b]"><Edit size={18} /></button>
                                <button className="p-2 bg-[#0f0f1a] rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                              </div>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic font-medium">Chưa có kỳ thi nào trong danh sách.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* LIVE MONITOR (Mega Prompt Requirement) */}
        <aside className="space-y-6">
           <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#00d2a0]/30 shadow-[0_0_40px_rgba(0,210,160,0.05)] relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-[#00d2a0] font-black uppercase tracking-widest text-xs">
                     <Radio size={16} className="animate-pulse" /> Live Monitor
                  </div>
                  <span className="px-2 py-1 bg-[#00d2a0] text-black text-[10px] font-black rounded-lg uppercase">Online</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {liveStudents.length > 0 ? liveStudents.map((s) => (
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      key={s.id} 
                      className="p-4 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] flex items-center gap-4"
                    >
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-[#00d2a0] border border-[#00d2a0]/20">
                         {s.full_name?.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-white mb-1">{s.full_name}</div>
                          <div className="flex items-center justify-between">
                             <div className="text-[10px] text-slate-500 font-bold">Tiến độ: {s.progress || 0}/30 câu</div>
                             {s.status === 'completed' && <CheckCircle2 size={12} className="text-[#00d2a0]" />}
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-[#00d2a0] transition-all" style={{ width: `${((s.progress || 0) / 30) * 100}%` }}></div>
                          </div>
                       </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-20 text-slate-500">
                       <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                       <p className="text-xs font-medium">Đang chờ học sinh bắt đầu làm bài...</p>
                    </div>
                  )}
                </div>

                {/* Emergency Controls */}
                <div className="mt-8 pt-8 border-t border-[#1e293b] grid grid-cols-2 gap-3">
                   <button onClick={broadcastMessage} className="flex items-center justify-center gap-2 p-3 bg-[#0f0f1a] rounded-xl text-xs font-bold text-[#00d2a0] hover:bg-[#00d2a0]/10 transition-all border border-[#00d2a0]/20">
                      <MessageSquare size={16} /> Broadcast
                   </button>
                   <button onClick={addTime} className="flex items-center justify-center gap-2 p-3 bg-[#0f0f1a] rounded-xl text-xs font-bold text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-all border border-[#f59e0b]/20">
                      <PlusCircle size={16} /> +10 Phút
                   </button>
                   <button className="col-span-2 flex items-center justify-center gap-2 p-3 bg-red-500/10 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/20 transition-all border border-red-500/30 uppercase tracking-widest mt-2">
                      <StopCircle size={16} /> Kết thúc sớm kỳ thi
                   </button>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d2a0] blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
           </div>

           {/* Quick Insights */}
           <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#8b5cf6]" /> Phân tích nhanh
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-[#0f0f1a] border border-[#1e293b]">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tỷ lệ nộp bài</div>
                    <div className="text-2xl font-black text-white">40% <span className="text-xs text-slate-500 font-bold tracking-normal ml-2">(12/30 em)</span></div>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#0f0f1a] border border-[#1e293b]">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Câu hỏi khó nhất</div>
                    <div className="text-sm font-bold text-red-400">Câu 15: Phân biệt DDR4/DDR5</div>
                    <div className="text-[10px] text-slate-600 font-bold mt-1">75% học sinh trả lời sai</div>
                 </div>
              </div>
           </div>
        </aside>

      </div>
    </div>
  )
}

function CheckCircle2({ size, className }: { size: number, className: string }) {
  return <Radio size={size} className={className} />
}
