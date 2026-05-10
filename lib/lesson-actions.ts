'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'

export async function saveLessonProgress(lessonId: string, score: number, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      score: score,
      is_completed: isCompleted,
      last_accessed: new Date().toISOString()
    }, {
      onConflict: 'user_id,lesson_id'
    })

  if (error) {
    console.error('Error saving progress:', error)
    return { error: error.message }
  }

  // Update total XP in user profile if completed
  if (isCompleted) {
    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
    const currentXp = profile?.xp || 0
    await supabase.from('profiles').update({ xp: currentXp + score }).eq('id', user.id)
  }

  revalidatePath(`/lessons/${lessonId}`)
  revalidatePath('/builder')
  
  return { success: true }
}
