'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, Trash2, Edit2, Copy, FileText, CheckCircle2, LayoutGrid, List as ListIcon, MoreVertical, Tag, HelpCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function QuestionBankPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const questions = [
    { id: 1, text: 'Linh kiện nào điều khiển mọi hoạt động của máy tính?', category: 'Phần cứng', type: 'MCQ', difficulty: 'Dễ', usedCount: 12 },
    { id: 2, text: 'Tại sao cần phải bôi kem tản nhiệt?', category: 'Lắp ráp', type: 'MCQ', difficulty: 'Dễ', usedCount: 8 },
    { id: 3, text: 'Chuẩn RAM hiện nay phổ biến nhất là gì?', category: 'RAM', type: 'MCQ', difficulty: 'Trung bình', usedCount: 5 },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-[#00d2a0]/10 text-[#00d2a0] rounded-xl">
                 <HelpCircle size={24} />
               </div>
               <h1 className="text-3xl font-bold">Ngân hàng <span className="text-[#00d2a0]">Câu hỏi</span></h1>
            </div>
            <p className="text-slate-400">Quản lý kho câu hỏi tập trung để sử dụng cho các đề thi và bài tập.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-[#00d2a0] text-black font-bold rounded-2xl hover:bg-[#00e6af] transition-all shadow-[0_0_20px_rgba(0,210,160,0.2)]">
            <Plus size={20} /> THÊM CÂU HỎI
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#16213e] p-4 rounded-2xl border border-[#1e293b] mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-[#00d2a0]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-[#0f0f1a] border border-[#1e293b] rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#1e293b]">
              <Tag size={16} /> Danh mục
            </button>
            <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-1 flex gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1e293b] text-[#00d2a0]' : 'text-slate-500 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1e293b] text-[#00d2a0]' : 'text-slate-500 hover:text-white'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f0f1a] border-b border-[#1e293b] text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Nội dung câu hỏi</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Độ khó</th>
                <th className="px-6 py-4 text-center">Đã dùng</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                  <td className="px-6 py-6 max-w-md">
                    <p className="text-sm font-medium text-slate-200 line-clamp-2">{q.text}</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 block">{q.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <span className="px-3 py-1 bg-[#0f0f1a] rounded-full border border-[#1e293b]">{q.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase ${
                      q.difficulty === 'Dễ' ? 'text-green-400' : 'text-yellow-400'
                    }`}>{q.difficulty}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                    {q.usedCount} lần
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-500 hover:text-[#00d2a0] hover:bg-[#0f0f1a] rounded-lg transition-all">
                         <Edit2 size={16} />
                       </button>
                       <button className="p-2 text-slate-500 hover:text-blue-400 hover:bg-[#0f0f1a] rounded-lg transition-all">
                         <Copy size={16} />
                       </button>
                       <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-[#0f0f1a] rounded-lg transition-all">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-8 flex justify-center gap-2">
           <button className="w-10 h-10 bg-[#16213e] border border-[#1e293b] rounded-xl flex items-center justify-center text-[#00d2a0] font-bold">1</button>
           <button className="w-10 h-10 bg-[#0f0f1a] border border-[#1e293b] rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all">2</button>
           <button className="w-10 h-10 bg-[#0f0f1a] border border-[#1e293b] rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all">3</button>
        </div>
      </main>
    </div>
  )
}
