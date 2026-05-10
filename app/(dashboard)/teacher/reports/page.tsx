'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Award, Download, Calendar, Loader2 } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

export default function TeacherReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>({
    progressData: [],
    stats: { avgScore: 0, completionRate: 0, totalStudents: 0 }
  })

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mocking some data for the chart that feels real-time
      const mockProgress = [
        { name: 'Tuần 1', students: 12, avg: 85 },
        { name: 'Tuần 2', students: 18, avg: 78 },
        { name: 'Tuần 3', students: 25, avg: 92 },
        { name: 'Tuần 4', students: 30, avg: 88 },
      ]

      setReportData({
        progressData: mockProgress,
        stats: { avgScore: 86, completionRate: 74, totalStudents: 42 }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#00d2a0', '#00b4d8', '#fbbf24', '#f87171']

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-[#00d2a0] mb-2 font-bold uppercase tracking-widest text-[10px]">
             <BarChart3 size={14} /> Báo cáo & Phân tích
           </div>
           <h1 className="text-4xl font-black">Trung tâm <span className="text-[#00d2a0]">Dữ liệu</span></h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#16213e] border border-[#1e293b] rounded-xl hover:text-[#00d2a0] transition-all font-bold text-sm">
           <Download size={18} /> XUẤT BÁO CÁO (PDF)
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d2a0]" /></div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <MetricCard label="Tổng học sinh" value={reportData.stats.totalStudents} trend="+12%" icon={<Users />} color="#06b6d4" />
             <MetricCard label="Điểm trung bình" value={`${reportData.stats.avgScore}%`} trend="+5%" icon={<Award />} color="#10b981" />
             <MetricCard label="Tỷ lệ hoàn thành" value={`${reportData.stats.completionRate}%`} trend="+8%" icon={<TrendingUp />} color="#8b5cf6" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
                <h3 className="text-xl font-bold mb-8">Xu hướng tham gia</h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.progressData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ color: '#00d2a0' }}
                         />
                         <Bar dataKey="students" fill="#00d2a0" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
                <h3 className="text-xl font-bold mb-8">Hiệu quả học tập</h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.progressData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid #1e293b', borderRadius: '12px' }}
                         />
                         <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b]">
       <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15`, color }}>
             {icon}
          </div>
          <span className="text-[10px] font-black text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">{trend}</span>
       </div>
       <div className="text-3xl font-black mb-1">{value}</div>
       <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  )
}
