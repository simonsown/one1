'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { issueStudentCertificate } from '@/actions/certificates'
import { Award, FileText, CheckCircle, Copy, Share2, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function StudentCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [activePath, setActivePath] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const supabase = createClientComponentClient()

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get issued certificates
    const { data: c } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', user.id)
      .eq('is_revoked', false)
    
    if (c) setCerts(c)

    // Get active learning path
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
      toast.error(err.message || 'Lỗi khi yêu cầu cấp chứng chỉ. Hãy hoàn thành hết lộ trình học.')
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
      <div className="min-h-screen bg-[#0d0e13] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#00d4aa]" />
        <span className="text-xs text-gray-500">Đang tải chứng chỉ của bạn...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0e13] text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-8">
          <Award size={32} className="text-[#00d4aa]" />
          <div>
            <h1 className="text-3xl font-bold">Chứng chỉ của tôi</h1>
            <p className="text-xs text-gray-400 mt-1">Chứng nhận hoàn thành và kết quả năng lực ráp PC</p>
          </div>
        </div>

        {certs.length === 0 ? (
          <div className="bg-[#1a1c25] border border-gray-800 rounded-2xl p-8 text-center space-y-6 shadow-xl">
            <div className="flex justify-center text-gray-600">
              <FileText size={48} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bạn chưa nhận chứng chỉ nào</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Khi hoàn thành toàn bộ các bài học trong lộ trình và các bài kiểm tra đạt điểm chuẩn, bạn có thể yêu cầu cấp chứng chỉ ngay lập tức.
              </p>
            </div>
            {activePath && (
              <button
                onClick={handleRequestCertificate}
                disabled={issuing}
                className="px-6 py-3 bg-[#00d4aa] text-[#0d0e13] font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
              >
                {issuing ? <RefreshCw size={16} className="animate-spin" /> : <Award size={16} />}
                Yêu cầu cấp chứng chỉ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {certs.map(cert => (
              <div key={cert.id} className="bg-[#1a1c25] border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                
                {/* Visual Certificate Decoration Left side */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#00d4aa]"></div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center flex-shrink-0 mt-1">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{cert.course_title}</h3>
                    <p className="text-xs text-gray-400">
                      Mã chứng chỉ: <strong className="text-white font-mono">{cert.certificate_number}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ngày cấp: {cert.completion_date} · Kết quả: {cert.final_score}%
                    </p>
                  </div>
                </div>

                {/* Actions Right Side */}
                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                  {cert.pdf_url && (
                    <a 
                      href={cert.pdf_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 text-center md:w-44 px-4 py-2.5 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,212,170,0.15)]"
                    >
                      <FileText size={14} /> Tải PDF
                    </a>
                  )}

                  <button 
                    onClick={() => handleCopyLink(cert.verify_url)}
                    className="flex-1 md:w-44 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> Sao chép link xác thực
                  </button>

                  <a 
                    href={cert.verify_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                    title="Xem chi tiết trang xác thực"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
