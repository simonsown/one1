'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, LayoutDashboard, Cpu, History, LogOut, Users, BookOpen, ChevronDown, User, Sun, Moon, Map, BarChart2, Monitor, Compass, MessageSquare } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'
import PageTransition from '@/components/PageTransition'

const s = { red: '#D32F2F', navy: '#0F2847', teal: '#0D9488', orange: '#F97316' }

function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  const toggle = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }, [theme])
  return (
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', width: '100%', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 500, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [hasClass, setHasClass] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkClass = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (p) { setProfile(p); if (p.school_id || p.class_id) setHasClass(true) }
      }
    }
    checkClass()
  }, [])

  const navItems = [
    { href: '/student/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    ...(hasClass ? [{ href: '/student/classes', label: 'Lớp học của tôi', icon: Users }] : []),
    { href: '/student/lessons', label: 'Bài giảng', icon: BookOpen },
    { href: '/student/learning-path', label: 'Lộ trình học tập', icon: Map },
    { href: '/student/progress', label: 'Tiến Độ Học Tập', icon: BarChart2 },
    { href: '/builder', label: 'Thực hành lắp ráp', icon: Cpu },
    { href: '/student/history', label: 'Lịch sử học tập', icon: History },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <aside style={{ width: '260px', background: `linear-gradient(180deg, #0B1F38 0%, ${s.navy} 100%)`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `linear-gradient(135deg, ${s.orange}, #ea580c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}>PC</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', letterSpacing: '-0.02em' }}>PC Master</div>
            <div style={{ fontSize: '11px', color: s.orange, fontWeight: 600 }}>Học sinh</div>
          </div>
        </div>

        <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/student/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: active ? 700 : 500,
                background: active ? `rgba(249,115,22,0.12)` : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s'
              }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}>
                <Icon size={18} /> {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <ThemeToggle />
          <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(249,115,22,0.6)', fontWeight: 500, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.color = 'rgba(249,115,22,0.8)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(249,115,22,0.6)'; }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: 'var(--bg-base, #f0f4f8)' }}>
        <div style={{ padding: '32px 36px', maxWidth: '1200px' }}>
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
