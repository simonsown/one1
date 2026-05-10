'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, Cpu, Bot, Globe, ShieldCheck } from 'lucide-react'
import { login, signInWithGoogle } from '@/lib/auth-actions'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Nếu chuyển sang tab đăng ký, redirect sang trang register
    if (!isLogin) {
      router.push('/register')
    }
  }, [isLogin, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f0f1a] overflow-hidden text-white">
      
      {/* CỘT TRÁI - BRANDING PANEL (Chỉ hiện trên desktop) */}
      <div className="hidden md:flex md:w-[40%] relative flex-col justify-between p-12 lg:p-16 border-r border-[#1e293b] overflow-hidden bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]">
        
        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {mounted && [...Array(15)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute w-2 h-2 rounded-full bg-[#00d2a0]/20"
               initial={{ 
                 x: Math.random() * 100 + "%", 
                 y: "110%", 
                 opacity: Math.random() * 0.5 + 0.3 
               }}
               animate={{ 
                 y: "-10%", 
                 opacity: [0, 1, 0] 
               }}
               transition={{ 
                 duration: Math.random() * 10 + 10, 
                 repeat: Infinity, 
                 ease: "linear",
                 delay: Math.random() * 5
               }}
             />
           ))}
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12">
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Quay lại trang chủ</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-bold tracking-tight">
              PC MASTER <span className="text-[#00d2a0]">BUILDER</span>
            </h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-2 text-white">Học Lắp Ráp · Chinh Phục Công Nghệ</h2>
          <p className="text-slate-400 mb-12 max-w-sm leading-relaxed">
            Nền tảng giáo dục thực hành phần cứng máy tính thông minh, kết hợp AI và giả lập 3D.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#16213e] border border-[#1e293b] flex items-center justify-center text-[#00d2a0] shadow-[0_0_15px_rgba(0,210,160,0.1)]">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">50+ Linh kiện</h3>
                <p className="text-sm text-slate-400">Mô phỏng chân thực thông số vật lý</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#16213e] border border-[#1e293b] flex items-center justify-center text-[#00b4d8] shadow-[0_0_15px_rgba(0,180,216,0.1)]">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Guru 24/7</h3>
                <p className="text-sm text-slate-400">Trợ giảng thông minh đồng hành cùng bạn</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#16213e] border border-[#1e293b] flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">100% Web-based</h3>
                <p className="text-sm text-slate-400">Học mọi lúc mọi nơi không cần cài đặt</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium mt-12 flex items-center justify-center md:justify-start gap-4">
          <span>© 2026 PC Master Builder LMS</span>
          {/* Nút Admin nhỏ gọn ẩn mình */}
          <button 
            type="button" 
            onClick={async () => {
              setLoading(true)
              const fd = new FormData()
              fd.append('email', 'admin')
              fd.append('password', 'nguyen200113')
              const res = await login(fd)
              if (res?.error) {
                setError(res.error)
                setLoading(false)
              }
            }}
            className="text-slate-700 hover:text-[#00d2a0] transition-colors"
            title="Khu vực Quản trị"
          >
            <Lock size={14} />
          </button>
        </div>
      </div>

      {/* CỘT PHẢI - FORM ĐĂNG NHẬP */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Mobile Header (chỉ hiện trên mobile) */}
        <div className="md:hidden w-full flex items-center justify-between mb-8">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold tracking-tight">PC MASTER</span>
          </div>
        </div>

        <div className="w-full max-w-[440px] bg-[#16213e]/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl border border-[#1e293b]/50 md:border-none shadow-2xl md:shadow-none">
          
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
            <p className="text-slate-400">Đăng nhập để tiếp tục hành trình học tập của bạn.</p>
          </div>

          {/* Tab Switcher */}
          <div className="relative flex w-full bg-[#0f0f1a] rounded-lg p-1 mb-8 border border-[#1e293b]">
            <div className="absolute inset-0 flex p-1">
               <motion.div 
                 className="w-1/2 bg-[#16213e] rounded-md border border-[#2a3655] shadow-sm"
                 layoutId="activeTab"
                 initial={false}
                 animate={{ x: isLogin ? 0 : "100%" }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
               />
            </div>
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors ${isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Đăng Nhập
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors ${!isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Đăng Ký
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button 
              type="button" 
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Tiếp tục với Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-[#1e293b]"></div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoặc qua email</span>
            <div className="h-[1px] flex-1 bg-[#1e293b]"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Input Email với Floating Label */}
            <div className="relative">
              <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedInput === 'email' ? 'text-[#00d2a0]' : 'text-slate-500'}`} />
              <input 
                type="email" 
                name="email"
                id="email"
                required
                className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] focus:ring-1 focus:ring-[#00d2a0] transition-all peer text-white text-base"
                placeholder=" "
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
              <label 
                htmlFor="email" 
                className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 text-sm cursor-text transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-[#00d2a0] peer-focus:bg-[#0f0f1a] peer-focus:px-1 peer-valid:-top-2.5 peer-valid:left-4 peer-valid:text-xs peer-valid:px-1 peer-valid:bg-[#0f0f1a] rounded-sm pointer-events-none"
              >
                Địa chỉ Email
              </label>
            </div>

            {/* Input Password với Floating Label */}
            <div className="relative">
              <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedInput === 'password' ? 'text-[#00d2a0]' : 'text-slate-500'}`} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                id="password"
                required
                className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-12 py-3.5 outline-none focus:border-[#00d2a0] focus:ring-1 focus:ring-[#00d2a0] transition-all peer text-white text-base"
                placeholder=" "
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <label 
                htmlFor="password" 
                className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 text-sm cursor-text transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-[#00d2a0] peer-focus:bg-[#0f0f1a] peer-focus:px-1 peer-valid:-top-2.5 peer-valid:left-4 peer-valid:text-xs peer-valid:px-1 peer-valid:bg-[#0f0f1a] rounded-sm pointer-events-none"
              >
                Mật khẩu
              </label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none p-1 rounded-md hover:bg-[#1e293b]/50 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-[#1e293b] bg-[#0f0f1a] text-[#00d2a0] focus:ring-[#00d2a0] focus:ring-offset-[#0f0f1a] transition-colors" />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-[#00b4d8] hover:text-[#00d2a0] transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, x: 0 }}
                  animate={{ opacity: 1, y: 0, x: [-5, 5, -5, 5, 0] }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3"
                >
                  <ShieldCheck size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#00d2a0] hover:bg-[#00e6af] text-black font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,210,160,0.15)] hover:shadow-[0_0_25px_rgba(0,210,160,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(0,210,160,0.15)] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
