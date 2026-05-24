'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Link2, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react'
import { logout } from '@/lib/auth-actions'

const parentNavItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/parent/dashboard' },
  { icon: Users, label: 'Con của tôi', href: '/parent/children' },
  { icon: Link2, label: 'Liên kết con', href: '/parent/link-child' },
  { icon: Bell, label: 'Thông báo', href: '/parent/notifications' },
  { icon: User, label: 'Hồ sơ', href: '/parent/profile' },
]

export default function ParentSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Nút Hamburger trên Mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1c25] border border-white/10 rounded-lg text-[#dde0ed] hover:bg-[#222533] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop cho Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen bg-[#1a1c25] border-r border-white/5 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm text-[#dde0ed] tracking-wide">
              PC Master <span className="text-[#00d4aa]">Parent</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-[#636678] hover:text-[#dde0ed]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#636678] uppercase">
            Menu Phụ Huynh
          </div>
          {parentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]'
                    : 'text-[#636678] border-transparent hover:bg-[#222533] hover:text-[#dde0ed]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#00d4aa]' : 'text-[#636678]'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Sidebar với Nút Log Out */}
        <div className="p-4 border-t border-white/5 bg-[#14161e]">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#222533] flex items-center justify-center text-sm font-bold text-[#00d4aa]">
              P
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#dde0ed] truncate">Phụ huynh</div>
              <div className="text-[10px] text-[#636678] truncate">Tài khoản liên kết</div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm('Bạn muốn đăng xuất khỏi hệ thống?')) {
                await logout()
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-xs font-bold transition-all duration-150"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  )
}
