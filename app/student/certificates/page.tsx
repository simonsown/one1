'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { issueStudentCertificate } from '@/actions/certificates'
import { Award, FileText, CheckCircle, Copy, ExternalLink, RefreshCw, Lock, ShieldCheck, Target, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const CERTIFICATE_TYPES = [
  {
    id: 'cert_hardware_basics',
    title: 'Kỹ Sư Phần Cứng Tập Sự',
    description: 'Nắm vững kiến thức nền tảng về các linh kiện cấu thành máy tính cá nhân.',
    mission: 'Hoàn thành 3 bài học lý thuyết cơ bản và đạt tối thiểu 70% ở bài kiểm tra CPU.',
    icon: <ShieldCheck size={28} />
  },
  {
    id: 'cert_pc_master',
    title: 'Chuyên Gia Lắp Ráp PC Master',
    description: 'Chứng nhận khả năng lắp ráp, xử lý sự cố và tương thích linh kiện thực tế.',
    mission: 'Hoàn thành toàn bộ lộ trình học tập PC Master, bao gồm giả lập Lab 3D.',
    icon: <Award size={28} />
  },
  {
    id: 'cert_troubleshooting',
    title: 'Kỹ Thuật Viên Xử Lý Sự Cố',
    description: 'Chứng nhận kỹ năng chuẩn đoán và khắc phục các lỗi hệ thống phần cứng.',
    mission: 'Trả lời đúng liên tiếp 10 câu hỏi Khắc Phục Sự Cố trong Ngân hàng đề thi.',
    icon: <Target size={28} />
  }
]

export default function StudentCertificatesPage() {
  const router = useRouter()
  const [certs, setCerts] = useState<any[]>([])
  const [activePath, setActivePath] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Lấy chứng chỉ đã được cấp
    const { data: c } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', user.id)
      .eq('is_revoked', false)
    
    if (c) setCerts(c)

    // Lấy lộ trình hiện tại
    const { data: path } = await supabase
      .from('learning_paths')
      .select('id, title')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    
    if (path) setActivePath(path)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRequestCertificate = async () => {
    if (!activePath) return
    setIssuing(true)
    try {
      await issueStudentCertificate(activePath.id)
      toast.success('Chúc mừng! Bạn đã nhận chứng chỉ thành công.')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Chưa đủ điều kiện. Hãy hoàn thành các nhiệm vụ được giao.')
    } finally {
      setIssuing(false)
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast.success('Đã sao chép liên kết xác thực!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] text-gray-900 pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#089e60]" />
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đang tải chứng chỉ...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-900 pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* High-tech overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#089e60]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Title & Exit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#089e60]/10 border border-[#089e60]/25 text-[#089e60] rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 uppercase">Chứng chỉ & Danh hiệu</h1>
              <p className="text-xs text-gray-400 mt-0.5">Hoàn thành nhiệm vụ để thu thập các chứng chỉ danh giá</p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/student')}
            className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-xs font-bold text-slate-300 hover:text-gray-900 rounded-xl transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Dashboard
          </button>
        </div>

        <div className="grid gap-6">
          {CERTIFICATE_TYPES.map((certType) => {
            const earnedCert = certs.find(c => c.course_title === certType.title || c.certificate_number?.includes(certType.id))
            const isEarned = !!earnedCert

            return (
              <div 
                key={certType.id} 
                className={`bg-[#ffffff]/80 border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${isEarned ? 'border-[#089e60]/50' : 'border-[#e7e7e7]'}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${isEarned ? 'bg-[#089e60]' : 'bg-white'}`}></div>

                <div className="flex items-start gap-4 w-full md:w-auto flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 ${isEarned ? 'bg-[#089e60]/20 border border-[#089e60]/30 text-[#089e60] shadow-[0_0_15px_rgba(8,158,96,0.2)]' : 'bg-gray-1000 border border-gray-300 text-gray-500'}`}>
                    {certType.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-lg font-black uppercase ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>{certType.title}</h3>
                      {isEarned && <CheckCircle size={16} className="text-[#089e60]" />}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{certType.description}</p>
                    
                    <div className="bg-[#f5f6f8] p-3 rounded-xl border border-[#e7e7e7]">
                      <p className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5"><Target size={14} /> Nhiệm vụ cần đạt:</p>
                      <p className="text-xs text-gray-300">{certType.mission}</p>
                    </div>

                    {isEarned && (
                      <div className="mt-3 text-xs text-gray-500">
                        Mã xác thực: <strong className="text-gray-900 font-mono">{earnedCert.certificate_number}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 justify-end mt-4 md:mt-0">
                  {isEarned ? (
                    <>
                      {earnedCert.pdf_url && (
                        <a 
                          href={earnedCert.pdf_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 text-center md:w-44 px-4 py-2.5 bg-[#089e60] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,212,170,0.15)]"
                        >
                          <FileText size={14} /> Tải PDF
                        </a>
                      )}
                      <button 
                        onClick={() => handleCopyLink(earnedCert.verify_url)}
                        className="flex-1 md:w-44 px-4 py-2.5 bg-white hover:bg-gray-700 text-gray-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy size={14} /> Copy link xác thực
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleRequestCertificate}
                      disabled={issuing}
                      className="flex-1 md:w-44 px-4 py-2.5 bg-white text-gray-400 font-bold text-xs rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {issuing ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                      Yêu cầu kiểm tra
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
