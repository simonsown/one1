'use client'

import React from 'react'
import { BarChart3, TrendingUp, Brain, Target, Calendar, Clock, Award, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function StudentAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Phân tích <span className="text-[#00d2a0]">Năng lực</span></h1>
          <p className="text-slate-400">AI Guru phân tích dữ liệu học tập để giúp bạn tối ưu hóa lộ trình của mình.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
                 <div className="flex items-center justify-between mb-6">
                   <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Clock size={24} /></div>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tuần này</span>
                 </div>
                 <p className="text-slate-400 text-sm mb-1">Thời gian học tập</p>
                 <div className="flex items-end gap-2">
                   <p className="text-4xl font-black">12.5</p>
                   <p className="text-slate-500 font-bold mb-1">giờ</p>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-xs text-green-400 font-bold">
                    <TrendingUp size={14} /> <span>+2.4h so với tuần trước</span>
                 </div>
              </div>

              <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
                 <div className="flex items-center justify-between mb-6">
                   <div className="p-3 bg-[#00d2a0]/10 text-[#00d2a0] rounded-2xl"><Target size={24} /></div>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Độ chính xác</span>
                 </div>
                 <p className="text-slate-400 text-sm mb-1">Tỉ lệ trả lời đúng</p>
                 <div className="flex items-end gap-2">
                   <p className="text-4xl font-black text-[#00d2a0]">88%</p>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-bold">
                    <CheckCircle2 size={14} /> <span>Top 10% học viên</span>
                 </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-[#16213e] p-8 rounded-[40px] border border-[#1e293b] h-[400px] flex flex-col">
               <h3 className="text-xl font-bold mb-8">Biểu đồ tiến độ học tập</h3>
               <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className={`w-full max-w-[40px] rounded-t-xl ${i === 6 ? 'bg-[#00d2a0]' : 'bg-[#1e293b] hover:bg-[#2a3655]'}`}
                       />
                       <span className="text-[10px] text-slate-500 font-bold">T{i+2}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1e293b] to-[#16213e] p-8 rounded-[40px] border border-[#00d2a0]/20 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 p-10 opacity-5 rotate-12">
                 <Brain size={150} />
               </div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-[#00d2a0] text-black rounded-xl flex items-center justify-center">
                   <Brain size={20} />
                 </div>
                 <h3 className="font-bold">Gợi ý từ AI Guru</h3>
               </div>
               
               <div className="space-y-6">
                 <div className="p-5 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                   <p className="text-sm font-bold text-white mb-2">💡 Tập trung vào Mainboard</p>
                   <p className="text-xs text-slate-400 leading-relaxed">Bạn thường mất nhiều thời gian ở các câu hỏi về Chipset. Hãy xem lại bài giảng số 4.</p>
                 </div>
                 <div className="p-5 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                   <p className="text-sm font-bold text-white mb-2">⚡ Tăng cường luyện tập</p>
                   <p className="text-xs text-slate-400 leading-relaxed">Tốc độ lắp ráp của bạn đang nhanh hơn 15% so với tuần trước. Tiếp tục phát huy!</p>
                 </div>
                 <button className="w-full py-4 bg-[#00d2a0] text-black font-black rounded-2xl hover:bg-[#00e6af] transition-all text-xs">
                   XEM LỘ TRÌNH ĐỀ XUẤT
                 </button>
               </div>
            </div>

            <div className="bg-[#16213e] p-8 rounded-[40px] border border-[#1e293b]">
               <h3 className="font-bold mb-6 flex items-center gap-2">
                 <Award size={18} className="text-yellow-500" /> Thành tích gần đây
               </h3>
               <div className="space-y-4">
                 {[1, 2].map(i => (
                   <div key={i} className="flex items-center gap-4 p-3 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                     <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
                       <Award size={24} />
                     </div>
                     <div>
                       <p className="text-sm font-bold">Thợ máy Tập sự</p>
                       <p className="text-[10px] text-slate-500">Đã mở khóa 10/05/2026</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
