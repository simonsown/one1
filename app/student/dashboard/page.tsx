import React, { Suspense } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

async function getDashboardData() {
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
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return { profile }
}

export default async function StudentDashboardPage() {
  const data = await getDashboardData()
  if (!data) return null

  return (
    <div className="min-h-screen bg-[#0d0e13] text-[#dde0ed] p-8">
      <h1 className="text-3xl font-bold mb-8">Chào buổi sáng, {data.profile?.full_name || 'Học viên'} 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget B - Progress Ring */}
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4 text-[#00d4aa]">Tiến độ học tập</h2>
          <div className="w-32 h-32 rounded-full border-4 border-[#00d4aa] flex items-center justify-center">
            <span className="text-2xl font-bold">45%</span>
          </div>
        </div>

        {/* Widget C - Hôm nay cần làm */}
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-[#00d4aa]">Hôm nay cần làm</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-[#0d0e13] rounded-lg border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Bài giảng chưa xem: Cấu tạo Mainboard</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-[#0d0e13] rounded-lg border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Quiz sắp hết hạn: Lịch sử máy tính (Còn 48h)</span>
            </li>
          </ul>
        </div>

        {/* Widget D - Streak */}
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-[#00d4aa]">Streak Ngày Học</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className={`w-8 h-8 rounded ${i <= 3 ? 'bg-[#00d4aa]' : 'bg-gray-800'}`}></div>
            ))}
          </div>
        </div>

        {/* Widget E - Thông báo */}
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-[#00d4aa]">Thông báo gần đây</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">Giáo viên vừa thêm bài tập mới</p>
            <p className="text-gray-400">Điểm bài quiz tuần 1: 90/100</p>
          </div>
          <Link href="/notifications" className="text-[#00d4aa] text-sm mt-4 inline-block hover:underline">
            Xem tất cả
          </Link>
        </div>

        {/* Widget F - Tiếp tục học */}
        <div className="bg-[#1a1c25] p-6 rounded-xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-[#00d4aa]">Tiếp tục học</h2>
          <div className="p-4 bg-[#0d0e13] rounded-lg border border-gray-800">
            <h3 className="font-semibold mb-2">Bài 3: CPU & RAM</h3>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div className="bg-[#00d4aa] h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <Link href="/student/lessons/1" className="bg-[#00d4aa] text-[#0d0e13] px-4 py-2 rounded font-semibold text-sm inline-block">
              Tiếp tục
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
