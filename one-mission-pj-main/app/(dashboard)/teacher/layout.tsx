'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, FileText, LogOut, LayoutDashboard, Compass, HelpCircle, Award, Laptop, MessageSquare, TrendingUp, ChevronDown, User, Shield, GraduationCap, Sun, Moon } from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { supabase } from '@/lib/supabase'
import PageTransition from '@/components/PageTransition'

const s = { red: '#D32F2F', navy: '#0F2847', teal: '#0D9488', orange: '#F97316' }

function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  React.useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  const toggle = React.useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }, [theme])
  return (
    <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 500, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => { if (data) setProfile(data) })
    })
  }, [])

  const isActive = (href: string) => {
    if (href === '/teacher') return pathname === '/teacher'
    return pathname?.startsWith(href + '/') || pathname === href
  }

  const NavGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      {children}
    </div>
  )

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px',
        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s'
      }}
        onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
        onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}>
        <Icon size={17} /> {label}
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base, #f0f4f8)' }}>
      <aside style={{ width: '260px', background: `linear-gradient(180deg, #0B1F38 0%, ${s.navy} 100%)`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '10px', fontFamily: 'inherit' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${s.orange}, #ea580c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}>PC</span>
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{profile?.full_name || 'Giáo viên'}</div>
              <div style={{ fontSize: '10px', color: s.orange, fontWeight: 600 }}>Giáo viên</div>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowDropdown(false)} />
              <div style={{ position: 'absolute', top: '100%', left: '12px', right: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, padding: '8px' }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: s.navy }}>{profile?.full_name || 'Người dùng'}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{profile?.email || ''}</div>
                  <div style={{ fontSize: '10px', color: s.orange, fontWeight: 600, marginTop: '4px' }}>Vai trò: Giáo viên</div>
                </div>
                <Link href="/teacher" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', color: s.navy, textDecoration: 'none', fontSize: '12px', transition: 'background 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <LayoutDashboard size={15} /> Bảng điều khiển
                </Link>
                <button onClick={async () => { setShowDropdown(false); await logout() }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', width: '100%', borderRadius: '8px', background: 'none', border: 'none', color: s.red, cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#FEF2F2'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <LogOut size={15} /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>

        <nav style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
          <NavGroup label="Tổng quan">
            <NavItem href="/teacher" icon={LayoutDashboard} label="Bảng điều khiển" />
          </NavGroup>
          <NavGroup label="Quản lý">
            <NavItem href="/teacher/classes" icon={Users} label="Lớp học" />
            <NavItem href="/teacher/lessons" icon={FileText} label="Bài giảng" />
            <NavItem href="/teacher/learning-path" icon={Compass} label="Lộ trình" />
            <NavItem href="/teacher/quiz" icon={HelpCircle} label="Đề thi" />
          </NavGroup>
          <NavGroup label="Tiện ích">
            <NavItem href="/teacher/certificates" icon={Award} label="Chứng chỉ" />
            <NavItem href="/student/discussion" icon={MessageSquare} label="Diễn đàn" />
          </NavGroup>
        </nav>

        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <ThemeToggle />
          <button onClick={async () => { await logout() }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', width: '100%', borderRadius: '10px', background: 'transparent', border: 'none', color: 'rgba(249,115,22,0.6)', fontWeight: 500, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.color = 'rgba(249,115,22,0.8)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(249,115,22,0.6)'; }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{ padding: '28px 36px', maxWidth: '1200px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
            <Link href="/teacher" style={{ color: s.orange, textDecoration: 'none', fontWeight: 500 }}>Bảng điều khiển</Link>
            <span>/</span>
            <span style={{ color: s.navy, fontWeight: 600 }}>{pathname === '/teacher' ? 'Tổng quan' : pathname.split('/').pop()}</span>
          </div>
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
