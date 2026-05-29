import React from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { completeLessonAction } from '@/lib/learning-actions'
import DiscussionPanel from '@/components/discussion/DiscussionPanel'

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'student'
  if (user) {
    // Fetch profile to get role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role

    await supabase.from('lesson_progress').upsert({
      student_id: user.id,
      lesson_id: params.lessonId,
      status: 'in_progress',
      last_accessed: new Date().toISOString()
    }, { onConflict: 'student_id,lesson_id' })
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#dde0ed]">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#ffffff] border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-bold text-[#089e60] mb-4">Danh sách bài học</h3>
        <ul className="space-y-2">
          <li className="p-2 rounded bg-white text-sm border-l-2 border-[#089e60]">Bài đang xem</li>
          <li className="p-2 rounded hover:bg-gray-100 text-sm text-gray-400">Bài tiếp theo</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <div className="p-8 flex-1 overflow-y-auto pb-24">
          <h1 className="text-3xl font-bold mb-6">Nội dung bài học</h1>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-6 border border-gray-200">
            Video Player Placeholder
          </div>
          <div className="prose prose-invert max-w-none">
            <p>Nội dung chi tiết bài học sẽ hiển thị ở đây...</p>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#ffffff] border-t border-gray-200 p-4 flex justify-end">
          <form action={completeLessonAction.bind(null, params.lessonId)}>
            <button type="submit" className="bg-[#089e60] text-[#0d0e13] px-6 py-2 rounded-lg font-bold hover:opacity-90">
              Đánh dấu hoàn thành
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar (Discussion) */}
      <div className="w-80 bg-[#ffffff] border-l border-gray-200 p-0 hidden lg:flex flex-col">
        {user && (
          <DiscussionPanel 
            lessonId={params.lessonId} 
            currentUserId={user.id} 
            userRole={userRole as any} 
          />
        )}
      </div>
    </div>
  )
}
