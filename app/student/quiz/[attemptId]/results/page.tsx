import React from 'react'
import Link from 'next/link'

export default function QuizResultsPage({ params }: { params: { attemptId: string } }) {
  const passed = true
  const score = 85

  return (
    <div className="min-h-screen bg-[#161F38] text-[#dde0ed] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-2xl w-full bg-[#11121d]/90 rounded-[28px] border border-gray-800 p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl z-10">
        
        {passed && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#089e60]/10 to-transparent pointer-events-none"></div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black mb-2 uppercase tracking-tight text-white">Kết Quả Bài Kiểm Tra</h1>
        <p className="text-gray-400 mb-8 text-sm">Mã lần làm: {params.attemptId}</p>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`w-36 h-36 rounded-full border-8 flex items-center justify-center mb-4 ${passed ? 'border-[#089e60] text-[#089e60] shadow-[0_0_20px_rgba(8,158,96,0.2)]' : 'border-red-500 text-red-500'}`}>
            <span className="text-5xl font-black">{score}</span>
          </div>
          <h2 className={`text-2xl font-black ${passed ? 'text-[#089e60]' : 'text-red-500'} uppercase tracking-widest`}>
            {passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-xs uppercase font-bold">Đúng</p>
            <p className="text-lg sm:text-xl font-black text-[#089e60] mt-1">17/20</p>
          </div>
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-xs uppercase font-bold">Sai/Bỏ qua</p>
            <p className="text-lg sm:text-xl font-black text-red-500 mt-1">3</p>
          </div>
          <div className="bg-black/25 p-4 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-xs uppercase font-bold">Thời gian</p>
            <p className="text-lg sm:text-xl font-black text-white mt-1">12:34</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/student" className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-2xl hover:bg-gray-800/40 transition-all font-bold text-sm text-slate-300 hover:text-white">
            Về Dashboard
          </Link>
          {passed ? (
            <button className="px-6 py-3 bg-[#089e60] text-[#0d0e13] rounded-2xl font-black hover:opacity-90 shadow-[0_0_15px_rgba(8,158,96,0.3)] text-sm transition-opacity">
              Nhận Chứng Chỉ
            </button>
          ) : (
            <button className="px-6 py-3 bg-[#089e60] text-[#0d0e13] rounded-2xl font-black hover:opacity-90 text-sm transition-opacity">
              Làm Lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
