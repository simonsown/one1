'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  Users, User, BookOpen, BarChart2, Bell, RefreshCw, LogOut, 
  CheckCircle, Shield, Award, Calendar, ChevronRight, Activity, MessageSquare
} from 'lucide-react'
import { logout } from '@/lib/auth-actions'

interface ChildProfile {
  full_name: string;
  email: string;
  school_name: string;
  grade: string;
  avatar_url: string;
}

interface ActivityLog {
  id: string;
  type: 'lesson' | 'quiz' | 'badge';
  title: string;
  detail: string;
  time: string;
  status: 'completed' | 'ongoing' | 'achieved';
}

interface QuizResult {
  id: string;
  quiz_title: string;
  score: number;
  correct_count: number;
  total_questions: number;
  date: string;
}

interface Announcement {
  id: string;
  teacher_name: string;
  title: string;
  content: string;
  date: string;
}

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('Phụ huynh')
  
  // High-fidelity connected child data
  const [child, setChild] = useState<ChildProfile>({
    full_name: 'Nguyễn Tiến Minh',
    email: 'tienminh.student@gmail.com',
    school_name: 'THPT Chuyên Hà Nội - Amsterdam',
    grade: '10 Tin 1',
    avatar_url: '🎯'
  })

  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: 'a1', type: 'lesson', title: 'Hoàn thành bài giảng CPU', detail: 'Đã hoàn thành lý thuyết Socket và Lõi xử lý', time: '10 phút trước', status: 'completed' },
    { id: 'a2', type: 'quiz', title: 'Hoàn thành Quiz Bo mạch chủ', detail: 'Đạt điểm tuyệt đối 100/100', time: '1 giờ trước', status: 'completed' },
    { id: 'a3', type: 'badge', title: 'Nhận huy hiệu "Khởi đầu hành trình"', detail: 'Được thưởng 10 điểm XP danh dự', time: 'Hôm qua', status: 'achieved' },
    { id: 'a4', type: 'lesson', title: 'Bắt đầu học chọn bộ nguồn PSU', detail: 'Đang xem hướng dẫn cách tính công suất tiêu thụ', time: '2 ngày trước', status: 'ongoing' }
  ])

  const [quizzes, setQuizzes] = useState<QuizResult[]>([
    { id: 'q1', quiz_title: 'Kiến thức cơ bản về CPU & Socket', score: 90, correct_count: 9, total_questions: 10, date: '17/05/2026' },
    { id: 'q2', quiz_title: 'Lắp ráp Bo mạch chủ & RAM', score: 100, correct_count: 10, total_questions: 10, date: '16/05/2026' },
    { id: 'q3', quiz_title: 'Tính toán công suất nguồn PSU', score: 80, correct_count: 8, total_questions: 10, date: '14/05/2026' }
  ])

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 'ann1', teacher_name: 'Thầy Nguyễn Hùng', title: 'Lịch kiểm tra thực hành lắp ráp máy tính hoàn chỉnh', content: 'Cả lớp chuẩn bị kiến thức về kết nối dây nguồn Front Panel và dây SATA để làm bài thực hành lấy điểm hệ số 2 vào thứ Sáu tới nhé.', date: '15/05/2026' },
    { id: 'ann2', teacher_name: 'Cô Minh Thư', title: 'Cập nhật tài liệu kỹ thuật VGA mới', content: 'Cô đã gửi link thư viện VGA kiến trúc Nvidia Blackwell vào mục Kiến thức mở rộng. Các em đọc thêm để làm phần thử thách nâng cao.', date: '12/05/2026' }
  ])

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load Profile to verify role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.role !== 'parent') {
          router.push(profile.role === 'student' ? '/builder' : `/${profile.role}`)
          return
        }
        setParentName(profile.full_name || 'Phụ huynh')
        
        // If child profile is registered in DB, let's load dynamic data
        if (profile.class_code) {
          const { data: childProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile.class_code)
            .maybeSingle()
          
          if (childProfile) {
            setChild({
              full_name: childProfile.full_name || 'Nguyễn Tiến Minh',
              email: childProfile.email || 'tienminh.student@gmail.com',
              school_name: childProfile.school_name || 'Trường THPT Amsterdam',
              grade: childProfile.grade || '10 Tin 1',
              avatar_url: childProfile.avatar_url || '🎯'
            })
          }
        }
      }
      setLoading(false)
    }

    fetchSession()
  }, [supabase, router])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-white flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Đang đồng bộ cổng giám sát phụ huynh...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Neon Cyber Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/35 text-purple-400 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                CỔNG GIÁM SÁT PHỤ HUYNH
                <span className="text-[10px] bg-purple-500/15 text-purple-400 font-black border border-purple-500/25 px-2 py-0.5 rounded-full">PARENT PORTAL</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Kính chào <strong>{parentName}</strong> · Theo dõi tiến độ học tập và đồng hành cùng con trẻ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-bold rounded-xl transition-all"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Child Account Info & Class Teacher Announcements */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Child Profile Box */}
            <div className="relative bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl overflow-hidden group">
              <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-purple-500/30 group-hover:border-purple-500 transition-colors" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-500/30 group-hover:border-purple-500 transition-colors" />
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tài khoản con đang theo dõi</h3>
              
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <span className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-2xl rounded-2xl flex items-center justify-center">
                  {child.avatar_url}
                </span>
                <div>
                  <h4 className="font-bold text-white tracking-tight">{child.full_name}</h4>
                  <p className="text-xs text-gray-400">{child.email}</p>
                </div>
              </div>

              <div className="pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trường học:</span>
                  <span className="font-medium text-slate-200 text-right max-w-[200px] truncate">{child.school_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Lớp học hiện tại:</span>
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-purple-400 font-bold border border-purple-500/10">Lớp {child.grade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái học tập:</span>
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>

            {/* Class Announcements Widget */}
            <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Bell size={14} className="text-purple-400 animate-swing" />
                  Thông báo từ giáo viên
                </h3>
                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-400 font-bold">
                  {announcements.length} mới
                </span>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-black/30 border border-gray-850 p-4 rounded-2xl hover:border-purple-500/20 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-400 font-bold">{ann.teacher_name}</span>
                      <span className="text-[9px] text-gray-500">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-xs text-white leading-snug">{ann.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT PANELS: Real-time Activity Log & Quiz Scorecard */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Real-time Activity Log */}
            <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="text-purple-400 animate-pulse" size={18} />
                  Nhật ký hoạt động của con (Real-time Activity Log)
                </h3>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>

              <div className="relative border-l border-gray-800 ml-3 pl-6 space-y-6">
                {activities.map(act => (
                  <div key={act.id} className="relative group">
                    
                    {/* Timeline circle icon */}
                    <span className={`absolute left-[-33px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      act.type === 'badge' ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                      act.type === 'quiz' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                      'bg-green-500/20 border-green-500 text-green-400'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{act.title}</h4>
                        <span className="text-[9px] text-gray-500 ml-auto font-medium">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{act.detail}</p>
                      
                      {/* Sub-badges for states */}
                      <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-1 border ${
                        act.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        act.status === 'achieved' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {act.status === 'completed' ? 'Hoàn thành' :
                         act.status === 'achieved' ? 'Đạt huy hiệu' : 'Đang học'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Results Panel */}
            <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart2 className="text-purple-400" size={18} />
                  Kết quả kiểm tra & thi cử của con
                </h3>
                <span className="text-xs text-purple-400 font-bold uppercase">Bảng điểm tự động</span>
              </div>

              <div className="space-y-4">
                {quizzes.map(q => (
                  <div key={q.id} className="bg-black/25 border border-gray-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{q.quiz_title}</h4>
                      <p className="text-[10px] text-gray-500">
                        Ngày làm bài: {q.date} · Tỉ lệ đúng: {q.correct_count}/{q.total_questions} câu
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      
                      {/* Bar indicator */}
                      <div className="w-24 bg-gray-800 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${q.score >= 90 ? 'bg-green-500' : q.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${q.score}%` }}
                        />
                      </div>

                      <span className={`text-sm font-black tracking-tight px-3 py-1 rounded-xl border ${
                        q.score >= 90 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        q.score >= 70 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {q.score}%
                      </span>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
