'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Thread } from '@/hooks/useDiscussion'
import { ThreadCard } from '@/components/discussion/ThreadCard'
import { ThreadDetail } from '@/components/discussion/ThreadDetail'
import { MessageSquare, RefreshCw, Send, Bot, Sparkles, Globe, School, Loader2, Cpu, User, ArrowLeft } from 'lucide-react'

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  role: 'student' | 'teacher' | 'assistant';
  content: string;
  time: string;
}

export default function DiscussionDashboardPage() {
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Realtime Chat States
  const [chatChannel, setChatChannel] = useState<'global' | 'class'>('global')
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([])
  const [classMessages, setClassMessages] = useState<ChatMessage[]>([])
  const [trendingTopic, setTrendingTopic] = useState<string>('Chưa có dữ liệu')
  const [chatInput, setChatInput] = useState('')
  
  // Tiny AI Chatbot States
  const [aiInput, setAiInput] = useState('')
  const [aiReplies, setAiReplies] = useState<string[]>([
    'Tôi là Micro AI Guru. Hãy đặt bất kỳ câu hỏi nhanh nào về phần cứng PC!'
  ])
  const [aiLoading, setAiLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load Profile
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setUserProfile(prof)

        // Load all threads
        const { data, error } = await supabase
          .from('discussion_threads')
          .select(`
            *,
            author:profiles(full_name, avatar_url, role)
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
        
        if (!error && data) {
          setThreads(data as any[])
        }
      } catch (err) {
        console.error('Error loading threads:', err)
      } finally {
        setLoading(false)
      }
    }

    loadThreads()
  }, [supabase])

  // Real-time topic analysis algorithm
  useEffect(() => {
    if (globalMessages.length === 0) {
       setTrendingTopic('Chưa có dữ liệu');
       return;
    }
    const words = globalMessages.map(m => m.content).join(' ').toLowerCase().split(/\s+/);
    const stopWords = ['có','không','là','thì','mà','và','để','của','cho','những','các','một','với','khi','trong','như','đã','sẽ','này','đó','đây','bạn','mình','thầy','ơi','nhé','ạ','vậy','cái','gì','nào'];
    const counts: Record<string, number> = {};
    words.forEach(w => {
      const cw = w.replace(/[^a-z0-9]/gi, '');
      if (cw.length > 2 && !stopWords.includes(cw)) {
        counts[cw] = (counts[cw] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    if (sorted.length > 0) {
      setTrendingTopic(sorted.slice(0, 3).map(x => '#' + x[0].toUpperCase()).join(', '));
    }
  }, [globalMessages])

  // Realtime WebSocket broadcast connection for chat channel
  useEffect(() => {
    if (!userProfile) return

    const channelName = `discussion_realtime_chat`
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    })

    channel
      .on('broadcast', { event: 'new-message' }, (response) => {
        const payload = response.payload
        const newMsg: ChatMessage = {
          id: payload.id,
          sender: payload.sender,
          avatar: payload.avatar,
          role: payload.role,
          content: payload.content,
          time: payload.time
        }

        if (payload.channel === 'global') {
          setGlobalMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        } else {
          setClassMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userProfile, supabase])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [globalMessages, classMessages])

  // Handle Send Chat in Real-time via Supabase WebSockets
  const handleSendChat = async () => {
    if (!chatInput.trim() || !userProfile) return
    const msgId = 'msg-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7)

    const payloadMsg = {
      id: msgId,
      sender: userProfile.full_name || 'Học viên',
      avatar: userProfile.avatar_url || '💻',
      role: userProfile.role === 'teacher' ? 'teacher' : 'student',
      content: chatInput,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      channel: chatChannel
    }

    try {
      await supabase.channel(`discussion_realtime_chat`).send({
        type: 'broadcast',
        event: 'new-message',
        payload: payloadMsg
      })
    } catch (err) {
      console.error('Error broadcasting message:', err)
    }
    setChatInput('')
  }

  // Handle Micro AI Send
  const handleSendAi = async () => {
    if (!aiInput.trim()) return
    const userQ = aiInput
    setAiInput('')
    setAiReplies(prev => [...prev, `Học viên: ${userQ}`])
    setAiLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQ })
      })
      const data = await res.json()
      setAiReplies(prev => [...prev, `AI Guru: ${data.reply || 'Xin lỗi, tôi gặp sự cố kết nối.'}`])
    } catch (err) {
      setAiReplies(prev => [...prev, 'AI Guru: Tôi đang bận xử lý dữ liệu khác, vui lòng thử lại sau.'])
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161F38] text-white pt-24 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#00d4aa]" size={32} />
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang kết nối diễn đàn...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161F38] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative High-Tech Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00d4aa]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00b4d8]/5 rounded-full filter blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Workspace Title & Exit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10 relative">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-2xl shadow-[0_0_15px_rgba(0,212,170,0.1)]">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                KHÔNG GIAN THẢO LUẬN 3D
                <span className="text-[9px] bg-[#00d4aa]/15 text-[#00d4aa] font-black border border-[#00d4aa]/25 px-2 py-0.5 rounded-full uppercase">REAL-TIME</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Nơi trao đổi kiến thức phần cứng máy tính thời gian thực giữa thầy và trò</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-1.5 text-xs text-slate-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
              Lớp {userProfile?.grade || 'PC Master'}
            </div>

            {/* EXIT/BACK BUTTON */}
            <button 
              onClick={() => router.push('/builder')}
              className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all shadow-md group cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại Dashboard
            </button>
          </div>
        </div>

        {/* Workspace Layout: Left (Discussions) & Right (Realtime Chat + Micro AI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (60%): Forums/Threads */}
          <div className="lg:col-span-7 space-y-6 relative">
            
            {/* Tech decorative corners */}
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00d4aa]/30 pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00d4aa]/30 pointer-events-none" />

            {selectedThread ? (
              <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl relative min-h-[500px]">
                <ThreadDetail 
                  thread={selectedThread}
                  currentUserId={userProfile?.id}
                  onBack={() => setSelectedThread(null)}
                />
              </div>
            ) : (
              <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-6 shadow-xl relative space-y-4 min-h-[500px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Globe size={18} className="text-[#00d4aa]" />
                    Chủ đề thảo luận sôi nổi
                  </h2>
                  <span className="text-[10px] bg-[#00d4aa]/15 text-[#00d4aa] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {threads.length} chủ đề
                  </span>
                </div>
                {threads.length === 0 ? (
                  <div className="p-20 text-center text-gray-500 italic">
                    Chưa có chủ đề thảo luận nào được tạo. Hãy là người đầu tiên đặt câu hỏi!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {threads.map(thread => (
                      <ThreadCard 
                        key={thread.id}
                        thread={thread}
                        onSelect={setSelectedThread}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (40%): Realtime Chat Workspace & Lockable Micro AI */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative">
            
            {/* Tech decorative corners */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00b4d8]/30 pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00b4d8]/30 pointer-events-none" />

            {/* Realtime Chat Card */}
            <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[400px]">
              
              {/* Channel Tabs */}
              <div className="p-3 bg-[#181926] border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setChatChannel('global')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${chatChannel === 'global' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Globe size={14} /> Kênh Chung
                  </button>
                  <button 
                    onClick={() => setChatChannel('class')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${chatChannel === 'class' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/25' : 'text-gray-400 hover:text-white'}`}
                  >
                    <School size={14} /> Kênh Lớp Học
                  </button>
                </div>
                <div className="text-[10px] text-gray-400 flex flex-col items-end hidden sm:flex">
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Trực tuyến</div>
                  <div className="text-[#00d4aa] font-bold mt-0.5" title="Chủ đề đang hot">Trending: {trendingTopic}</div>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0c16]/50">
                {(chatChannel === 'global' ? globalMessages : classMessages).map(m => (
                  <div key={m.id} className="flex gap-3 text-xs items-start">
                    <span className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700/50 flex items-center justify-center text-sm shrink-0 shadow-md">
                      {m.avatar}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${m.role === 'teacher' ? 'text-[#00d4aa]' : 'text-slate-200'}`}>
                          {m.sender}
                        </span>
                        {m.role === 'teacher' && (
                          <span className="text-[8px] bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                            GV
                          </span>
                        )}
                        <span className="text-[9px] text-gray-500 font-medium ml-auto">{m.time}</span>
                      </div>
                      <p className="text-gray-300 mt-1 leading-relaxed bg-[#141523]/60 p-2.5 rounded-2xl rounded-tl-none border border-white/5">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-800 bg-[#11121d] shrink-0">
                <div className="flex items-center gap-2 bg-[#0c0c16] border border-gray-800 focus-within:border-[#00d4aa] rounded-2xl p-1.5 pl-3 transition-colors">
                  <input 
                    type="text" 
                    placeholder={chatChannel === 'global' ? "Chat chung với học viên toàn quốc..." : "Nhắn tin cho bạn bè trong lớp..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-500"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="p-2 bg-[#00d4aa] text-black rounded-xl hover:scale-105 transition-transform"
                  >
                    <Send size={12} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>

            {/* Anchored Micro AI Assistant (Locked Tiny Chatbot) */}
            <div className="bg-[#11121d]/90 border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-[230px] group">
              
              {/* Tech Corner Pins */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#00d4aa]/30 group-hover:border-[#00d4aa]/80 transition-colors" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#00d4aa]/30 group-hover:border-[#00d4aa]/80 transition-colors" />
              
              {/* Header Info */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00d4aa]/10 border border-[#00d4aa]/25 text-[#00d4aa] rounded-lg animate-pulse">
                    <Cpu size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                      MICRO AI GURU
                      <Sparkles size={10} className="text-yellow-400" />
                    </h4>
                    <p className="text-[9px] text-[#00d4aa] uppercase font-bold tracking-widest">Đang khóa song song</p>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-ping" />
              </div>

              {/* Quick AI Response Window */}
              <div className="flex-1 overflow-y-auto my-3 p-3 bg-[#0c0c16]/50 rounded-xl border border-white/5 space-y-2 text-[11px] leading-relaxed">
                {aiReplies.map((r, i) => (
                  <div key={i} className={`p-2 rounded-lg ${r.startsWith('AI Guru:') ? 'bg-[#00d4aa]/5 text-slate-300 border-l-2 border-[#00d4aa]' : 'bg-[#181926] text-slate-200 border-l-2 border-slate-600'}`}>
                    {r}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-1 text-slate-400 italic text-[10px]">
                    <Loader2 className="animate-spin text-[#00d4aa]" size={10} /> AI Guru đang tính toán cấu hình...
                  </div>
                )}
              </div>

              {/* Mini AI Input */}
              <div className="flex items-center gap-2 bg-[#0c0c16] border border-gray-800 focus-within:border-[#00d4aa] rounded-xl p-1.5 pl-3 transition-colors shrink-0">
                <input 
                  type="text" 
                  placeholder="Hỏi nhanh AI về socket, vga, psu..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                  className="flex-1 bg-transparent border-none outline-none text-[10px] text-white placeholder-gray-500"
                />
                <button 
                  onClick={handleSendAi}
                  className="p-1.5 bg-[#00d4aa] text-black rounded-lg hover:scale-105 transition-transform"
                >
                  <Bot size={10} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

