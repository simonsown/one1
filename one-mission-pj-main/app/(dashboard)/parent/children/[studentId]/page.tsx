import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import ChildProgressChart from '@/components/parent/ChildProgressChart'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements'
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Clock, 
  Flame, 
  GraduationCap, 
  Percent, 
  Trophy, 
  TrendingUp, 
  Activity 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ studentId: string }>
}

function formatDuration(seconds: number) {
  if (!seconds) return '0 phút'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} phút`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
}

export default async function StudentDetailPage({ params }: PageProps) {
  // 1. Xác thực và bảo vệ route
  const user = await requireRole(['parent', 'admin'])
  const { studentId } = await params
  
  const supabase = await createClient()

  // 2. Xác thực quyền liên kết
  const { data: link, error: linkError } = await supabase
    .from('parent_student_links')
    .select('*')
    .eq('parent_id', user.id)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .single()

  if (linkError || !link) {
    notFound()
  }

  // 3. Fetch thông tin học sinh
  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, student_code, school_name, avatar_url, level, xp')
    .eq('id', studentId)
    .single()

  if (!student) {
    notFound()
  }

  // 4. Fetch tiến trình bài học & tính toán stats
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('status, time_spent_seconds, completed_at, last_accessed')
    .eq('student_id', studentId)

  const completedLessonsCount = progressData?.filter(r => r.status === 'completed').length ?? 0
  const startedLessonsCount = progressData?.length ?? 0
  const totalSeconds = progressData?.reduce((sum, r) => sum + (r.time_spent_seconds ?? 0), 0) ?? 0

  // 5. Tính toán streak học tập
  const { data: streakData } = await supabase
    .from('lesson_progress')
    .select('last_accessed')
    .eq('student_id', studentId)
    .order('last_accessed', { ascending: false })

  let streak = 0
  if (streakData && streakData.length > 0) {
    const uniqueDates = Array.from(new Set(streakData.map(d => {
      const date = d.last_accessed ? new Date(d.last_accessed) : new Date()
      return date.toISOString().split('T')[0]
    }))).sort().reverse()

    if (uniqueDates.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let checkDate = new Date(today)
      const firstDateStr = uniqueDates[0]
      const firstDate = new Date(firstDateStr)
      firstDate.setHours(0,0,0,0)

      const diffStart = (today.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
      if (diffStart <= 1) {
        if (diffStart === 0 || diffStart === 1) {
          checkDate = firstDate
        }
        for (const dateStr of uniqueDates) {
          const d = new Date(dateStr)
          d.setHours(0, 0, 0, 0)
          
          if (d.getTime() === checkDate.getTime()) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (d.getTime() < checkDate.getTime()) {
            break
          }
        }
      }
    }
  }

  // 6. Tính toán điểm trắc nghiệm trung bình
  const { data: quizData } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('student_id', studentId)
    .eq('status', 'graded')

  const avgScore = quizData && quizData.length > 0
    ? Math.round(quizData.reduce((s, r) => s + r.score, 0) / quizData.length)
    : 0

  // 7. Tạo dữ liệu biểu đồ 30 ngày qua
  const counts: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`
    counts[formatted] = 0
  }

  progressData?.forEach(row => {
    if (row.completed_at) {
      const d = new Date(row.completed_at)
      const formatted = `${d.getDate()}/${d.getMonth() + 1}`
      if (counts[formatted] !== undefined) {
        counts[formatted] += 1
      }
    }
  })

  const dailyProgress = Object.keys(counts).map(date => ({ date, count: counts[date] }))

  // 8. Fetch bài học & chi tiết tiến độ
  const { data: dbLessons } = await supabase
    .from('lesson_progress')
    .select('id, lesson_id, status, completed_at, completion_percentage, time_spent_seconds, lessons(title, type)')
    .eq('student_id', studentId)
    .order('last_accessed', { ascending: false })

  const lessons = (dbLessons || []).map((row: any) => ({
    id: row.id,
    lesson_id: row.lesson_id,
    lesson_title: row.lessons?.title || 'Bài học giả lập',
    type: row.lessons?.type || 'Lý thuyết',
    status: row.status,
    completed_at: row.completed_at,
    completion_percentage: row.completion_percentage ?? 0,
    time_spent_seconds: row.time_spent_seconds ?? 0
  }))

  // 9. Fetch bài thi / quiz gần đây
  const { data: dbQuizAttempts } = await supabase
    .from('quiz_attempts')
    .select('id, score, status, created_at, quizzes(title)')
    .eq('student_id', studentId)
    .eq('status', 'graded')
    .order('created_at', { ascending: false })
    .limit(10)

  const quizResults = (dbQuizAttempts || []).map((row: any) => ({
    id: row.id,
    quiz_title: row.quizzes?.title || 'Bài kiểm tra',
    score: row.score,
    created_at: row.created_at,
    grade: row.score >= 90 ? 'Xuất sắc' : row.score >= 80 ? 'Giỏi' : row.score >= 65 ? 'Khá' : row.score >= 50 ? 'Trung bình' : 'Chưa đạt'
  }))

  // 10. Fetch thành tích đạt được
  const { data: dbAchievements } = await supabase
    .from('student_achievements')
    .select('achievement_id')
    .eq('student_id', studentId)

  const earnedIds = (dbAchievements || []).map(a => a.achievement_id)
  const achievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
    ...def,
    earned: earnedIds.includes(def.id)
  }))

  return (
    <div className="min-h-screen bg-[#0b0c11] text-[#dde0ed] p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Quay lại link */}
      <div>
        <a 
          href="/parent/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#636678] hover:text-[#00d4aa] transition-colors"
        >
          <ArrowLeft size={14} />
          Quay lại bảng điều khiển
        </a>
      </div>

      {/* SECTION 1 — HEADER */}
      <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {student.avatar_url ? (
            <img 
              src={student.avatar_url} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/10" 
              alt={student.full_name} 
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1f2130] flex items-center justify-center text-3xl font-black text-[#00d4aa] border border-white/5 uppercase">
              {student.full_name[0] || 'S'}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#dde0ed]">{student.full_name}</h1>
            <div className="text-xs text-[#636678] mt-1">{student.school_name || 'Chưa cập nhật trường'}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-[10px] bg-white/5 border border-white/5 text-[#dde0ed] px-2 py-0.5 rounded uppercase tracking-widest">
                {student.student_code}
              </span>
              <span className="text-[10px] font-bold bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Cấp {student.level || 1}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1c25] border border-white/5 rounded-xl px-5 py-4 min-w-[140px] text-center md:text-right relative z-10 self-stretch md:self-auto flex md:flex-col justify-between items-center md:items-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#636678]">Tổng điểm tích lũy</span>
          <span className="text-2xl font-black text-[#00d4aa]">{student.xp || 0} XP</span>
        </div>
      </div>

      {/* SECTION 2 — STATS TỔNG */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bài hoàn thành */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#dde0ed]">{completedLessonsCount}</div>
            <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Bài đã xong</div>
          </div>
        </div>

        {/* Giờ học */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 text-[#00d4aa] flex items-center justify-center flex-shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#dde0ed]">{formatDuration(totalSeconds)}</div>
            <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Tổng giờ học</div>
          </div>
        </div>

        {/* Điểm TB quiz */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#dde0ed]">{avgScore}%</div>
            <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Điểm TB Quiz</div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
            <Flame size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#dde0ed]">{streak} ngày</div>
            <div className="text-[10px] text-[#636678] uppercase font-bold tracking-wider">Chuỗi liên tục</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 3 — BIỂU ĐỒ TIẾN ĐỘ 30 NGÀY */}
        <div className="lg:col-span-2">
          <ChildProgressChart data={dailyProgress} />
        </div>

        {/* SECTION 6 — THÀNH TÍCH ĐẠT ĐƯỢC */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#dde0ed] flex items-center gap-2">
              <Trophy size={16} className="text-[#00d4aa]" />
              Thành tích của con
            </h3>
            <p className="text-[10px] text-[#636678] uppercase font-bold tracking-wider mt-0.5">Các huy hiệu con đã nhận được</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  ach.earned 
                    ? 'bg-[#1a1c25] border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.02)]' 
                    : 'bg-black/20 border-white/5 opacity-40'
                }`}
                title={ach.description}
              >
                <div className="text-2xl mb-1.5">{ach.icon}</div>
                <div className={`text-[10px] font-bold truncate w-full ${ach.earned ? 'text-[#dde0ed]' : 'text-[#636678]'}`}>
                  {ach.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4 — DANH SÁCH BÀI HỌC */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#dde0ed] flex items-center gap-2">
              <Activity size={16} className="text-[#00b4d8]" />
              Tiến trình học tập
            </h3>
            <p className="text-[10px] text-[#636678] uppercase font-bold tracking-wider mt-0.5">Các bài học gần đây nhất</p>
          </div>
          
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#636678]">Con chưa bắt đầu bài học nào</div>
            ) : (
              lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className="bg-[#1a1c25] border border-white/5 rounded-xl p-3.5 flex justify-between items-center gap-4 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#dde0ed] truncate">{lesson.lesson_title}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#636678] font-bold">
                      <span className="bg-white/5 px-2 py-0.5 rounded uppercase">{lesson.type}</span>
                      <span>•</span>
                      <span>Học {formatDuration(lesson.time_spent_seconds)}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {lesson.status === 'completed' ? (
                      <span className="text-[10px] font-bold bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Hoàn thành
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {lesson.completion_percentage}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 5 — KẾT QUẢ QUIZ GẦN ĐÂY */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#dde0ed] flex items-center gap-2">
              <Award size={16} className="text-[#a855f7]" />
              Kết quả trắc nghiệm
            </h3>
            <p className="text-[10px] text-[#636678] uppercase font-bold tracking-wider mt-0.5">Điểm số 10 bài kiểm tra gần nhất</p>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {quizResults.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#636678]">Con chưa thực hiện bài kiểm tra nào</div>
            ) : (
              quizResults.map((attempt) => (
                <div 
                  key={attempt.id} 
                  className="bg-[#1a1c25] border border-white/5 rounded-xl p-3.5 flex justify-between items-center gap-4 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[#dde0ed] truncate">{attempt.quiz_title}</div>
                    <div className="text-[10px] text-[#636678] font-bold mt-1.5">
                      Đạt: <span className="text-[#00d4aa]">{attempt.score}%</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      attempt.score >= 80 
                        ? 'bg-[#00d4aa]/10 border-[#00d4aa]/20 text-[#00d4aa]' 
                        : attempt.score >= 50 
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {attempt.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
