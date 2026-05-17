import React from 'react'

export default async function TeacherDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0d0e13] text-[#dde0ed] p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Giáo Viên</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 mb-1">Tổng học sinh</p>
          <h2 className="text-3xl font-bold text-[#00d4aa]">120</h2>
        </div>
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 mb-1">% Hoàn thành TB</p>
          <h2 className="text-3xl font-bold text-[#00d4aa]">68%</h2>
        </div>
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 mb-1">Điểm Quiz TB</p>
          <h2 className="text-3xl font-bold text-[#00d4aa]">8.2</h2>
        </div>
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800 flex flex-col justify-center gap-2">
          <button className="bg-[#00d4aa] text-[#0d0e13] px-4 py-2 rounded font-bold text-sm">
            Tạo Quiz Mới
          </button>
        </div>
      </div>

      <div className="bg-[#1a1c25] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">Danh sách học sinh</h2>
          <button className="text-[#00d4aa] text-sm font-semibold hover:underline">Xem tất cả bài nộp</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#0d0e13]">
            <tr>
              <th className="p-4 text-gray-400 text-sm">Học sinh</th>
              <th className="p-4 text-gray-400 text-sm">Tiến độ</th>
              <th className="p-4 text-gray-400 text-sm">Lần ĐN cuối</th>
              <th className="p-4 text-gray-400 text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="p-4 font-medium">Nguyễn Văn A</td>
              <td className="p-4">75%</td>
              <td className="p-4 text-gray-400 text-sm">2 giờ trước</td>
              <td className="p-4">
                <button className="text-[#00d4aa] text-sm hover:underline">Xem chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
