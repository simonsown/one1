'use client'

import React, { useEffect } from 'react'
import { completeLessonAction } from '@/app/actions/trackingActions'

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  // Logic to auto-create progress should be done server-side or via another action.
  // For now, we simulate lesson interface.

  return (
    <div className="flex h-screen bg-[#0d0e13] text-[#dde0ed]">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-[#1e293b] bg-[#1a1c25] p-4 flex flex-col">
        <h3 className="font-bold text-white mb-4">Danh sách bài học</h3>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <div className="p-3 bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 rounded-lg font-medium text-sm">
            ▶ Bài {params.lessonId}: Đang xem
          </div>
          <div className="p-3 text-slate-400 hover:bg-[#1e293b] rounded-lg cursor-pointer transition-colors text-sm">
            Bài tiếp theo
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 p-8 overflow-y-auto pb-24">
          <h1 className="text-3xl font-bold text-white mb-4">Bài {params.lessonId}: Nội dung bài giảng</h1>
          <div className="w-full aspect-video bg-black rounded-xl border border-[#1e293b] flex items-center justify-center mb-6">
            <span className="text-slate-500">Video Player Placeholder</span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed">
              Đây là nội dung bài giảng. Học sinh sẽ xem video và thực hành theo các bước hướng dẫn.
              Tiến độ của bài học sẽ được theo dõi tự động.
            </p>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1c25] border-t border-[#1e293b] p-4 flex justify-end">
          <button 
            onClick={() => completeLessonAction(params.lessonId)}
            className="bg-[#00d4aa] hover:bg-[#00e6af] text-black font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Đánh dấu hoàn thành
          </button>
        </div>
      </div>

      {/* Right Sidebar (Discussion) */}
      <div className="w-80 border-l border-[#1e293b] bg-[#1a1c25] p-4 hidden lg:flex flex-col">
        <h3 className="font-bold text-white mb-4">Thảo luận</h3>
        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="bg-[#0d0e13] p-3 rounded-lg border border-[#1e293b]">
            <p className="text-sm font-semibold text-white">Minh Đức</p>
            <p className="text-xs text-slate-400 mt-1">Phần này hơi khó hiểu, ai giải thích giúp mình với?</p>
          </div>
        </div>
        <div className="mt-4">
          <input type="text" placeholder="Nhập câu hỏi..." className="w-full bg-[#0d0e13] border border-[#1e293b] rounded-lg p-3 text-sm outline-none focus:border-[#00d4aa] text-white" />
        </div>
      </div>
    </div>
  )
}
