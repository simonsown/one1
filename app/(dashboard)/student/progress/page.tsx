import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-ssr-server'
import { 
  getProgressStats, 
  getDailyProgress, 
  getAllLessonProgress, 
  getAllQuizAttempts, 
  getBuilderActivity 
} from '@/lib/progress'
import ProgressView from '@/components/progress/ProgressView'

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [stats, dailyProgress, lessons, quizResults, builderActivity] =
    await Promise.all([
      getProgressStats(supabase, user.id),
      getDailyProgress(supabase, user.id, 30),
      getAllLessonProgress(supabase, user.id),
      getAllQuizAttempts(supabase, user.id),
      getBuilderActivity(supabase, user.id, 90),
    ])

  return (
    <div className="p-6 md:p-10">
      <ProgressView data={{ stats, dailyProgress, lessons, quizResults, builderActivity }} />
    </div>
  )
}
