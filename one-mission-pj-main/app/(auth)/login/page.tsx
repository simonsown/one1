'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Shield, KeyRound, Cpu, Monitor, CircuitBoard, Cctv } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const router = useRouter()

  function handleAdminLogin() {
    if (!adminPass.trim()) { setAdminError('Vui lòng nhập mật khẩu admin'); return }
    setAdminLoading(true); setAdminError('')
    setTimeout(() => {
      if (adminPass === 'nguyen200113') {
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_login_time', Date.now().toString())
        router.push('/admin')
      } else {
        setAdminError('Mật khẩu admin không chính xác')
        setAdminLoading(false)
      }
    }, 500)
  }

  async function handleGoogleLogin() {
    setError(null)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (oauthError) setError('Đăng nhập Google thất bại: ' + oauthError.message)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('role', role)
    const { login } = await import('@/lib/auth-actions')
    const res = await login(formData)
    if (res?.error) { setError(res.error); setLoading(false) }
    else if (res?.success && res.redirectUrl) { router.push(res.redirectUrl) }
    else { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* LEFT - Illustration */}
      <div style={{
        flex: 1, display: { xs: 'none', md: 'flex' } as any, flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #E3F2FD 0%, #BBDEFB 100%)',
        padding: '64px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Floating decorative icons */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.15, transform: 'rotate(-15deg)' }}>
          <Cpu size={80} color="#1976D2" />
        </div>
        <div style={{ position: 'absolute', bottom: '20%', right: '12%', opacity: 0.12, transform: 'rotate(20deg)' }}>
          <CircuitBoard size={70} color="#1976D2" />
        </div>
        <div style={{ position: 'absolute', top: '25%', right: '20%', opacity: 0.1 }}>
          <Monitor size={50} color="#1976D2" />
        </div>

        {/* Main illustration */}
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '40px',
          boxShadow: '0 8px 40px rgba(25, 118, 210, 0.08)',
          textAlign: 'center', maxWidth: '360px', position: 'relative', zIndex: 1
        }}>
          <div style={{ fontSize: '80px', marginBottom: '16px', lineHeight: 1 }}>🖥️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A2F4A', marginBottom: '8px' }}>
            Học lắp ráp máy tính
          </h2>
          <p style={{ fontSize: '14px', color: '#546E7A', lineHeight: 1.6, margin: 0 }}>
            Trải nghiệm phòng Lab 2D mô phỏng lắp ráp PC trực quan,<br />
            kiểm tra tương thích linh kiện realtime.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🧠 AI Guru', '🔧 50+ Linh kiện', '📐 Socket Check'].map(tag => (
              <span key={tag} style={{ padding: '4px 12px', background: '#E3F2FD', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: '#1976D2' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: '#fff' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {/* Branding */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', color: '#9E9E9E', fontWeight: 500, marginBottom: '8px' }}>
              Một sản phẩm của
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#D32F2F', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)'
              }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 900, letterSpacing: '0.5px' }}>PC</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1A2F4A', letterSpacing: '0.5px' }}>PC MASTER BUILDER</div>
                <div style={{ fontSize: '10px', color: '#9E9E9E', fontWeight: 600, letterSpacing: '0.3px' }}>HỆ THỐNG HỌC LẮP RÁP MÁY TÍNH</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A2F4A', marginBottom: '24px' }}>
            Đăng nhập
          </h1>

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {(['student', 'teacher'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  background: role === r ? '#1A2F4A' : '#F5F5F5',
                  color: role === r ? '#fff' : '#757575',
                  border: `1px solid ${role === r ? '#1A2F4A' : '#E0E0E0'}`,
                }}>
                {r === 'student' ? '🧑‍🎓 Học sinh' : '👨‍🏫 Giáo viên'}
              </button>
            ))}
          </div>

          {/* Google login */}
          <button onClick={handleGoogleLogin} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: '#fff', border: '1px solid #E0E0E0', padding: '12px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600, color: '#1C1C1E', cursor: 'pointer',
            transition: 'all 0.2s', marginBottom: '16px', fontFamily: 'inherit'
          }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#1976D2'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#E0E0E0'}
          >
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
            <span style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: 500 }}>Hoặc qua email</span>
            <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1E', marginBottom: '4px', display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E' }} />
                <input
                  type="email" name="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="diachi@email.com"
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px', borderRadius: '8px',
                    border: '1px solid #CBD5E1', fontSize: '14px', color: '#1C1C1E',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#1A2F4A'}
                  onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1E', marginBottom: '4px', display: 'block' }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E' }} />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 38px 12px 38px', borderRadius: '8px',
                    border: '1px solid #CBD5E1', fontSize: '14px', color: '#1C1C1E',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#1A2F4A'}
                  onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: '#0097A7', fontWeight: 600, textDecoration: 'none' }}>
                Quên mật khẩu?
              </Link>
            </div>

            {error && (
              <div style={{ background: 'rgba(211,47,47,0.06)', border: '1px solid rgba(211,47,47,0.15)', color: '#D32F2F', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '15px',
              background: '#1A2F4A', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s', fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1
            }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#142538' }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#1A2F4A' }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</> : <><LogIn size={16} /> Đăng Nhập</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#9E9E9E', fontSize: '13px' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
              Đăng ký ngay
            </Link>
          </p>

          {/* Admin login */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => setShowAdmin(!showAdmin)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: showAdmin ? '#D32F2F' : '#9E9E9E', fontSize: '12px', fontWeight: 500,
              transition: 'all 0.2s', textDecoration: showAdmin ? 'none' : 'underline',
              textDecorationStyle: 'dotted', textUnderlineOffset: '3px'
            }}>
              <Shield size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {showAdmin ? 'Đóng' : 'Đăng nhập Admin'}
            </button>
            {showAdmin && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E' }} />
                    <input type="password" value={adminPass} onChange={e => { setAdminPass(e.target.value); setAdminError('') }}
                      onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin() }} placeholder="Mật khẩu admin"
                      style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px 0 32px', fontFamily: 'inherit', fontSize: '13px', color: '#1C1C1E', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={handleAdminLogin} disabled={adminLoading} style={{
                    padding: '0 16px', borderRadius: '8px', background: '#D32F2F', color: '#fff',
                    fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px',
                    fontFamily: 'inherit', whiteSpace: 'nowrap'
                  }}>
                    {adminLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Vào'}
                  </button>
                </div>
                {adminError && <p style={{ marginTop: '6px', fontSize: '12px', color: '#D32F2F', fontWeight: 600 }}>{adminError}</p>}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9E9E9E', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
