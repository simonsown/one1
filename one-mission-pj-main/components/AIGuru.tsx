'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Cpu } from 'lucide-react'

export default function AIGuru({ message, trigger, lang = 'vn' }: { message?: string, trigger?: number, lang?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', content: lang === 'vn' ? 'Chào bạn! Tôi là AI Guru, chuyên gia phần cứng của bạn. Hôm nay bạn cần tôi giúp gì về lắp ráp PC?' : 'Hello! I am AI Guru, your hardware expert. How can I help you with PC building today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
        signal: controller.signal
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, { role: 'bot', content: data?.error || 'Xin lỗi, tôi gặp sự cố kết nối.' }])
        setIsTyping(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let botReply = ''
      setMessages(prev => [...prev, { role: 'bot', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())
        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.done) break
            if (json.text) {
              botReply += json.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'bot', content: botReply }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'bot', content: 'Xin lỗi, tôi gặp sự cố kết nối.' }])
      }
    } finally {
      setIsTyping(false)
    }
  }

  const styles = {
    brand: 'var(--brand-primary)',
    surface: 'var(--bg-surface)',
    base: 'var(--bg-base)',
    elevated: 'var(--bg-elevated)',
    text: 'var(--text-primary)',
    muted: 'var(--text-muted)',
    border: 'var(--border-default)',
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 shadow-lg rounded-full flex items-center justify-center z-[1000] hover:scale-110 transition-all duration-300 group"
        style={{
          background: `linear-gradient(135deg, ${styles.brand}, var(--accent-blue))`,
          color: '#fff',
          boxShadow: `0 0 25px color-mix(in srgb, ${styles.brand} 50%, transparent)`,
        }}
      >
        <div className="absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity" style={{ background: `linear-gradient(135deg, ${styles.brand}, var(--accent-blue))` }} />
        <Cpu size={22} className="relative z-10" />
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md relative z-20" style={{ background: 'var(--bg-base)', border: `2px solid ${styles.brand}` }}>
          <Sparkles size={10} style={{ color: styles.brand }} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-8 w-[calc(100vw-40px)] max-w-[340px] shadow-2xl z-[1000] overflow-hidden flex flex-col"
            style={{ height: '460px', borderRadius: '20px', background: styles.surface, border: `1px solid ${styles.border}` }}
          >
            <div className="flex items-center justify-between" style={{ padding: '16px 20px', background: styles.elevated, borderBottom: `1px solid ${styles.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: styles.brand, color: '#fff' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: styles.text }}>AI Guru Assistant</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: styles.brand }}>Đang trực tuyến</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ padding: '6px', background: 'transparent', border: 'none', color: styles.muted, cursor: 'pointer', borderRadius: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: styles.base }}>
              {messages.map((m, i) => (
                <div key={i} className="flex" style={{ justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.6,
                    background: m.role === 'user' ? styles.brand : styles.elevated,
                    color: m.role === 'user' ? '#fff' : styles.text,
                    borderTopLeftRadius: m.role === 'user' ? '16px' : '4px',
                    borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 p-3 rounded-2xl" style={{ background: styles.elevated, borderTopLeftRadius: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        style={{ width: '8px', height: '8px', borderRadius: '50%', background: styles.muted }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div style={{ padding: '12px 16px', background: styles.elevated, borderTop: `1px solid ${styles.border}` }}>
              <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: styles.base, border: `1px solid ${styles.border}` }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi AI Guru điều gì đó..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ padding: '8px 12px', color: styles.text, fontFamily: 'inherit' }}
                />
                <button 
                  onClick={handleSend}
                  className="rounded-xl hover:scale-105 transition-transform"
                  style={{ padding: '10px', background: styles.brand, color: '#fff', border: 'none', cursor: 'pointer' }}
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
