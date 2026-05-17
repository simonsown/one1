import React from 'react'
import Link from 'next/link'
import { Users, BookOpen, AlertCircle, TrendingUp, Search } from 'lucide-react'

export default function TeacherDashboard() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Teacher Dashboard 👨‍🏫</h1>
          <p className="text-slate-400">Tổng quan và quản lý lớp học của bạn.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1e293b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a3655] transition-colors">Xem tất cả bài nộp</button>
          <button className="bg-[#00d4aa] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00e6af] transition-colors">Tạo Quiz mới</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Tổng Học Sinh</h3>
            <Users size={20} className="text-[#00d4aa]" />
          </div>
          <p className="text-3xl font-bold text-white">42</p>
        </div>

        <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Tiến Độ TB</h3>
            <TrendingUp size={20} className="text-[#3b82f6]" />
          </div>
          <p className="text-3xl font-bold text-white">68%</p>
        </div>

        <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium">Điểm TB Quiz</h3>
            <BookOpen size={20} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">82.5</p>
        </div>

        <div className="bg-[#1a1c25] rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 font-medium">Cảnh Báo</h3>
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-white">3</p>
          <p className="text-xs text-slate-500 mt-1">HS vắng &gt; 7 ngày</p>
        </div>
      </div>

      <div className="bg-[#1a1c25] rounded-2xl border border-[#1e293b] overflow-hidden mt-8">
        <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Danh sách học sinh</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Tìm kiếm..." className="bg-[#0d0e13] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00d4aa] outline-none" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d0e13]">
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-[#1e293b]">Học Sinh</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-[#1e293b]">Tiến độ</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-[#1e293b]">Điểm TB</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-[#1e293b]">Lần đăng nhập cuối</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-[#1e293b] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Nguyễn Văn A', progress: 80, score: 90, lastLogin: 'Hôm nay' },
              { id: 2, name: 'Trần Thị B', progress: 45, score: 75, lastLogin: '2 ngày trước' },
              { id: 3, name: 'Lê Hoàng C', progress: 10, score: 50, lastLogin: '8 ngày trước' },
            ].map(student => (
              <tr key={student.id} className="hover:bg-[#1e293b]/30 transition-colors">
                <td className="p-4 text-white font-medium">{student.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#0d0e13] rounded-full overflow-hidden border border-[#1e293b]">
                      <div className="h-full bg-[#00d4aa]" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="text-sm text-slate-400">{student.progress}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-semibold ${student.score < 80 ? 'text-yellow-400' : 'text-[#00d4aa]'}`}>
                    {student.score}
                  </span>
                </td>
                <td className={`p-4 text-sm ${student.lastLogin.includes('8 ngày') ? 'text-red-400' : 'text-slate-400'}`}>
                  {student.lastLogin}
                </td>
                <td className="p-4 text-right">
                  <button className="text-[#00d4aa] text-sm font-semibold hover:underline">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
