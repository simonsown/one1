import React, { Suspense } from 'react'
import Link from 'next/link'
import { Bell, PlayCircle, Clock, BookOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-ssr-server'

// Types
type ProgressData = { total: number; completed: number; percentage: number }
type Activity = { id: string; title: string; date: string; type: string }
type Task = { id: string; title: string; type: 'lesson' | 'quiz' | 'forum'; deadline?: string }
type Notification = { id: string; message: string; date: string }

// Dummy Fetchers for UI Demonstration (Replace with real Supabase queries)
async function getStudentOverallProgress(userId: string): Promise<ProgressData> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return { total: 100, completed: 65, percentage: 65 }
}

async function getUpcomingTasks(userId: string): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 600))
  return [
    { id: '1', title: 'Bài 3: Lắp ráp CPU', type: 'lesson' },
    { id: '2', title: 'Quiz: Tổng quan phần cứng', type: 'quiz', deadline: 'Còn 24h' },
    { id: '3', title: 'Câu hỏi: Tản nhiệt nước', type: 'forum' }
  ]
}

async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return [
    { id: '1', message: 'Giáo viên đã chấm điểm bài Quiz của bạn.', date: '2 giờ trước' },
    { id: '2', message: 'Bạn đã mở khóa thành tựu "Người mới bắt đầu".', date: '1 ngày trước' },
    { id: '3', message: 'Khóa học mới: Lắp ráp tản nhiệt nước.', date: '2 ngày trước' },
    { id: '4', message: 'Cảnh báo: Bạn chưa đăng nhập 3 ngày.', date: '3 ngày trước' },
  ]
}

async function getRecentActivity(userId: string): Promise<Activity[]> {
  await new Promise(resolve => setTimeout(resolve, 700))
  return [
    { id: '1', title: 'Hoàn thành Bài 2: Bo mạch chủ', date: 'Hôm qua', type: 'lesson' },
    { id: '2', title: 'Tham gia Builder Lab', date: '2 ngày trước', type: 'lab' },
  ]
}

// Widget Components
function GreetingWidget({ name }: { name: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  
  return (
    <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b] flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{greeting}, {name} 👋</h1>
        <p className="text-slate-400">Sẵn sàng tiếp tục hành trình lắp ráp PC của bạn chưa?</p>
      </div>
      <div className="hidden md:block w-16 h-16 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa] flex items-center justify-center text-[#00d4aa]">
        <BookOpen size={28} />
      </div>
    </div>
  )
}

function ProgressWidget({ data }: { data: ProgressData }) {
  return (
    <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b] flex flex-col items-center justify-center text-center h-full">
      <h3 className="text-[#dde0ed] font-semibold mb-4 w-full text-left">Tiến độ tổng thể</h3>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="w-full h-full stroke-current">
          <path
            className="text-[#1e293b]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" strokeWidth="3"
          />
          <path
            className="text-[#00d4aa]"
            strokeDasharray={`${data.percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" strokeWidth="3"
          />
        </svg>
        <div className="absolute text-2xl font-bold text-white">{data.percentage}%</div>
      </div>
      <p className="text-slate-400 text-sm mt-4">Hoàn thành {data.completed}/{data.total} bài học</p>
    </div>
  )
}

function TasksWidget({ tasks }: { tasks: Task[] }) {
  return (
    <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b] h-full">
      <h3 className="text-[#dde0ed] font-semibold mb-4">Hôm nay cần làm</h3>
      <div className="flex flex-col gap-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0d0e13] border border-[#1e293b]">
            <div className={`p-2 rounded-md ${task.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' : task.type === 'quiz' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
              {task.type === 'lesson' ? <PlayCircle size={16} /> : task.type === 'quiz' ? <AlertCircle size={16} /> : <MessageSquare size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{task.title}</p>
              {task.deadline && <span className="text-xs text-red-400">{task.deadline}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StreakWidget() {
  const days = [true, true, true, false, true, true, false] // dummy 7 days
  return (
    <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#dde0ed] font-semibold">Chuỗi ngày học</h3>
        <span className="text-[#00d4aa] font-bold text-lg">5 Ngày 🔥</span>
      </div>
      <div className="flex justify-between gap-2">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${days[i] ? 'bg-[#00d4aa] text-black' : 'bg-[#1e293b] text-slate-500'}`}>
              {days[i] && <div className="w-2 h-2 bg-black rounded-full" />}
            </div>
            <span className="text-xs text-slate-400">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsWidget({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#dde0ed] font-semibold">Thông báo gần đây</h3>
        <Link href="/notifications" className="text-xs text-[#00d4aa] hover:underline">Xem tất cả</Link>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {notifications.map(n => (
          <div key={n.id} className="flex items-start gap-3">
            <div className="mt-0.5 text-[#00d4aa]"><Bell size={14} /></div>
            <div>
              <p className="text-sm text-slate-300 line-clamp-2">{n.message}</p>
              <span className="text-xs text-slate-500">{n.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContinueLearningWidget() {
  return (
    <div className="bg-gradient-to-r from-[#1a1c25] to-[#0d0e13] border border-[#00d4aa]/30 rounded-2xl p-6 flex flex-col justify-center">
      <span className="text-xs font-bold text-[#00d4aa] uppercase tracking-wider mb-2">Tiếp tục học</span>
      <h3 className="text-xl font-bold text-white mb-2">Bài 4: Lắp ráp RAM và Tản Nhiệt</h3>
      <p className="text-sm text-slate-400 mb-6">Bạn đang dừng ở phút 03:45. Tiếp tục ngay để hoàn thành chứng chỉ.</p>
      <Link href="/student/lessons/4" className="inline-flex items-center gap-2 bg-[#00d4aa] text-black px-5 py-2.5 rounded-lg font-semibold w-fit hover:bg-[#00e6af] transition-colors">
        <PlayCircle size={18} /> Tiếp tục ngay <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function MessageSquare(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
}

// Loading Fallback
function DashboardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="h-32 bg-[#1a1c25] rounded-2xl border border-[#1e293b]"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-[#1a1c25] rounded-2xl border border-[#1e293b]"></div>
        <div className="h-64 bg-[#1a1c25] rounded-2xl border border-[#1e293b]"></div>
        <div className="h-64 bg-[#1a1c25] rounded-2xl border border-[#1e293b]"></div>
      </div>
    </div>
  )
}

// Main Page
export default async function StudentDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const [progress, tasks, notifications, activity] = await Promise.all([
    getStudentOverallProgress(user.id),
    getUpcomingTasks(user.id),
    getUnreadNotifications(user.id),
    getRecentActivity(user.id),
  ])

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Widget A: Greeting */}
      <GreetingWidget name={profile?.full_name || 'Học viên'} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget B: Progress */}
        <ProgressWidget data={progress} />
        
        {/* Widget C: Tasks */}
        <TasksWidget tasks={tasks} />
        
        {/* Widget E: Notifications */}
        <NotificationsWidget notifications={notifications} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget F: Continue Learning */}
        <ContinueLearningWidget />

        {/* Widget D: Streak */}
        <div className="flex flex-col gap-6">
          <StreakWidget />
          
          <div className="bg-[#1a1c25] rounded-2xl p-6 border border-[#1e293b] flex-1">
            <h3 className="text-[#dde0ed] font-semibold mb-4">Hoạt động gần đây</h3>
            <div className="flex flex-col gap-3">
              {activity.map(a => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b border-[#1e293b] last:border-0">
                  <span className="text-sm text-slate-300">{a.title}</span>
                  <span className="text-xs text-slate-500">{a.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
