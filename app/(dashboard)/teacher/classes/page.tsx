'use client'

import React, { useState } from 'react'
import { Plus, Users, BookOpen, BarChart3, Search, MoreVertical, ChevronRight, UserPlus, Mail, Calendar, LayoutGrid, List as ListIcon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TeacherClassesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const classes = [
    { id: '10a1', name: 'Lớp 10A1 - Tin học cơ bản', students: 42, lessons: 15, avgProgress: 65, status: 'Active' },
    { id: '11b2', name: 'Lớp 11B2 - Lắp ráp phần cứng', students: 38, lessons: 24, avgProgress: 42, status: 'Active' },
    { id: '12c3', name: 'Lớp 12C3 - Quản trị hệ thống', students: 35, lessons: 30, avgProgress: 88, status: 'Inactive' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">Quản lý <span className="text-[#00d2a0]">Lớp học</span></h1>
            <p className="text-slate-400">Tạo lớp, mời học sinh và theo dõi tiến độ học tập của từng tập thể.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-[#00d2a0] text-black font-bold rounded-2xl hover:bg-[#00e6af] transition-all shadow-[0_0_20px_rgba(0,210,160,0.2)]">
            <Plus size={20} /> TẠO LỚP MỚI
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm lớp học..."
              className="w-full bg-[#16213e] border border-[#1e293b] rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-[#00d2a0] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#16213e] border border-[#1e293b] rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1e293b] text-[#00d2a0]' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1e293b] text-[#00d2a0]' : 'text-slate-500 hover:text-white'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {/* CLASS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => (
            <motion.div 
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#16213e] border border-[#1e293b] rounded-2xl p-6 hover:border-[#00d2a0]/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#00d2a0]/10 text-[#00d2a0] flex items-center justify-center">
                  <Users size={28} />
                </div>
                <button className="p-2 text-slate-500 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <Link href={`/teacher/classes/${cls.id}`} className="block group-hover:text-[#00d2a0] transition-colors">
                <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
              </Link>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
                <span className="flex items-center gap-1.5"><Users size={14} /> {cls.students} học sinh</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> {cls.lessons} bài học</span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Tiến độ trung bình</span>
                  <span className="text-[#00d2a0] font-bold">{cls.avgProgress}%</span>
                </div>
                <div className="h-2 bg-[#0f0f1a] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.avgProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-[#00d2a0]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/teacher/classes/${cls.id}`} className="flex-1 py-3 bg-[#1e293b] hover:bg-[#2a3655] rounded-xl text-sm font-bold text-center transition-all">
                  CHI TIẾT
                </Link>
                <button className="p-3 bg-[#1e293b] hover:bg-[#00d2a0] hover:text-black rounded-xl transition-all">
                  <BarChart3 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
