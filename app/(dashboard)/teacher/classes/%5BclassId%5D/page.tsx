'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Users, BookOpen, FileText, BarChart3, Plus, Search, MoreVertical, ChevronRight, UserPlus, Mail, Calendar, MessageSquare, ArrowLeft, Download } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function TeacherClassDetailPage() {
  const { classId } = useParams()
  const [activeTab, setActiveTab] = useState('students')

  const students = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', progress: 85, score: 9.2 },
    { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', progress: 62, score: 7.5 },
    { id: 3, name: 'Lê Văn C', email: 'vanc@gmail.com', progress: 45, score: 6.8 },
  ]

  const assignments = [
    { id: 'a1', title: 'Lắp ráp PC cơ bản', deadline: '20/05/2026', submitted: 28, total: 35 },
    { id: 'a2', title: 'Phân loại RAM', deadline: '15/05/2026', submitted: 35, total: 35 },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/teacher/classes" className="p-2 hover:bg-[#16213e] rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lớp {classId} - Tin học cơ bản</h1>
            <p className="text-slate-500 text-sm">Giáo viên: Nguyễn Văn Giáo</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b]">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Sĩ số</p>
            <p className="text-3xl font-black">42</p>
          </div>
          <div className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b]">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Tiến độ TB</p>
            <p className="text-3xl font-black text-[#00d2a0]">68%</p>
          </div>
          <div className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b]">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Bài tập</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b]">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Điểm TB</p>
            <p className="text-3xl font-black text-blue-400">8.5</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#1e293b] mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
           {['students', 'assignments', 'attendance', 'reports'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-all ${
                 activeTab === tab ? 'text-[#00d2a0]' : 'text-slate-500 hover:text-white'
               }`}
             >
               {tab === 'students' ? 'Học sinh' : tab === 'assignments' ? 'Bài tập' : tab === 'attendance' ? 'Điểm danh' : 'Báo cáo'}
               {activeTab === tab && <motion.div layoutId="classTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d2a0]" />}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="text" placeholder="Tìm tên học sinh..." className="w-full bg-[#16213e] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[#00d2a0]" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#00d2a0] text-black font-bold rounded-xl text-sm">
                  <UserPlus size={16} /> MỜI HỌC SINH
                </button>
              </div>

              <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0f0f1a] text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4">Họ và tên</th>
                      <th className="px-6 py-4 text-center">Tiến độ</th>
                      <th className="px-6 py-4 text-center">Điểm TB</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-[#1e293b]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0f0f1a] border border-[#2a3655] flex items-center justify-center font-bold text-[#00d2a0]">{s.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-bold">{s.name}</p>
                              <p className="text-[10px] text-slate-500">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="w-32 mx-auto">
                             <div className="flex items-center justify-between text-[10px] mb-1">
                               <span className="text-slate-500 font-bold">{s.progress}%</span>
                             </div>
                             <div className="h-1 bg-[#0f0f1a] rounded-full overflow-hidden">
                               <div className="bg-[#00d2a0] h-full" style={{ width: `${s.progress}%` }} />
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-[#00d2a0]">
                          {s.score}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-2 text-slate-500 hover:text-white transition-colors">
                             <BarChart3 size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {assignments.map(a => (
                   <div key={a.id} className="bg-[#16213e] border border-[#1e293b] rounded-2xl p-6 hover:border-[#00d2a0]/50 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                          <FileText size={24} />
                        </div>
                        <span className="text-[10px] text-red-400 font-bold uppercase px-2 py-1 bg-red-500/10 rounded">Hạn: {a.deadline}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{a.title}</h3>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs text-slate-500">Đã nộp: <span className="text-white font-bold">{a.submitted}/{a.total}</span></span>
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full border-2 border-[#16213e] bg-slate-700" />
                           ))}
                        </div>
                      </div>
                      <button className="w-full py-3 bg-[#1e293b] hover:bg-[#2a3655] rounded-xl text-xs font-bold transition-all">
                        XEM BÀI NỘP
                      </button>
                   </div>
                 ))}
                 <button className="border-2 border-dashed border-[#1e293b] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-[#00d2a0] hover:border-[#00d2a0]/50 transition-all">
                   <Plus size={32} />
                   <span className="font-bold text-sm">GIAO BÀI TẬP MỚI</span>
                 </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] text-center py-20">
               <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BarChart3 size={40} />
               </div>
               <h3 className="text-2xl font-bold mb-4">Báo cáo tổng hợp lớp học</h3>
               <p className="text-slate-400 max-w-md mx-auto mb-8">Xuất dữ liệu tiến độ, điểm số và chuyên cần của cả lớp ra file Excel/PDF để lưu trữ.</p>
               <div className="flex justify-center gap-4">
                 <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] rounded-xl font-bold text-sm hover:bg-[#2a3655] transition-all">
                   <Download size={18} /> XUẤT EXCEL
                 </button>
                 <button className="flex items-center gap-2 px-6 py-3 bg-[#00d2a0] text-black rounded-xl font-bold text-sm hover:bg-[#00e6af] transition-all">
                   XEM ANALYTICS
                 </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                   <Calendar size={20} className="text-[#00d2a0]" />
                   <span className="font-bold">Điểm danh ngày: 10/05/2026</span>
                 </div>
                 <button className="px-5 py-2 bg-[#1e293b] border border-[#2a3655] rounded-xl text-xs font-bold text-white hover:bg-[#2a3655] transition-all">
                   CHỌN NGÀY KHÁC
                 </button>
               </div>

               <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#0f0f1a] text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <th className="px-6 py-4">Học sinh</th>
                        <th className="px-6 py-4 text-center">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]">
                      {students.map(s => (
                        <tr key={s.id} className="hover:bg-[#1e293b]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs">{s.name.charAt(0)}</div>
                              <span className="text-sm font-medium">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex justify-center gap-2">
                               {['P', 'V', 'M'].map(status => (
                                 <button 
                                   key={status}
                                   className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                                     status === 'P' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                     status === 'V' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                   }`}
                                 >
                                   {status}
                                 </button>
                               ))}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <input type="text" placeholder="..." className="bg-transparent border-b border-[#1e293b] outline-none text-xs text-slate-500 focus:border-[#00d2a0] text-right" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>

               <div className="mt-8 flex justify-end">
                 <button className="px-8 py-3 bg-[#00d2a0] text-black font-bold rounded-xl shadow-xl hover:bg-[#00e6af] transition-all">
                   LƯU ĐIỂM DANH
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
