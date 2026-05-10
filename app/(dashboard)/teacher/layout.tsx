'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BookOpen, Users, FileText, LogOut, LayoutDashboard, 
  Settings, BarChart3, PlusCircle, HelpCircle, ShieldAlert
} from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { motion } from 'framer-motion'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Bảng điều khiển', href: '/teacher', icon: <LayoutDashboard size={20} /> },
    { name: 'Quản lý Bài giảng', href: '/teacher/lessons', icon: <FileText size={20} /> },
    { name: 'Giao nhiệm vụ', href: '/teacher/assignments', icon: <PlusCircle size={20} /> },
    { name: 'Quản lý Lớp học', href: '/teacher/classes', icon: <Users size={20} /> },
    { name: 'Báo cáo Học tập', href: '/teacher/reports', icon: <BarChart3 size={20} /> },
    { name: 'Hệ thống Quiz', href: '/quiz', icon: <HelpCircle size={20} /> },
  ]

  return (
    <div className="flex min-h-screen bg-[#0f0f1a] text-white font-sans overflow-hidden">
      {/* Premium Teacher Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#16213e] border-r border-[#1e293b] flex flex-col sticky top-0 h-screen z-50">
        <div className="p-8 flex items-center gap-4 border-b border-[#1e293b]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#06b6d4]/20">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tight uppercase">LMS PRO</div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#06b6d4] font-black uppercase tracking-widest">
               <ShieldAlert size={10} /> Chế độ giáo viên
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#06b6d4]/20 to-transparent text-[#06b6d4] border-l-4 border-[#06b6d4]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`${isActive ? 'text-[#06b6d4]' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-[#1e293b] space-y-4">
           <Link href="/teacher/settings" className="flex items-center gap-4 px-6 py-3 text-slate-500 hover:text-white transition-colors">
              <Settings size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">Cấu hình</span>
           </Link>
           <button 
             onClick={() => logout()} 
             className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl bg-red-500/10 text-red-500 font-black hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
           >
             <LogOut size={20} /> <span className="text-sm">ĐĂNG XUẤT</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-screen custom-scrollbar">
        <div className="sticky top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] z-[60]"></div>
        
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
