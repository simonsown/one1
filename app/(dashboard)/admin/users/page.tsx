'use client'

import React, { useState } from 'react'
import { Search, Filter, MoreVertical, Shield, User, Mail, Calendar, CheckCircle2, XCircle, Trash2, ShieldAlert, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'student', status: 'active', joined: '10/05/2026' },
    { id: '2', name: 'Trần Thị B', email: 'thib@teacher.com', role: 'teacher', status: 'active', joined: '08/05/2026' },
    { id: '3', name: 'Lê Văn C', email: 'vanc@gmail.com', role: 'student', status: 'banned', joined: '01/05/2026' },
    { id: '4', name: 'Phạm Minh D', email: 'admin@pcmaster.com', role: 'admin', status: 'active', joined: '01/01/2026' },
  ])

  const [selectedUser, setSelectedUser] = useState<any>(null)

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-[#00d2a0]/10 text-[#00d2a0] rounded-xl">
                 <Shield size={24} />
               </div>
               <h1 className="text-3xl font-bold">Quản trị <span className="text-[#00d2a0]">Người dùng</span></h1>
            </div>
            <p className="text-slate-400">Quản lý danh sách thành viên, phân quyền và giám sát hoạt động hệ thống.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-[#16213e] p-4 rounded-2xl border border-[#1e293b] text-center min-w-[120px]">
               <p className="text-xs text-slate-500 font-bold uppercase mb-1">Tổng User</p>
               <p className="text-2xl font-black text-white">{users.length}</p>
             </div>
             <div className="bg-[#16213e] p-4 rounded-2xl border border-[#1e293b] text-center min-w-[120px]">
               <p className="text-xs text-slate-500 font-bold uppercase mb-1">Đang Online</p>
               <p className="text-2xl font-black text-[#00d2a0]">12</p>
             </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-[#16213e] p-4 rounded-2xl border border-[#1e293b] mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-[#00d2a0]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-[#0f0f1a] border border-[#1e293b] rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#1e293b]">
              <Filter size={16} /> Lọc Vai trò
            </button>
            <button className="px-4 py-2.5 bg-[#0f0f1a] border border-[#1e293b] rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#1e293b]">
              <Calendar size={16} /> Sắp xếp
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f0f1a] border-b border-[#1e293b] text-xs font-bold uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày gia nhập</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#1e293b]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0f0f1a] border border-[#2a3655] flex items-center justify-center text-[#00d2a0] font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                      u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      u.role === 'teacher' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      {u.status === 'active' ? (
                        <><CheckCircle2 size={14} className="text-[#00d2a0]" /> <span className="text-[#00d2a0]">Hoạt động</span></>
                      ) : (
                        <><XCircle size={14} className="text-red-400" /> <span className="text-red-400">Đã khóa</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {u.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="p-2 text-slate-500 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL CHI TIẾT USER */}
        <AnimatePresence>
          {selectedUser && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#16213e] border border-[#1e293b] rounded-3xl p-8 z-[101] shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#00d2a0] text-black flex items-center justify-center text-2xl font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                    <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 p-4 bg-[#0f0f1a] hover:bg-[#1e293b] rounded-xl transition-colors text-left border border-[#1e293b]">
                    <Shield size={20} className="text-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Thay đổi Vai trò</p>
                      <p className="text-xs text-slate-500">Nâng cấp lên Giáo viên hoặc Admin</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-4 bg-[#0f0f1a] hover:bg-[#1e293b] rounded-xl transition-colors text-left border border-[#1e293b]">
                    <Mail size={20} className="text-yellow-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Gửi Email trực tiếp</p>
                      <p className="text-xs text-slate-500">Gửi thông báo hoặc nhắc nhở</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-left border border-red-500/20">
                    <ShieldAlert size={20} className="text-red-400" />
                    <div>
                      <p className="text-sm font-bold text-red-400">Khóa tài khoản</p>
                      <p className="text-xs text-red-500/60">Tạm dừng quyền truy cập của user này</p>
                    </div>
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full mt-8 py-3 bg-[#1e293b] rounded-xl text-sm font-bold hover:bg-[#2a3655] transition-colors"
                >
                  Đóng
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
