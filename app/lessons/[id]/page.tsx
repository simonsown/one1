import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Book, Video, FileText, CheckCircle } from 'lucide-react'
import QuizInteractive from './QuizInteractive'

export default async function LessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch lesson data
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">
        <h2>Bài học không tồn tại</h2>
      </div>
    )
  }

  // Lấy lịch sử làm bài (nếu có)
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', params.id)
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-[#16213e] border-r border-[#1e293b] hidden md:flex flex-col p-6 h-screen sticky top-0 overflow-y-auto">
        <Link href="/builder" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00d2a0] transition-colors mb-10 text-sm font-medium">
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
        
        <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-4">Nội dung khóa học</h3>
        
        <div className="flex flex-col gap-2">
          <div className="p-3 bg-[#00d2a0]/10 border border-[#00d2a0] text-[#00d2a0] rounded-xl text-sm font-semibold flex items-center justify-between">
            <span>{lesson.title}</span>
            {progress?.is_completed && <CheckCircle size={16} />}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-[#00d2a0] mb-4">
            <Book size={20} />
            <span className="font-semibold text-sm tracking-wide uppercase">Bài học lý thuyết</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">{lesson.title}</h1>
          <p className="text-lg text-slate-400 leading-relaxed">{lesson.description}</p>
        </header>

        <div className="w-full h-1 bg-[#1e293b] mb-12 rounded-full overflow-hidden">
          <div className={`h-full ${progress?.is_completed ? 'w-full bg-[#00d2a0]' : 'w-1/3 bg-[#00b4d8]'}`}></div>
        </div>

        {/* Nội dung bài học */}
        <div className="space-y-12">
          {/* Giả lập Content */}
          <section className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] shadow-xl">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-[#00d2a0]/10 text-[#00d2a0] flex items-center justify-center">
                 <Video size={24} />
               </div>
               <h2 className="text-2xl font-bold">Video Bài Giảng</h2>
             </div>
             <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-[#1e293b]">
               {/* Thay bằng iframe thật nếu có */}
               <div className="w-full h-full flex items-center justify-center text-slate-500">
                 [Video Player Placeholder]
               </div>
             </div>
          </section>

          {/* Quiz Tương Tác */}
          <QuizInteractive 
            lessonId={params.id} 
            userId={user.id} 
            initialProgress={progress} 
          />
        </div>
      </main>
    </div>
  )
}
