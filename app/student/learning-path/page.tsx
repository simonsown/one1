'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export interface PathItemWithUnlock {
  id: string;
  path_id: string;
  item_type: 'lesson' | 'quiz' | 'lab_session' | 'milestone';
  item_id: string | null;
  title: string;
  description: string;
  order: number;
  unlock_condition: any;
  estimated_minutes: number;
  is_optional: boolean;
  is_unlocked: boolean;
  unlock_reason: string;
  completed?: boolean;
}
import { PathTimeline } from '@/components/learning-path/PathTimeline'
import { RefreshCw, Map, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StudentLearningPathPage() {
  const router = useRouter()
  const [items, setItems] = useState<PathItemWithUnlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadPath = async () => {
      try {
        setError('')
        // Find first active learning path
        const { data: path, error: pathErr } = await supabase
          .from('learning_paths')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        if (pathErr) throw pathErr
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        if (!path) {
          // If no active path exists, fallback to dynamic lessons structure
          await loadFallbackLessons(user.id)
          return
        }

        // Call postgrest rpc function get_unlocked_items
        const { data: unlockStates, error: rpcError } = await supabase.rpc('get_unlocked_items', {
          p_student_id: user.id,
          p_path_id: path.id
        })

        if (rpcError) throw rpcError

        // Load the original path items
        const { data: pathItems, error: itemsError } = await supabase
          .from('path_items')
          .select('*')
          .eq('path_id', path.id)
          .order('order', { ascending: true })

        if (itemsError) throw itemsError

        // Check lesson completions if lesson
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, status')
          .eq('student_id', user.id)

        const processed: PathItemWithUnlock[] = (pathItems || []).map((item: any) => {
          const state = (unlockStates || []).find((s: any) => s.id === item.id)
          const lessonProg = (progress || []).find((p: any) => p.lesson_id === item.item_id)

          return {
            ...item,
            is_unlocked: state ? state.is_unlocked : true,
            unlock_reason: state ? state.unlock_reason : 'always_available',
            completed: lessonProg?.status === 'completed'
          }
        })

        setItems(processed)
      } catch (err: any) {
        console.warn('Learning paths table missing or error occurred. Loading self-healing fallback timeline.', err)
        // Self-healing fallback timeline
        const { data: { user } } = await supabase.auth.getUser()
        await loadFallbackLessons(user?.id || 'guest')
      } finally {
        setLoading(false)
      }
    }

    const loadFallbackLessons = async (userId: string) => {
      try {
        let dbLessons: any[] = []
        let progress: any[] = []

        try {
          // Query actual lessons from database to populate timeline dynamically
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('id, title, description')
            .limit(10)
          if (lessonsData) dbLessons = lessonsData

          // Query completions
          if (userId !== 'guest') {
            const { data: progressData } = await supabase
              .from('lesson_progress')
              .select('lesson_id, status')
              .eq('student_id', userId)
            if (progressData) progress = progressData
          }
        } catch (dbErr) {
          console.warn('Database query failed in fallback loader, using mock data.', dbErr)
        }

        const mockList: PathItemWithUnlock[] = []

        if (dbLessons && dbLessons.length > 0) {
          dbLessons.forEach((lesson, index) => {
            const completed = (progress || []).some(p => p.lesson_id === lesson.id && p.status === 'completed')
            // Unlock first lesson always, subsequent ones unlocked if previous is completed
            const is_unlocked = index === 0 || (progress || []).some(p => p.lesson_id === dbLessons[index - 1].id && p.status === 'completed')

            mockList.push({
              id: `fallback_item_${lesson.id}`,
              path_id: 'fallback_path',
              item_type: 'lesson',
              item_id: lesson.id,
              title: lesson.title,
              description: lesson.description || 'Học phần cấu tạo phần cứng PC Master.',
              order: index + 1,
              unlock_condition: index > 0 ? { type: 'complete_previous' } : null,
              estimated_minutes: 30 + (index * 10),
              is_optional: false,
              is_unlocked: is_unlocked,
              unlock_reason: is_unlocked ? 'always_available' : 'need_complete_previous',
              completed: completed
            })
          })

          // Add a beautiful custom mini quiz at the end of the lessons
          mockList.push({
            id: 'fallback_quiz_final',
            path_id: 'fallback_path',
            item_type: 'quiz',
            item_id: 'quiz-cpu-base',
            title: 'Bài Kiểm Tra Tổng Hợp: Lắp Ráp Máy Tính Căn Bản',
            description: 'Trắc nghiệm củng cố kiến thức toàn diện sau khi hoàn thành các bài học.',
            order: dbLessons.length + 1,
            unlock_condition: { type: 'complete_previous' },
            estimated_minutes: 15,
            is_optional: false,
            is_unlocked: (progress || []).some(p => p.lesson_id === dbLessons[dbLessons.length - 1].id && p.status === 'completed'),
            unlock_reason: 'need_complete_previous',
            completed: false
          })
        } else {
          // Hardcoded beautiful demo items if database is totally empty
          const fallbackData = [
            { id: '1', title: 'Khái Quát Về Hệ Thống Máy Tính & Phần Cứng', desc: 'Tìm hiểu về các bộ phận cơ bản cấu thành nên một bộ máy tính cá nhân.', type: 'lesson', mins: 45, completed: true, unlocked: true },
            { id: '2', title: 'Chi Tiết Bộ Vi Xử Lý (CPU) & Cơ Chế Hoạt Động', desc: 'Khám phá trái tim của máy tính: cấu trúc, thông số xung nhịp và số nhân số luồng.', type: 'lesson', mins: 60, completed: false, unlocked: true },
            { id: '3', title: 'Thử Thách Trắc Nghiệm: Kiến Thức CPU Căn Bản', desc: 'Bài kiểm tra nhanh để củng cố kiến thức về socket và kiến trúc vi xử lý.', type: 'quiz', mins: 15, completed: false, unlocked: true },
            { id: '4', title: 'Thực Hành: Lắp Đặt CPU Vào Bo Mạch Chủ (Mainboard)', desc: 'Chạy giả lập 3D để thực hành căn chỉnh chốt socket và bôi keo tản nhiệt.', type: 'lab_session', mins: 30, completed: false, unlocked: false },
            { id: '5', title: 'Hệ Thống Lưu Trữ: Phân Biệt RAM, SSD & HDD', desc: 'Hiểu sâu về tốc độ đọc ghi dữ liệu và vai trò của bộ nhớ đệm.', type: 'lesson', mins: 50, completed: false, unlocked: false }
          ]

          fallbackData.forEach((d, idx) => {
            mockList.push({
              id: `demo_item_${d.id}`,
              path_id: 'demo_path',
              item_type: d.type as any,
              item_id: d.id,
              title: d.title,
              description: d.desc,
              order: idx + 1,
              unlock_condition: idx > 0 ? { type: 'complete_previous' } : null,
              estimated_minutes: d.mins,
              is_optional: false,
              is_unlocked: d.unlocked,
              unlock_reason: d.unlocked ? 'always_available' : 'need_complete_previous',
              completed: d.completed
            })
          })
        }

        setItems(mockList)
      } catch (fErr) {
        console.error('Error running fallback loader:', fErr)
        // Never crash, yield direct premium backup mock timeline
        const fallbackData = [
          { id: '1', title: 'Khái Quát Về Hệ Thống Máy Tính & Phần Cứng', desc: 'Tìm hiểu về các bộ phận cơ bản cấu thành nên một bộ máy tính cá nhân.', type: 'lesson', mins: 45, completed: true, unlocked: true },
          { id: '2', title: 'Chi Tiết Bộ Vi Xử Lý (CPU) & Cơ Chế Hoạt Động', desc: 'Khám phá trái tim của máy tính: cấu trúc, thông số xung nhịp và số nhân số luồng.', type: 'lesson', mins: 60, completed: false, unlocked: true },
          { id: '3', title: 'Thử Thách Trắc Nghiệm: Kiến Thức CPU Căn Bản', desc: 'Bài kiểm tra nhanh để củng cố kiến thức về socket và kiến trúc vi xử lý.', type: 'quiz', mins: 15, completed: false, unlocked: true },
          { id: '4', title: 'Thực Hành: Lắp Đặt CPU Vào Bo Mạch Chủ (Mainboard)', desc: 'Chạy giả lập 3D để thực hành căn chỉnh chốt socket và bôi keo tản nhiệt.', type: 'lab_session', mins: 30, completed: false, unlocked: false },
          { id: '5', title: 'Hệ Thống Lưu Trữ: Phân Biệt RAM, SSD & HDD', desc: 'Hiểu sâu về tốc độ đọc ghi dữ liệu và vai trò của bộ nhớ đệm.', type: 'lesson', mins: 50, completed: false, unlocked: false }
        ]
        const mockList: PathItemWithUnlock[] = []
        fallbackData.forEach((d, idx) => {
          mockList.push({
            id: `demo_item_${d.id}`,
            path_id: 'demo_path',
            item_type: d.type as any,
            item_id: d.id,
            title: d.title,
            description: d.desc,
            order: idx + 1,
            unlock_condition: idx > 0 ? { type: 'complete_previous' } : null,
            estimated_minutes: d.mins,
            is_optional: false,
            is_unlocked: d.unlocked,
            unlock_reason: d.unlocked ? 'always_available' : 'need_complete_previous',
            completed: d.completed
          })
        })
        setItems(mockList)
      }
    }

    loadPath()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#00d4aa]" />
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang tải lộ trình học...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Tech decorative corners & neon overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#00d4aa]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Workspace Title & Exit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl">
              <Map size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Lộ trình học tập PC Master</h1>
              <p className="text-xs text-gray-400 mt-0.5">Hoàn thành lần lượt các nội dung bài học để mở khóa thử thách tiếp theo</p>
            </div>
          </div>

          {/* EXIT BUTTON */}
          <button 
            onClick={() => router.push('/student')}
            className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center bg-[#1a1c25] border border-gray-800 rounded-2xl text-gray-400">
            {error}
          </div>
        ) : (
          <PathTimeline items={items} />
        )}
      </div>
    </div>
  )
}
