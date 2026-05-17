import React from 'react'
import Link from 'next/link'

export default function QuizResultsPage({ params }: { params: { attemptId: string } }) {
  const passed = true
  const score = 85

  return (
    <div className="min-h-screen bg-[#0d0e13] text-[#dde0ed] p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-[#1a1c25] rounded-2xl border border-gray-800 p-8 text-center mt-12 relative overflow-hidden">
        
        {passed && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#00d4aa]/10 to-transparent pointer-events-none"></div>
        )}

        <h1 className="text-2xl font-bold mb-2">Kết Quả Bài Kiểm Tra</h1>
        <p className="text-gray-400 mb-8">Mã lần làm: {params.attemptId}</p>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center mb-4 ${passed ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-red-500 text-red-500'}`}>
            <span className="text-5xl font-black">{score}</span>
          </div>
          <h2 className={`text-2xl font-bold ${passed ? 'text-[#00d4aa]' : 'text-red-500'}`}>
            {passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-[#0d0e13] p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm">Đúng</p>
            <p className="text-xl font-bold text-[#00d4aa]">17/20</p>
          </div>
          <div className="bg-[#0d0e13] p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm">Sai/Bỏ qua</p>
            <p className="text-xl font-bold text-red-500">3</p>
          </div>
          <div className="bg-[#0d0e13] p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm">Thời gian</p>
            <p className="text-xl font-bold text-white">12:34</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/student/dashboard" className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors font-medium">
            Về Dashboard
          </Link>
          {passed ? (
            <button className="px-6 py-3 bg-[#00d4aa] text-[#0d0e13] rounded-lg font-bold hover:opacity-90 shadow-[0_0_15px_rgba(0,212,170,0.3)]">
              Nhận Chứng Chỉ
            </button>
          ) : (
            <button className="px-6 py-3 bg-[#00d4aa] text-[#0d0e13] rounded-lg font-bold hover:opacity-90">
              Làm Lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
