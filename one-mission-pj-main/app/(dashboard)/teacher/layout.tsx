'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, FileText, LogOut, LayoutDashboard, Compass, HelpCircle } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/teacher', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { href: '/teacher/lessons', label: 'Quản lý bài giảng', icon: FileText },
    { href: '/teacher/classes', label: 'Quản lý lớp học', icon: Users },
    { href: '/teacher/learning-path', label: 'Quản lý Lộ trình', icon: Compass },
    { href: '/teacher/quiz', label: 'Quản lý Đề thi', icon: HelpCircle },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" style={{ margin: '10px' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>LMS TEACHER</div>
            <div style={{ fontSize: '12px', color: '#06B6D4', fontWeight: 600 }}>Giáo viên</div>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link 
                key={item.href}
                href={item.href} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent', 
                  color: isActive ? '#06B6D4' : 'var(--text-secondary)', 
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={20} /> {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={async () => {
              if (confirm('Bạn muốn đăng xuất khỏi hệ thống?')) {
                await logout()
              }
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
