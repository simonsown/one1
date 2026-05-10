'use client'

import React, { useState } from 'react'
import { Plus, Search, Trash2, GripVertical, Settings2, Clock, ShieldAlert, CheckSquare, Save, Eye, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, Reorder } from 'framer-motion'

export default function ExamBuilderPage() {
  const [questions, setQuestions] = useState<any[]>([
    { id: 'q1', text: 'CPU Socket AM4 thuộc về hãng nào?', type: 'mcq', points: 1 },
    { id: 'q2', text: 'Tác dụng chính của Keo tản nhiệt là gì?', type: 'mcq', points: 1 },
  ])

  const [settings, setSettings] = useState({
    title: 'Kiểm tra chương 1: Linh kiện PC',
    duration: 15,
    shuffle: true,
    attempts: 1,
    antiCheat: true
  })

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#16213e] border-b border-[#1e293b] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/teacher/exams" className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg">Trình soạn đề thi</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#2a3655] rounded-lg text-sm font-medium hover:bg-[#2a3655] transition-colors">
            <Eye size={16} /> Xem trước
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00d2a0] text-black rounded-lg text-sm font-bold hover:bg-[#00e6af] transition-all shadow-[0_0_15px_rgba(0,210,160,0.2)]">
            <Save size={16} /> Lưu đề thi
          </button>
        </div>
      </header>

      <main className="pt-16 flex flex-col lg:flex-row h-full">
        
        {/* SIDEBAR TRÁI - NGÂN HÀNG CÂU HỎI */}
        <div className="w-full lg:w-[350px] border-r border-[#1e293b] bg-[#0f0f1a] p-6 overflow-y-auto hidden lg:block">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-[#00d2a0]" /> Ngân hàng câu hỏi
          </h3>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Tìm câu hỏi..."
              className="w-full bg-[#16213e] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[#00d2a0]"
            />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-[#16213e] border border-[#1e293b] rounded-xl hover:border-[#00d2a0]/50 cursor-pointer group transition-all">
                <p className="text-sm text-slate-300 line-clamp-2">Linh kiện nào sau đây có nhiệm vụ lưu trữ dữ liệu vĩnh viễn?</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trắc nghiệm</span>
                  <Plus size={14} className="text-slate-500 group-hover:text-[#00d2a0]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT GIỮA - SOẠN ĐỀ */}
        <div className="flex-1 bg-[#0a0a14] p-6 md:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <input 
                type="text" 
                value={settings.title}
                onChange={(e) => setSettings({...settings, title: e.target.value})}
                className="w-full bg-transparent text-3xl font-bold text-white outline-none focus:border-b border-[#00d2a0] pb-2"
              />
              <p className="text-slate-500 text-sm mt-2">Tổng số câu hỏi: {questions.length} | Tổng điểm: {questions.reduce((a, b) => a + b.points, 0)}</p>
            </div>

            <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-4">
              {questions.map((q, idx) => (
                <Reorder.Item 
                  key={q.id} 
                  value={q}
                  className="bg-[#16213e] border border-[#1e293b] rounded-2xl p-6 relative group"
                >
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 mt-1">
                      <GripVertical size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#00d2a0] uppercase tracking-widest">Câu {idx + 1}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Điểm:</span>
                            <input 
                              type="number" 
                              value={q.points}
                              className="w-12 bg-[#0f0f1a] border border-[#1e293b] rounded px-2 py-1 outline-none focus:border-[#00d2a0] text-center"
                            />
                          </div>
                          <button className="text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="font-medium mb-4">{q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <div key={opt} className="flex items-center gap-3 p-3 bg-[#0f0f1a] border border-[#1e293b] rounded-xl text-sm text-slate-400">
                            <span className="w-6 h-6 rounded-lg bg-[#1e293b] flex items-center justify-center text-[10px] font-bold">{opt}</span>
                            <span>Lựa chọn đáp án...</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button className="w-full mt-6 py-4 border-2 border-dashed border-[#1e293b] rounded-2xl text-slate-500 hover:text-[#00d2a0] hover:border-[#00d2a0]/50 transition-all flex items-center justify-center gap-2 font-bold">
              <Plus size={20} /> THÊM CÂU HỎI MỚI
            </button>
          </div>
        </div>

        {/* SIDEBAR PHẢI - CÀI ĐẶT */}
        <div className="w-full lg:w-[350px] border-l border-[#1e293b] bg-[#0f0f1a] p-6 overflow-y-auto">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Settings2 size={18} className="text-[#00d2a0]" /> Cấu hình đề thi
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thời gian làm bài</label>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-slate-500" />
                <input 
                  type="number" 
                  value={settings.duration}
                  className="flex-1 bg-[#16213e] border border-[#1e293b] rounded-xl px-4 py-2.5 outline-none focus:border-[#00d2a0]"
                />
                <span className="text-sm text-slate-500">phút</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#16213e]/50 border border-[#1e293b] rounded-xl">
              <div className="flex items-center gap-3">
                <CheckSquare size={18} className="text-[#00d2a0]" />
                <span className="text-sm font-medium">Trộn câu hỏi</span>
              </div>
              <input type="checkbox" checked={settings.shuffle} className="w-5 h-5 rounded border-[#1e293b] text-[#00d2a0]" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#16213e]/50 border border-[#1e293b] rounded-xl">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-red-400" />
                <span className="text-sm font-medium">Chế độ chống gian lận</span>
              </div>
              <input type="checkbox" checked={settings.antiCheat} className="w-5 h-5 rounded border-[#1e293b] text-[#00d2a0]" />
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thông tin bổ sung</label>
              <textarea 
                placeholder="Hướng dẫn làm bài..."
                className="w-full bg-[#16213e] border border-[#1e293b] rounded-xl p-4 text-sm outline-none focus:border-[#00d2a0] min-h-[120px]"
              ></textarea>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
