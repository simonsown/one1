import { SupabaseClient } from '@supabase/supabase-js'

export interface ProgressStats {
  completed: number
  total: number
  totalSeconds: number
  avgScore: number
  streak: number
}

export interface DailyProgress {
  date: string
  count: number
}

export interface LessonProgress {
  id: string
  lesson_id: string
  lesson_title: string
  type: string
  status: string
  score: number | null
  completed_at: string | null
  completion_percentage: number
}

export interface QuizAttempt {
  id: string
  quiz_title: string
  score: number
  passing_score: number
}

export interface BuilderActivity {
  date: string
  minutes: number
}

export async function getProgressStats(supabase: SupabaseClient, userId: string): Promise<ProgressStats> {
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('status, time_spent_seconds')
    .eq('student_id', userId)

  const completed = progressData?.filter(r => r.status === 'completed').length ?? 0
  const total = progressData?.length ?? 0
  const totalSeconds = progressData?.reduce((sum, r) => sum + (r.time_spent_seconds ?? 0), 0) ?? 0

  const { data: quizData } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('student_id', userId)
    .eq('status', 'graded')

  const avgScore = quizData && quizData.length > 0
    ? Math.round(quizData.reduce((s, r) => s + r.score, 0) / quizData.length)
    : 0

  const streak = await getStreak(supabase, userId)

  return { completed, total, totalSeconds, avgScore, streak }
}

export async function getStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('last_accessed')
    .eq('student_id', userId)
    .order('last_accessed', { ascending: false })

  if (!data || data.length === 0) return 0

  const uniqueDates = Array.from(new Set(data.map(d => {
      const date = d.last_accessed ? new Date(d.last_accessed) : new Date()
      return date.toISOString().split('T')[0]
  }))).sort().reverse()

  if (uniqueDates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let checkDate = new Date(today)
  
  const firstDateStr = uniqueDates[0]
  const firstDate = new Date(firstDateStr)
  firstDate.setHours(0,0,0,0)

  const diffStart = (today.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)
  if (diffStart > 1) return 0 

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

  return streak
}

export async function getDailyProgress(supabase: SupabaseClient, userId: string, days: number): Promise<DailyProgress[]> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('completed_at')
    .eq('student_id', userId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)

  const counts: Record<string, number> = {}
  
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`
    counts[formatted] = 0
  }

  data?.forEach(row => {
    if (row.completed_at) {
      const d = new Date(row.completed_at)
      const formatted = `${d.getDate()}/${d.getMonth() + 1}`
      if (counts[formatted] !== undefined) {
        counts[formatted] += 1
      }
    }
  })

  return Object.keys(counts).map(date => ({ date, count: counts[date] }))
}

export async function getAllLessonProgress(supabase: SupabaseClient, userId: string): Promise<LessonProgress[]> {
  const { data } = await supabase
    .from('lesson_progress')
    .select('id, lesson_id, status, completed_at, completion_percentage')
    .eq('student_id', userId)
    .order('last_accessed', { ascending: false })

  return (data || []).map((row, index) => ({
    id: row.id,
    lesson_id: row.lesson_id,
    lesson_title: `Bài học giả lập ${index + 1}`,
    type: index % 3 === 0 ? 'Quiz' : (index % 2 === 0 ? 'Lab' : 'Lý thuyết'),
    status: row.status,
    score: row.status === 'completed' ? 100 : null,
    completed_at: row.completed_at,
    completion_percentage: row.completion_percentage ?? 0
  }))
}

export async function getAllQuizAttempts(supabase: SupabaseClient, userId: string): Promise<QuizAttempt[]> {
  const { data } = await supabase
    .from('quiz_attempts')
    .select('id, score, status')
    .eq('student_id', userId)
    .eq('status', 'graded')
    .order('created_at', { ascending: false })
    .limit(10)

  return (data || []).map((row, index) => ({
    id: row.id,
    quiz_title: `Bài kiểm tra ${index + 1}`,
    score: row.score,
    passing_score: 70
  }))
}

export async function getBuilderActivity(supabase: SupabaseClient, userId: string, days: number): Promise<BuilderActivity[]> {
  const { data } = await supabase
    .from('builder_sessions')
    .select('started_at, ended_at')
    .eq('student_id', userId)

  const counts: Record<string, number> = {}
  
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const formatted = d.toISOString().split('T')[0]
    counts[formatted] = 0
  }

  data?.forEach(row => {
    if (row.started_at && row.ended_at) {
      const d = new Date(row.started_at)
      const formatted = d.toISOString().split('T')[0]
      if (counts[formatted] !== undefined) {
        const start = new Date(row.started_at).getTime()
        const end = new Date(row.ended_at).getTime()
        const minutes = Math.floor((end - start) / 60000)
        counts[formatted] += minutes
      }
    }
  })

  return Object.keys(counts).map(date => ({ date, minutes: counts[date] }))
}
