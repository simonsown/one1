'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users, GraduationCap, ArrowRight, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

  useEffect(() => {
    // Lấy user id hiện tại
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
      else router.push('/login')
    })
  }, [router, supabase])

  const handleComplete = async () => {
    if (!role || !fullName.trim() || !userId) return
    setLoading(true)

    // Tạo profile mới
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      role: role
    })

    setLoading(false)

    if (error) {
      alert('Có lỗi xảy ra: ' + error.message)
    } else {
      // Chuyển hướng theo role
      router.push(role === 'teacher' ? '/teacher' : '/student')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 text-white">
      <div className="w-full max-w-lg bg-[#ffffff] rounded-2xl border border-[#e7e7e7] p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#089e60]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 bg-[#089e60]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#089e60]">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Hoàn thiện hồ sơ</h1>
          <p className="text-slate-400 text-sm">Chào mừng bạn đến với hệ thống. Hãy cho chúng tôi biết bạn là ai để cá nhân hóa trải nghiệm.</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Họ và tên của bạn</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl px-4 py-3 outline-none focus:border-[#089e60] text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bạn tham gia với vai trò?</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === 'student' 
                  ? 'border-[#089e60] bg-[#089e60]/10' 
                  : 'border-[#e7e7e7] bg-[#f8f9fa] hover:border-slate-600'
                }`}
              >
                <User size={32} className={`mb-2 ${role === 'student' ? 'text-[#089e60]' : 'text-slate-500'}`} />
                <span className={`font-semibold ${role === 'student' ? 'text-white' : 'text-slate-400'}`}>Học viên</span>
              </button>

              <button 
                onClick={() => setRole('teacher')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === 'teacher' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-[#e7e7e7] bg-[#f8f9fa] hover:border-slate-600'
                }`}
              >
                <Users size={32} className={`mb-2 ${role === 'teacher' ? 'text-purple-500' : 'text-slate-500'}`} />
                <span className={`font-semibold ${role === 'teacher' ? 'text-white' : 'text-slate-400'}`}>Giáo viên</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handleComplete}
            disabled={!role || !fullName.trim() || loading}
            className="w-full mt-4 bg-[#089e60] hover:bg-[#0b755b] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Hoàn tất <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
