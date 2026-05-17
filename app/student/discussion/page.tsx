'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Thread } from '@/hooks/useDiscussion'
import { ThreadCard } from '@/components/discussion/ThreadCard'
import { ThreadDetail } from '@/components/discussion/ThreadDetail'
import { MessageSquare, RefreshCw, Send, Bot, Sparkles, Globe, School, Loader2, Cpu, User } from 'lucide-react'

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  role: 'student' | 'teacher' | 'assistant';
  content: string;
  time: string;
}

export default function DiscussionDashboardPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Realtime Chat States
  const [chatChannel, setChatChannel] = useState<'global' | 'class'>('global')
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([
    { id: 'g1', sender: 'Đức Huy', avatar: '🎯', role: 'student', content: 'Cấu hình i5-12400F đi với RTX 3060 thì dùng nguồn bao nhiêu W vậy mọi người?', time: '14:20' },
    { id: 'g2', sender: 'Khánh Vy', avatar: '⭐', role: 'student', content: 'Tầm 600W hoặc 650W Plus Bronze là dư xăng nâng cấp sau này rồi bạn ơi.', time: '14:22' },
    { id: 'g3', sender: 'Thầy Hùng', avatar: '👨‍🏫', role: 'teacher', content: 'Đúng rồi đó Vy, chú ý chọn các hãng uy tín như MSI, Corsair nhé.', time: '14:25' }
  ])
  const [classMessages, setClassMessages] = useState<ChatMessage[]>([
    { id: 'c1', sender: 'Tuấn Nam', avatar: '⚡', role: 'student', content: 'Mọi người đã làm xong bài thực hành lắp ráp bo mạch chủ chưa?', time: '13:05' },
    { id: 'c2', sender: 'Phương Vy', avatar: '🌸', role: 'student', content: 'Tớ vừa đạt 100 điểm quiz xong nè, được nhận huy hiệu "Xuất sắc" luôn!', time: '13:10' }
  ])
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

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [globalMessages, classMessages])

  // Handle Send Chat
  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: userProfile?.full_name || 'Học viên',
      avatar: '💻',
      role: 'student',
      content: chatInput,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    if (chatChannel === 'global') {
      setGlobalMessages(prev => [...prev, newMsg])
    } else {
      setClassMessages(prev => [...prev, newMsg])
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
      <div className="min-h-screen bg-[#0a0a14] text-white pt-24 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#00d4aa]" size={32} />
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang kết nối diễn đàn...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative High-Tech Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Workspace Title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <MessageSquare size={32} className="text-[#00d4aa]" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">KHÔNG GIAN THẢO LUẬN 3D</h1>
              <p className="text-xs text-gray-400 mt-1">Nơi trao đổi kiến thức phần cứng máy tính thời gian thực</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#11121d] border border-gray-800 rounded-full px-4 py-1.5 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
            Lớp {userProfile?.grade || 'PC Master'}
          </div>
        </div>

        {/* Workspace Layout: Left (Discussions) & Right (Realtime Chat + Micro AI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (60%): Forums/Threads */}
          <div className="lg:col-span-7 space-y-6">
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
          <div className="lg:col-span-5 flex flex-col gap-6">
            
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
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  Live Chat
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
