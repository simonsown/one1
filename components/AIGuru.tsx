'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Cpu } from 'lucide-react'

export default function AIGuru({ message, trigger, lang = 'vn' }: { message?: string, trigger?: number, lang?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', content: lang === 'vn' ? 'Chào bạn! Tôi là AI Guru, chuyên gia phần cứng của bạn. Hôm nay bạn cần tôi giúp gì về lắp ráp PC?' : 'Hello! I am AI Guru, your hardware expert. How can I help you with PC building today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Handle external triggers
  useEffect(() => {
    if (message && trigger) {
      setMessages(prev => [...prev, { role: 'bot', content: message }])
      setIsOpen(true)
    }
  }, [message, trigger])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Call Real AI API
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      const botMsg = { role: 'bot', content: data.reply || 'Xin lỗi, tôi gặp sự cố kết nối.' }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-[#00d2a0] to-[#00b4d8] text-black shadow-[0_0_30px_rgba(0,210,160,0.5)] flex items-center justify-center z-[1000] hover:scale-110 hover:rotate-6 transition-all duration-300 group"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Microchip/Bot icon */}
        <Cpu size={24} className="animate-pulse text-black" />

        {/* Floating tech badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-[#00d2a0] rounded-full flex items-center justify-center shadow-md animate-bounce">
          <Sparkles size={10} className="text-[#00d2a0] animate-spin" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-28 right-8 w-full max-w-[400px] bg-[#16213e] border border-[#1e293b] rounded-3xl shadow-2xl z-[1000] overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-5 bg-[#1e293b] flex items-center justify-between border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00d2a0] text-black rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">AI Guru Assistant</p>
                  <p className="text-[10px] text-[#00d2a0] font-bold uppercase tracking-widest">Đang trực tuyến</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0f0f1a]/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-[#00d2a0] text-black font-medium rounded-tr-none' : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-[#1e293b]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1e293b] p-4 rounded-2xl rounded-tl-none border border-[#1e293b] flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#1e293b]/50 border-t border-[#1e293b]">
              <div className="flex items-center gap-2 bg-[#0f0f1a] border border-[#1e293b] rounded-2xl p-2 pl-4">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi AI Guru điều gì đó..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white"
                />
                <button 
                  onClick={handleSend}
                  className="p-2.5 bg-[#00d2a0] text-black rounded-xl hover:scale-105 transition-transform"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
