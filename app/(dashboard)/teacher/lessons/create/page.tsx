'use client'

import React, { useState } from 'react'
import { Plus, Save, Eye, Layout, Type, Image as ImageIcon, Video, Code, MessageSquare, ChevronDown, GripVertical, Trash2, Settings, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { motion, Reorder } from 'framer-motion'

export default function LessonEditorPage() {
  const [blocks, setBlocks] = useState([
    { id: 'b1', type: 'text', content: 'Chào mừng các bạn đến với bài học...' },
    { id: 'b2', type: 'video', content: 'https://youtube.com/...' },
  ])

  const addBlock = (type: string) => {
    setBlocks([...blocks, { id: Math.random().toString(), type, content: '' }])
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#16213e] border-b border-[#1e293b] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/teacher/lessons" className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg">Soạn thảo bài giảng</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#2a3655] rounded-lg text-sm font-medium hover:bg-[#2a3655] transition-colors">
            <Eye size={16} /> Xem thử
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00d2a0] text-black rounded-lg text-sm font-bold hover:bg-[#00e6af] transition-all">
            <Save size={16} /> Xuất bản
          </button>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        {/* Lesson Title Section */}
        <div className="mb-12">
          <input 
            type="text" 
            placeholder="Tiêu đề bài giảng..."
            className="w-full bg-transparent text-4xl font-black text-white outline-none border-b border-[#1e293b] focus:border-[#00d2a0] pb-4 transition-all"
          />
          <div className="mt-4 flex items-center gap-4">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-[#16213e] rounded-lg text-xs font-bold text-slate-400 border border-[#1e293b]">
               <Settings size={14} /> Cấu hình chung
             </button>
          </div>
        </div>

        {/* Blocks Area */}
        <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-6">
          {blocks.map((block, idx) => (
            <Reorder.Item 
              key={block.id} 
              value={block}
              className="group relative bg-[#16213e] border border-[#1e293b] rounded-2xl p-6 hover:border-[#00d2a0]/30 transition-all"
            >
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 text-slate-600">
                <GripVertical size={20} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#00d2a0]">
                  {block.type === 'text' && <Type size={12} />}
                  {block.type === 'video' && <Video size={12} />}
                  {block.type === 'image' && <ImageIcon size={12} />}
                  {block.type === 'pdf' && <FileText size={12} />}
                  <span>{block.type === 'text' ? 'Văn bản' : block.type === 'video' ? 'Video' : block.type === 'image' ? 'Hình ảnh' : 'Tài liệu PDF'}</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>

              {block.type === 'text' ? (
                <textarea 
                  className="w-full bg-transparent border-none outline-none text-slate-200 leading-relaxed resize-none h-auto min-h-[100px]"
                  placeholder="Bắt đầu viết nội dung..."
                  defaultValue={block.content}
                ></textarea>
              ) : block.type === 'video' ? (
                <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                     <Video size={24} />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Nhập link YouTube..."
                     className="flex-1 bg-transparent border-none outline-none text-sm text-slate-400"
                   />
                </div>
              ) : block.type === 'pdf' ? (
                <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#00d2a0]/10 text-[#00d2a0] rounded-lg flex items-center justify-center">
                     <FileText size={24} />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Nhập đường dẫn file PDF (Google Drive/Supabase URL)..."
                     className="flex-1 bg-transparent border-none outline-none text-sm text-slate-400"
                   />
                </div>
              ) : (
                <div className="bg-[#0f0f1a] border border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                     <ImageIcon size={24} />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Dán link ảnh tại đây..."
                     className="flex-1 bg-transparent border-none outline-none text-sm text-slate-400"
                   />
                </div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Add Block Toolbar */}
        <div className="mt-12 flex justify-center">
          <div className="bg-[#16213e] border border-[#1e293b] rounded-2xl p-2 flex gap-2 shadow-2xl">
            <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e293b] rounded-xl text-xs font-bold transition-all text-slate-300">
              <Type size={16} /> VĂN BẢN
            </button>
            <button onClick={() => addBlock('video')} className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e293b] rounded-xl text-xs font-bold transition-all text-slate-300">
              <Video size={16} /> VIDEO
            </button>
            <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e293b] rounded-xl text-xs font-bold transition-all text-slate-300">
              <ImageIcon size={16} /> HÌNH ẢNH
            </button>
            <button onClick={() => addBlock('pdf')} className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e293b] rounded-xl text-xs font-bold transition-all text-slate-300">
              <FileText size={16} className="text-[#00d2a0]" /> TÀI LIỆU PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
