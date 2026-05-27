'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6 text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#16213e] border border-[#1e293b] p-10 rounded-2xl text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#00d2a0]/10 text-[#00d2a0] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Kiểm tra Email</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <span className="text-white font-medium">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-[#00d2a0] font-medium hover:underline">
            <ArrowLeft size={18} /> Quay lại Đăng nhập
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#16213e] border border-[#1e293b] p-8 md:p-10 rounded-2xl shadow-2xl"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Quay lại Đăng nhập</span>
        </Link>

        <h2 className="text-2xl font-bold mb-2">Quên mật khẩu? 🔒</h2>
        <p className="text-slate-400 mb-8">Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#00d2a0] transition-all"
              placeholder="Email của bạn"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00d2a0] hover:bg-[#00e6af] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,210,160,0.2)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Gửi link đặt lại'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
