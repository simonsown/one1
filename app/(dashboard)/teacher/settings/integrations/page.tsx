'use client'

import React from 'react'
import { Link2, Layout, Settings, Mail, Bell, Shield, ChevronRight, CheckCircle2, Globe, Github, MessageCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function TeacherIntegrationsPage() {
  const integrations = [
    { name: 'Google Classroom', desc: 'Đồng bộ danh sách học sinh và bài tập từ Google.', status: 'connected', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-google-classroom-logo-icon-download-in-svg-png-gif-file-formats--brand-social-media-pack-logos-icons-1897727.png?f=webp&w=128' },
    { name: 'Microsoft Teams', desc: 'Gửi thông báo bài giảng trực tiếp qua Teams.', status: 'disconnected', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-microsoft-teams-logo-icon-download-in-svg-png-gif-file-formats--brand-social-media-pack-logos-icons-1897732.png?f=webp&w=128' },
    { name: 'Zoom Education', desc: 'Tổ chức các buổi dạy trực tuyến 3D.', status: 'disconnected', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-zoom-logo-icon-download-in-svg-png-gif-file-formats--brand-social-media-pack-logos-icons-1897746.png?f=webp&w=128' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Cài đặt <span className="text-[#00d2a0]">Tích hợp</span></h1>
          <p className="text-slate-400">Kết nối PC Master với các nền tảng giáo dục khác để tối ưu hóa quản lý.</p>
        </div>

        <div className="space-y-6">
          {integrations.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#16213e] border border-[#1e293b] rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-[#00d2a0]/30 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white p-3 shrink-0 flex items-center justify-center">
                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
              <div className="flex items-center gap-4">
                {item.status === 'connected' ? (
                  <span className="flex items-center gap-2 text-[#00d2a0] text-xs font-bold bg-[#00d2a0]/10 px-4 py-2 rounded-full border border-[#00d2a0]/20">
                    <CheckCircle2 size={14} /> CONNECTED
                  </span>
                ) : (
                  <button className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#2a3655] border border-[#2a3655] rounded-xl text-xs font-bold transition-all">
                    KẾT NỐI
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-[#00d2a0]/5 border border-[#00d2a0]/20 rounded-[32px]">
           <div className="flex items-center gap-3 mb-4 text-[#00d2a0]">
             <Shield size={20} />
             <h4 className="font-bold">Bảo mật dữ liệu</h4>
           </div>
           <p className="text-sm text-slate-400 leading-relaxed">
             Chúng tôi cam kết bảo mật 100% dữ liệu học sinh của bạn khi đồng bộ. Các tích hợp chỉ sử dụng quyền đọc danh sách lớp và không can thiệp vào các tài liệu cá nhân khác.
           </p>
        </div>
      </main>
    </div>
  )
}
