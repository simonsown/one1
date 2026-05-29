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
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-[#089e60] to-[#289cf9] text-black shadow-[0_0_25px_rgba(8,158,96,0.5)] rounded-full flex items-center justify-center z-[1000] hover:scale-110 transition-all duration-300 group hover:shadow-[0_0_35px_rgba(8,158,96,0.8)]"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Glow pulsing ring */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#089e60] to-[#289cf9] rounded-full blur opacity-40 group-hover:opacity-75 group-hover:duration-200 animate-pulse" />
        
        {/* Glowing aura */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
        
        {/* Microchip/Bot icon */}
        <Cpu size={22} className="text-black relative z-10 animate-pulse" />

        {/* Floating tech badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border border-[#089e60] rounded-full flex items-center justify-center shadow-md animate-bounce relative z-20">
          <Sparkles size={10} className="text-[#089e60] animate-spin" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-8 w-[calc(100vw-40px)] max-w-[340px] bg-[#f5f6f8] border border-gray-200 rounded-3xl shadow-2xl z-[1000] overflow-hidden flex flex-col h-[420px]"
          >
            {/* Header */}
            <div className="p-4 bg-[#e7e7e7] flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#089e60] text-black rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">AI Guru Assistant</p>
                  <p className="text-[10px] text-[#089e60] font-bold uppercase tracking-widest">Đang trực tuyến</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8f9fa]/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-[#089e60] text-black font-medium rounded-tr-none' : 'bg-[#e7e7e7] text-slate-200 rounded-tl-none border border-[#e7e7e7]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#e7e7e7] p-4 rounded-2xl rounded-tl-none border border-[#e7e7e7] flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#e7e7e7]/50 border-t border-[#e7e7e7]">
              <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#e7e7e7] rounded-2xl p-2 pl-4">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi AI Guru điều gì đó..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                />
                <button 
                  onClick={handleSend}
                  className="p-2.5 bg-[#089e60] text-black rounded-xl hover:scale-105 transition-transform"
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
