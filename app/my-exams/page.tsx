'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Legend, Cell
} from 'recharts'
import { 
  Trophy, Target, Zap, BookOpen, 
  ChevronRight, Download, Filter, 
  AlertTriangle, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

// Mock Data (Sẽ được fetch từ DB trong tương lai)
const scoreHistory = [
  { date: '01/05', score: 65 },
  { date: '03/05', score: 72 },
  { date: '05/05', score: 68 },
  { date: '07/05', score: 85 },
  { date: '09/05', score: 92 },
]

const competencyData = [
  { subject: 'CPU', A: 90, fullMark: 100 },
  { subject: 'RAM', A: 45, fullMark: 100 },
  { subject: 'GPU', A: 80, fullMark: 100 },
  { subject: 'Storage', A: 70, fullMark: 100 },
  { subject: 'PSU', A: 60, fullMark: 100 },
  { subject: 'Mainboard', A: 85, fullMark: 100 },
]

const classComparison = [
  { name: 'Cá nhân', score: 92 },
  { name: 'Trung bình lớp', score: 78 },
]

export default function StudentAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 bg-[#0f0f1a] min-h-screen text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">Phân tích <span className="text-[#00d2a0]">Năng lực</span></h1>
          <p className="text-slate-400 font-medium italic">"Theo dõi sự tiến bộ và tối ưu hóa lộ trình học tập của bạn."</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#16213e] border border-[#1e293b] rounded-xl text-sm font-bold hover:bg-[#1e293b] transition-all">
          <Download size={18} /> Xuất báo cáo (PDF)
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bài thi đã làm', value: '12', icon: BookOpen, color: '#3b82f6' },
          { label: 'Điểm trung bình', value: '78.5', icon: Target, color: '#8b5cf6' },
          { label: 'Điểm cao nhất', value: '96', icon: Trophy, color: '#f59e0b' },
          { label: 'Tỷ lệ qua môn', value: '85%', icon: Zap, color: '#00d2a0' },
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[32px] bg-[#16213e] border border-[#1e293b] relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="p-3 w-fit rounded-2xl bg-[#0f0f1a] mb-4 group-hover:scale-110 transition-transform">
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div className="text-3xl font-black mb-1">{card.value}</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.label}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-10" style={{ backgroundColor: card.color }}></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart: Score Progress */}
        <div className="p-8 rounded-[40px] bg-[#16213e] border border-[#1e293b]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
             <ArrowUpRight className="text-[#00d2a0]" /> Tiến độ học tập
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ background: '#0f0f1a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#00d2a0', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="#00d2a0" strokeWidth={4} dot={{ r: 6, fill: '#00d2a0', strokeWidth: 2, stroke: '#0f0f1a' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Competency Map */}
        <div className="p-8 rounded-[40px] bg-[#16213e] border border-[#1e293b]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
             <Zap className="text-[#f59e0b]" /> Bản đồ Năng lực (Radar)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Cá nhân"
                  dataKey="A"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam History Table */}
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-[#16213e] border border-[#1e293b] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold">Lịch sử bài thi</h3>
             <div className="flex gap-2">
                <button className="p-2 bg-[#0f0f1a] rounded-lg text-slate-500 hover:text-white transition-all"><Filter size={18} /></button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 uppercase font-black text-[10px] tracking-widest border-b border-[#1e293b]">
                <tr>
                  <th className="px-4 py-4">Tên bài thi</th>
                  <th className="px-4 py-4">Ngày làm</th>
                  <th className="px-4 py-4 text-center">Điểm</th>
                  <th className="px-4 py-4 text-center">Xếp loại</th>
                  <th className="px-4 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { title: 'Kiến thức CPU Cơ bản', date: '09/05/2026', score: 92, grade: 'Xuất sắc' },
                  { title: 'Lắp ráp PC Lab #1', date: '07/05/2026', score: 85, grade: 'Giỏi' },
                  { title: 'Trắc nghiệm Linh kiện', date: '05/05/2026', score: 68, grade: 'Khá' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all group cursor-pointer">
                    <td className="px-4 py-6 font-bold">{item.title}</td>
                    <td className="px-4 py-6 text-slate-500 font-medium">{item.date}</td>
                    <td className="px-4 py-6 text-center font-black text-lg">{item.score}</td>
                    <td className="px-4 py-6 text-center">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                        ${item.grade === 'Xuất sắc' ? 'bg-[#00d2a0]/10 text-[#00d2a0]' : 
                          item.grade === 'Giỏi' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'}
                       `}>
                         {item.grade}
                       </span>
                    </td>
                    <td className="px-4 py-6 text-right">
                       <button className="p-2 rounded-full hover:bg-white/10 text-slate-500 group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weak Point Analysis (AI Suggestion) */}
        <div className="space-y-6">
          <div className="p-8 rounded-[40px] bg-[#16213e] border border-red-500/30 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest mb-4">
                   <AlertTriangle size={16} /> Cảnh báo lỗ hổng kiến thức
                </div>
                <h4 className="text-xl font-bold mb-4">Chủ đề: RAM & Khả năng tương thích</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                   Bạn hay trả lời sai các câu hỏi liên quan đến **Bus RAM** và **Sự tương thích giữa Mainboard & CPU**. Điều này có thể gây lỗi khi thực hành lắp ráp máy tính thật.
                </p>
                <Link href="/lessons/ram-basics" className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
                   Ôn tập chủ đề này ngay <ChevronRight size={16} />
                </Link>
             </div>
             {/* Glow */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 blur-3xl opacity-5"></div>
          </div>

          <div className="p-8 rounded-[40px] bg-[#00d2a0]/5 border border-[#00d2a0]/20">
             <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#00d2a0]" /> Gợi ý từ AI Guru
             </h4>
             <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2 italic">
                   "Hãy thử làm lại bài thi 'Lắp ráp PC Lab #1' để cải thiện kỹ năng chọn nguồn (PSU) nhé!"
                </li>
                <li className="flex items-start gap-2 italic">
                   "Bạn đã tiến bộ 20% so với tuần trước. Tiếp tục phát huy!"
                </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
