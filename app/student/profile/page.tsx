'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PreferencesForm } from '@/components/profile/PreferencesForm'
import { SecurityForm } from '@/components/profile/SecurityForm'
import { User, BarChart2, Settings, ShieldAlert, Trophy, Award, Calendar, Flame, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react'

export default function StudentProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'preferences' | 'security'>('profile')
  const [profile, setProfile] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    completedLessons: 0,
    averageScore: 0,
    streak: 0,
    achievementsCount: 0,
    latestCert: null
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadProfileData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Fetch profiles details
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 2. Fetch preferences
    let { data: pref } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!pref) {
      // Default preferences if not exists
      pref = {
        email_notifications: true,
        push_notifications: true,
        weekly_digest: true,
        theme: 'dark',
        language: 'vi'
      }
    }

    // 3. Fetch statistics
    const { count: compCount } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed')

    const { data: quizAtt } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('student_id', user.id)
      .eq('status', 'submitted')

    const { count: achCount } = await supabase
      .from('student_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)

    const { data: cert } = await supabase
      .from('certificates')
      .select('course_title, completion_date, certificate_number')
      .eq('student_id', user.id)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const scores = (quizAtt || []).map(q => Number(q.score) || 0)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    setProfile({ ...prof, email: user.email })
    setPreferences(pref)
    setStats({
      completedLessons: compCount || 0,
      averageScore: avg,
      streak: 3, // Dummy streak fallback
      achievementsCount: achCount || 0,
      latestCert: cert || null
    })
    setLoading(false)
  }

  useEffect(() => {
    loadProfileData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#00d4aa]" />
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang tải hồ sơ cá nhân...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative High-Tech Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] bg-gradient-to-br from-[#00d4aa]/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-gradient-to-br from-[#00b4d8]/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Workspace Title & Exit Button */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                HỒ SƠ CÁ NHÂN
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Quản lý tài khoản, xem thống kê và tùy chỉnh hệ thống</p>
            </div>
          </div>

          {/* EXIT BUTTON */}
          <button 
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left Profile Sidebar Card with Corner Brackets */}
          <div className="relative bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center h-fit space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md group">
          
          {/* Tech Corner Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#00d4aa]/30 group-hover:border-[#00d4aa] transition-colors duration-300" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#00d4aa]/30 group-hover:border-[#00d4aa] transition-colors duration-300" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#00d4aa]/30 group-hover:border-[#00d4aa] transition-colors duration-300" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#00d4aa]/30 group-hover:border-[#00d4aa] transition-colors duration-300" />

          <AvatarUpload 
            userId={profile.id} 
            currentAvatarUrl={profile.avatar_url}
            onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
          />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{profile.full_name || 'Học viên'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-800/50 px-2.5 py-1 rounded border border-gray-700/50 inline-block">
              Học sinh · Lớp {profile.grade || 'Mới'}
            </p>
          </div>
          
          <div className="w-full pt-4 border-t border-white/5 space-y-1">
            {/* Tabs Trigger Buttons */}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'profile' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25 shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'text-gray-400 hover:bg-[#1e202f]/50 border border-transparent'}`}
            >
              <User size={16} /> Hồ sơ cá nhân
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'stats' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25 shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'text-gray-400 hover:bg-[#1e202f]/50 border border-transparent'}`}
            >
              <BarChart2 size={16} /> Thống kê học tập
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'preferences' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25 shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'text-gray-400 hover:bg-[#1e202f]/50 border border-transparent'}`}
            >
              <Settings size={16} /> Cấu hình cài đặt
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'security' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25 shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'text-gray-400 hover:bg-[#1e202f]/50 border border-transparent'}`}
            >
              <ShieldAlert size={16} /> Bảo mật tài khoản
            </button>
          </div>
        </div>

        {/* Right Content Panels with Glowing Accent Borders */}
        <div className="relative md:col-span-3 bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 sm:p-8 min-h-[450px] shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
          
          {/* Top glowing bar */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#00d4aa]/30 to-transparent" />
          
          {/* Tab 1: Profile Form */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <User className="text-[#00d4aa]" size={20} />
                    Thông tin cá nhân
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Cập nhật thông tin nhận chứng chỉ và trường học của bạn</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-ping" />
              </div>
              <ProfileForm profile={profile} />
            </div>
          )}

          {/* Tab 2: Statistics */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <BarChart2 className="text-[#00d4aa]" size={20} />
                    Thống kê học tập
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Tổng quan tiến độ, điểm số và thành quả của bạn</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e202f]/40 border border-gray-850 p-4 rounded-2xl flex items-center gap-3 hover:border-[#00d4aa]/30 transition-all duration-300">
                  <div className="p-2 bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] rounded-xl">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Bài học xong</p>
                    <p className="text-lg font-black text-white">{stats.completedLessons} bài</p>
                  </div>
                </div>

                <div className="bg-[#1e202f]/40 border border-gray-850 p-4 rounded-2xl flex items-center gap-3 hover:border-blue-500/30 transition-all duration-300">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Điểm TB Quiz</p>
                    <p className="text-lg font-black text-white">{stats.averageScore.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="bg-[#1e202f]/40 border border-gray-850 p-4 rounded-2xl flex items-center gap-3 hover:border-amber-500/30 transition-all duration-300">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Huy hiệu</p>
                    <p className="text-lg font-black text-white">{stats.achievementsCount} đạt được</p>
                  </div>
                </div>

                <div className="bg-[#1e202f]/40 border border-gray-850 p-4 rounded-2xl flex items-center gap-3 hover:border-red-500/30 transition-all duration-300">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Ngày học liên tiếp</p>
                    <p className="text-lg font-black text-white">{stats.streak} ngày 🔥</p>
                  </div>
                </div>
              </div>

              {/* Latest Certificate snapshot */}
              <div className="border-t border-white/5 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chứng chỉ gần nhất</h4>
                {stats.latestCert ? (
                  <div className="bg-[#1e202f]/20 border border-gray-850 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award size={20} className="text-[#00d4aa]" />
                      <div>
                        <p className="text-xs font-bold text-white">{stats.latestCert.course_title}</p>
                        <p className="text-[10px] text-gray-500">Mã: {stats.latestCert.certificate_number} · Ngày cấp: {stats.latestCert.completion_date}</p>
                      </div>
                    </div>
                    <a 
                      href="/student/certificates" 
                      className="text-[10px] font-bold text-[#00d4aa] hover:underline"
                    >
                      Xem tất cả
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 p-4 bg-[#1e202f]/10 border border-gray-850 rounded-xl text-center">
                    Bạn chưa được cấp chứng chỉ nào. Hoàn thành lộ trình học để nhận!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Preferences Form */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Settings className="text-[#00d4aa]" size={20} />
                    Cấu hình cài đặt
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Cá nhân hóa giao diện và thông báo ứng dụng</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              </div>
              <PreferencesForm preferences={preferences} />
            </div>
          )}

          {/* Tab 4: Security Form */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <ShieldAlert className="text-[#00d4aa]" size={20} />
                    Bảo mật tài khoản
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Đổi mật khẩu và quản lý phiên đăng nhập hiện tại</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              </div>
              <SecurityForm />
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
  )
}
