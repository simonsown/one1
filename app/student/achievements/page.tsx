'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements'
import { BadgeCard } from '@/components/achievements/BadgeCard'
import { Trophy, RefreshCw } from 'lucide-react'

export default function StudentAchievementsPage() {
  const [badges, setBadges] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [earnedCount, setEarnedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadAchievements = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: earned } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', user.id)

      const earnedMap = new Map((earned || []).map(e => [e.achievement_id, e.earned_at]))

      let pts = 0
      let count = 0

      const processed = ACHIEVEMENT_DEFINITIONS.map(def => {
        const isEarned = earnedMap.has(def.id)
        if (isEarned) {
          pts += def.points
          count++
        }
        return {
          ...def,
          earned: isEarned,
          earnedAt: earnedMap.get(def.id)
        }
      })

      setBadges(processed)
      setTotalPoints(pts)
      setEarnedCount(count)
      setLoading(false)
    }

    loadAchievements()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#089e60]" />
        <span className="text-xs text-gray-500">Đang tải bảng huy hiệu...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Overview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 bg-[#ffffff] border border-gray-200 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thành tích & Huy hiệu</h1>
              <p className="text-xs text-gray-400 mt-0.5">Vượt qua các thử thách thực hành để thu thập điểm và mở khóa huy hiệu danh giá</p>
            </div>
          </div>

          <div className="flex gap-6 border-l border-gray-200 pl-6">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng điểm</p>
              <p className="text-2xl font-black text-[#089e60]">{totalPoints} PTS</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Đã mở khóa</p>
              <p className="text-2xl font-black text-gray-900">{earnedCount} / {badges.length}</p>
            </div>
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badges.map(b => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>

      </div>
    </div>
  )
}
