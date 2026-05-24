'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Search, Filter, ArrowUp, ArrowDown, User, Star, Award, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global')
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()

    const channel = supabase
      .channel('leaderboard_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchLeaderboard())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10)

      if (data) {
        setTopPlayers(data.slice(0, 3))
        setOtherPlayers(data.slice(3))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#00d2a0]">Đang tải bảng xếp hạng...</div>

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Bảng <span className="text-[#00d2a0]">Xếp hạng</span></h1>
          <p className="text-slate-400">Những học viên xuất sắc nhất trong cộng đồng PC Master Builder.</p>
        </div>

        {/* Podium */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-20 px-4">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full md:w-64 bg-[#16213e] border border-[#1e293b] rounded-t-[32px] p-8 text-center relative h-64 flex flex-col items-center justify-end"
          >
             <div className="absolute -top-10 w-20 h-20 rounded-full bg-slate-400 p-1">
                <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center text-2xl font-bold">
                  {topPlayers[1]?.full_name?.charAt(0) || '2'}
                </div>
             </div>
             <div className="mb-4">
               <p className="font-bold text-lg">{topPlayers[1]?.full_name || 'Đang chờ...'}</p>
               <p className="text-sm text-slate-400">{topPlayers[1]?.xp || 0} XP</p>
             </div>
             <div className="w-full py-4 bg-slate-400/10 rounded-2xl border border-slate-400/20 text-slate-400 font-black text-2xl">2</div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-72 bg-gradient-to-b from-[#16213e] to-[#00d2a0]/10 border border-[#00d2a0]/30 rounded-t-[40px] p-8 text-center relative h-80 flex flex-col items-center justify-end shadow-[0_0_50px_rgba(0,210,160,0.1)]"
          >
             <div className="absolute -top-12 w-24 h-24 rounded-full bg-yellow-500 p-1 animate-pulse shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center text-3xl font-bold">
                  {topPlayers[0]?.full_name?.charAt(0) || '1'}
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500"><Trophy size={32} /></div>
             </div>
             <div className="mb-6">
               <p className="font-black text-xl text-white">{topPlayers[0]?.full_name || 'Đang chờ...'}</p>
               <p className="text-[#00d2a0] font-bold">{topPlayers[0]?.xp || 0} XP</p>
             </div>
             <div className="w-full py-6 bg-yellow-500 text-black rounded-2xl font-black text-4xl shadow-xl">1</div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-64 bg-[#16213e] border border-[#1e293b] rounded-t-[32px] p-8 text-center relative h-56 flex flex-col items-center justify-end"
          >
             <div className="absolute -top-10 w-20 h-20 rounded-full bg-orange-700 p-1">
                <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center text-2xl font-bold">
                  {topPlayers[2]?.full_name?.charAt(0) || '3'}
                </div>
             </div>
             <div className="mb-4">
               <p className="font-bold text-lg">{topPlayers[2]?.full_name || 'Đang chờ...'}</p>
               <p className="text-sm text-slate-400">{topPlayers[2]?.xp || 0} XP</p>
             </div>
             <div className="w-full py-4 bg-orange-700/10 rounded-2xl border border-orange-700/20 text-orange-700 font-black text-2xl">3</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('global')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'global' ? 'bg-[#00d2a0] text-black' : 'bg-[#16213e] text-slate-500'}`}>TOÀN CẦU</button>
          <button onClick={() => setActiveTab('class')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'class' ? 'bg-[#00d2a0] text-black' : 'bg-[#16213e] text-slate-500'}`}>LỚP HỌC</button>
        </div>

        {/* List */}
        <div className="bg-[#16213e] rounded-[32px] border border-[#1e293b] overflow-hidden">
          {otherPlayers.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-6 hover:bg-[#1e293b]/50 transition-all border-b border-[#1e293b] last:border-none">
              <div className="flex items-center gap-6">
                <span className="text-xl font-black text-slate-500 w-8">{p.rank}</span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] flex items-center justify-center font-bold text-slate-400">
                    {p.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{p.full_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Học viên</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-black text-lg">{p.xp}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">XP</p>
                </div>
                <div className="p-3 bg-[#0f0f1a] rounded-xl text-green-400">
                  <Zap size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Rank Placeholder */}
        <div className="mt-12 p-6 bg-[#00d2a0] rounded-3xl flex items-center justify-between text-black">
           <div className="flex items-center gap-4">
             <span className="text-2xl font-black">#124</span>
             <div>
               <p className="font-black leading-none">Bạn (Nguyễn Văn H)</p>
               <p className="text-xs font-bold opacity-70">Còn thiếu 150 XP để vào Top 100</p>
             </div>
           </div>
           <button className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm">TĂNG TỐC NGAY</button>
        </div>
      </main>
    </div>
  )
}
