'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Star, Zap, Clock, Trophy } from 'lucide-react'

import { supabase } from '@/lib/supabase'

export default function DailyQuests() {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuests()
  }, [])

  async function fetchQuests() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: qData } = await supabase
        .from('daily_quests')
        .select(`
          *,
          user_quests (
            is_completed
          )
        `)
        .limit(3)
      
      setQuests(qData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-slate-500 text-xs animate-pulse">Đang tải nhiệm vụ...</div>
  if (quests.length === 0) return null // "Nếu không có thì không có"

  return (
    <div className="bg-[#ffffff] border border-[#e7e7e7] rounded-[32px] p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" /> Nhiệm vụ ngày
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Làm mới sau 12h</span>
      </div>

      <div className="space-y-4">
        {quests.map((q, i) => {
          const isDone = q.user_quests && q.user_quests.length > 0 && q.user_quests[0].is_completed;
          return (
            <div key={q.id} className={`p-5 rounded-2xl border transition-all ${
              isDone ? 'bg-[#f8f9fa]/50 border-[#089e60]/20 opacity-60' : 'bg-[#f8f9fa] border-[#e7e7e7] hover:border-[#e7e7e7]'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 ${isDone ? 'text-[#089e60]' : 'text-slate-600'}`}>
                  {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-bold ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>{q.title}</p>
                    <span className="text-xs font-bold text-[#089e60]">+{q.xp_reward} XP</span>
                  </div>
                  <p className="text-xs text-slate-500">{q.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-[#e7e7e7]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-400">Tiến độ hôm nay</p>
          <p className="text-xs font-bold text-[#089e60]">1/3</p>
        </div>
        <div className="h-2 bg-[#f8f9fa] rounded-full overflow-hidden">
           <div className="h-full bg-[#089e60]" style={{ width: '33.33%' }} />
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-4 font-medium italic">Hoàn thành tất cả để nhận Rương May Mắn 🎁</p>
      </div>
    </div>
  )
}
