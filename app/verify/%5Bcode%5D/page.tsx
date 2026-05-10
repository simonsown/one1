'use client'

import React, { use } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Calendar, User, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const { code } = resolvedParams;

  // Mock data - In reality, fetch from Supabase based on 'code'
  const certData = {
    studentName: "Học Sinh Ưu Tú",
    courseName: "PC Master Builder - Kiến trúc máy tính hiện đại",
    score: 92,
    date: "10/05/2026",
    status: "Valid"
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d2a0] blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#16213e] rounded-[48px] border border-[#1e293b] p-10 md:p-16 shadow-2xl relative z-10 text-center"
      >
        <div className="w-24 h-24 bg-[#00d2a0]/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-[#00d2a0]/30 shadow-[0_0_50px_rgba(0,210,160,0.2)]">
           <ShieldCheck size={48} className="text-[#00d2a0]" />
        </div>

        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Xác thực chứng chỉ</h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00d2a0]/10 text-[#00d2a0] rounded-full text-xs font-black uppercase tracking-widest mb-12">
           <CheckCircle2 size={14} /> Trạng thái: Hợp lệ
        </div>

        <div className="space-y-6 text-left">
           {[
             { label: 'Học sinh', value: certData.studentName, icon: User },
             { label: 'Khóa học', value: certData.courseName, icon: BookOpen },
             { label: 'Ngày cấp', value: certData.date, icon: Calendar },
             { label: 'Mã chứng chỉ', value: code, icon: Award },
           ].map((item, i) => (
             <div key={i} className="flex items-start gap-4 p-5 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                <div className="p-3 bg-white/5 rounded-xl text-[#00d2a0]">
                   <item.icon size={20} />
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{item.label}</div>
                   <div className="text-lg font-bold text-white leading-tight">{item.value}</div>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
           <p className="text-slate-500 text-xs font-medium mb-6">
             Chứng chỉ này được cấp bởi hệ thống đào tạo **PC Master Builder**. 
             Mọi thông tin trên đây đã được xác thực thông qua mã hóa bảo mật.
           </p>
           <Link href="/" className="px-8 py-4 bg-[#16213e] hover:bg-[#1e293b] text-white font-black uppercase text-xs rounded-2xl transition-all inline-block border border-[#1e293b]">
             Quay về trang chủ
           </Link>
        </div>
      </motion.div>
      
      <div className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
        PC Master Builder © 2026 Academic Verification System
      </div>
    </div>
  )
}
