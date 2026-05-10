'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Download, Share2, ShieldCheck, ExternalLink, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Link from 'next/link'

interface CertificateProps {
  studentName: string;
  courseName: string;
  score: number;
  date: string;
  certCode: string;
}

export default function MyCertificatesPage() {
  const [certs, setCerts] = useState<CertificateProps[]>([
    {
      studentName: "Học Sinh Ưu Tú",
      courseName: "PC Master Builder - Kiến trúc máy tính hiện đại",
      score: 92,
      date: "10/05/2026",
      certCode: "PC-2026-X789Y"
    }
  ])

  const [selectedCert, setSelectedCert] = useState<CertificateProps | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-[#0f0f1a] min-h-screen text-white">
      <header className="mb-12">
        <h1 className="text-4xl font-black mb-2">Chứng chỉ <span className="text-[#00d2a0]">Của tôi</span></h1>
        <p className="text-slate-400">Danh sách các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Certificate List */}
        <div className="space-y-6">
          {certs.map((cert, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedCert(cert)}
              className={`p-6 rounded-[32px] border cursor-pointer transition-all flex items-center justify-between group
                ${selectedCert?.certCode === cert.certCode ? 'bg-[#16213e] border-[#00d2a0]' : 'bg-[#16213e]/40 border-[#1e293b] hover:border-slate-500'}
              `}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#00d2a0]/10 flex items-center justify-center text-[#00d2a0]">
                   <Trophy size={32} />
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-1 group-hover:text-[#00d2a0] transition-colors">{cert.courseName}</h3>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cấp ngày: {cert.date}</div>
                </div>
              </div>
              <ChevronRight className="text-slate-500 group-hover:text-white transition-all" />
            </motion.div>
          ))}
        </div>

        {/* Certificate Preview & Actions */}
        <div className="relative">
          {selectedCert ? (
            <div className="space-y-8 sticky top-10">
              <div className="flex gap-4">
                 <button onClick={() => downloadPDF()} className="flex-1 py-4 bg-[#00d2a0] text-black font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,210,160,0.3)] transition-all">
                    <Download size={18} /> Tải PDF
                 </button>
                 <button className="flex-1 py-4 bg-[#16213e] border border-[#1e293b] text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-all">
                    <Share2 size={18} /> Chia sẻ LinkedIn
                 </button>
              </div>

              {/* The Certificate Template */}
              <div id="certificate-template">
                <CertificateTemplate {...selectedCert} />
              </div>
              
              <div className="p-6 bg-[#00d2a0]/5 border border-[#00d2a0]/20 rounded-[32px] flex items-center gap-4">
                 <ShieldCheck className="text-[#00d2a0]" size={32} />
                 <div>
                    <div className="text-sm font-bold text-white">Chứng chỉ hợp lệ</div>
                    <div className="text-xs text-slate-500">Mã xác thực: {selectedCert.certCode}</div>
                 </div>
                 <Link href={`/verify/${selectedCert.certCode}`} className="ml-auto p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <ExternalLink size={20} />
                 </Link>
              </div>
            </div>
          ) : (
            <div className="h-[500px] border-2 border-dashed border-[#1e293b] rounded-[40px] flex flex-col items-center justify-center text-slate-600">
               <Trophy size={64} className="mb-4 opacity-20" />
               <p className="font-bold">Chọn một chứng chỉ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  async function downloadPDF() {
    const element = document.getElementById('certificate-template')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Certificate_${selectedCert?.certCode}.pdf`)
  }
}

function CertificateTemplate({ studentName, courseName, score, date, certCode }: CertificateProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    QRCode.toDataURL(`https://pcmaster.edu.vn/verify/${certCode}`, {
      margin: 1,
      width: 100,
      color: { dark: '#00d2a0', light: '#ffffff00' }
    }).then(setQrDataUrl)
  }, [certCode])

  return (
    <div className="w-full aspect-[1.414/1] bg-[#0f0f1a] rounded-xl border-[16px] border-[#16213e] p-12 relative overflow-hidden flex flex-col items-center justify-between text-center shadow-2xl">
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-40 h-40 border-t-8 border-l-8 border-[#00d2a0] opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 border-b-8 border-r-8 border-[#00d2a0] opacity-50"></div>
      
      {/* Circuit Pattern BG */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>

      <div className="z-10 w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
           <div className="w-12 h-12 bg-[#00d2a0] rounded-lg flex items-center justify-center text-black font-black text-xl">PC</div>
           <div className="text-2xl font-black tracking-tighter uppercase">Master Builder</div>
        </div>

        <h2 className="text-[#f59e0b] font-serif italic text-4xl mb-4">Chứng nhận Hoàn thành</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-12">Đây là để chứng nhận rằng</p>

        <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-tight">{studentName}</h1>
        
        <p className="text-slate-400 font-medium mb-2">Đã hoàn thành xuất sắc khóa học</p>
        <h3 className="text-2xl font-bold text-[#00d2a0] mb-8">{courseName}</h3>

        <div className="flex items-center justify-center gap-12 text-sm">
           <div className="text-center">
              <div className="text-slate-500 font-bold uppercase mb-1">Điểm đạt</div>
              <div className="text-xl font-black text-white">{score}/100</div>
           </div>
           <div className="w-[1px] h-10 bg-white/10"></div>
           <div className="text-center">
              <div className="text-slate-500 font-bold uppercase mb-1">Xếp loại</div>
              <div className="text-xl font-black text-white">Xuất sắc</div>
           </div>
        </div>
      </div>

      <div className="z-10 w-full flex items-end justify-between px-10">
         <div className="text-left space-y-2">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ngày cấp: {date}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mã số: {certCode}</div>
         </div>

         {/* Signature Placeholder */}
         <div className="text-center">
            <div className="font-serif italic text-2xl text-white mb-1">Anh Dev PC</div>
            <div className="w-40 h-[1px] bg-white/20 mx-auto mb-2"></div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Giám đốc học thuật</div>
         </div>

         {/* QR Code */}
         <div className="text-right">
            {qrDataUrl && <img src={qrDataUrl} alt="QR Verify" className="w-20 h-20 bg-white/5 p-1 rounded-lg" />}
            <div className="text-[8px] text-slate-600 font-bold uppercase mt-2">Quét để xác thực</div>
         </div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute top-1/2 left-20 text-[#00d2a0] opacity-20"><Zap size={40} /></div>
      <div className="absolute bottom-20 right-20 text-[#f59e0b] opacity-20"><Trophy size={60} /></div>
    </div>
  )
}

function ChevronRight({ className, size = 20 }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
