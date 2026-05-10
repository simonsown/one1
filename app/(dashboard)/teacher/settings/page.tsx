'use client'

import React from 'react'
import { Settings, Shield, Bell, Database, Lock, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TeacherSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/teacher" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
           <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black">Cấu hình <span className="text-[#06b6d4]">Hệ thống</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-3 bg-[#06b6d4]/10 text-[#06b6d4] rounded-xl font-bold text-sm text-left">
            <Settings size={18} /> Chung
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white/5 text-slate-400 rounded-xl font-bold text-sm text-left transition-all">
            <Shield size={18} /> Bảo mật
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white/5 text-slate-400 rounded-xl font-bold text-sm text-left transition-all">
            <Bell size={18} /> Thông báo
          </button>
        </aside>

        <main className="md:col-span-2 space-y-6">
          <section className="bg-[#16213e] border border-[#1e293b] rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database size={20} className="text-[#06b6d4]" /> Dữ liệu học tập
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên nền tảng</label>
                <input type="text" defaultValue="PC Master Builder LMS" className="w-full bg-transparent border-none outline-none text-white font-bold" />
              </div>

              <div className="p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mã trường học</label>
                <input type="text" defaultValue="NCT-LMS-2024" className="w-full bg-transparent border-none outline-none text-white font-bold uppercase" />
              </div>
            </div>
          </section>

          <section className="bg-[#16213e] border border-[#1e293b] rounded-3xl p-8 space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2">
              <Lock size={20} className="text-orange-500" /> Quyền truy cập
            </h3>
            <p className="text-slate-400 text-sm">Các cấu hình nâng cao về bảo mật và hệ thống đang được thiết lập bởi đội ngũ kỹ thuật.</p>
          </section>

          <button className="flex items-center gap-2 px-8 py-4 bg-[#06b6d4] text-white font-black rounded-2xl shadow-lg shadow-[#06b6d4]/20 hover:scale-[1.02] transition-all">
            <Save size={20} /> LƯU THAY ĐỔI
          </button>
        </main>
      </div>
    </div>
  )
}
