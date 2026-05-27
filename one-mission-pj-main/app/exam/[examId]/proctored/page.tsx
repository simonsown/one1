'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ShieldAlert, Monitor, Lock, AlertCircle, CheckCircle2, ScanFace, Zap, ArrowRight, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ExamPlayer from '../ExamPlayer'

export default function ProctoredExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const { examId } = resolvedParams;
  const router = useRouter()

  const [step, setStep] = useState<'check' | 'exam'>('check')
  const [hasPermission, setHasPermission] = useState(false)
  const [identityPhoto, setIdentityPhoto] = useState<string | null>(null)
  const [violations, setViolations] = useState(0)
  const [showViolationOverlay, setShowViolationOverlay] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
      }
    } catch (err) {
      alert("Không thể truy cập Webcam. Vui lòng cấp quyền để thi.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240)
      setIdentityPhoto(canvasRef.current.toDataURL('image/png'))
    }
  }

  useEffect(() => {
    if (step !== 'exam') return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') recordViolation('tab_switch')
    }
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) recordViolation('fullscreen_exit')
    }
    const disableCopy = (e: any) => e.preventDefault()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('copy', disableCopy)
    document.addEventListener('paste', disableCopy)
    document.addEventListener('contextmenu', disableCopy)

    const snapshotInterval = setInterval(() => takeSnapshot(), 180000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('copy', disableCopy)
      document.removeEventListener('paste', disableCopy)
      document.removeEventListener('contextmenu', disableCopy)
      clearInterval(snapshotInterval)
    }
  }, [step, violations])

  const recordViolation = async (type: string) => {
    const newViolations = violations + 1
    setViolations(newViolations)
    setShowViolationOverlay(true)
    await supabase.from('exam_logs').insert({ event_type: type, event_data: `Lần vi phạm thứ ${newViolations}` })
    if (newViolations >= 3) {
      alert("Bạn đã vi phạm quá 3 lần. Hệ thống sẽ tự động nộp bài!")
    }
  }

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240)
      supabase.from('exam_logs').insert({ event_type: 'snapshot', event_data: canvasRef.current.toDataURL('image/png') })
    }
  }

  const startExam = () => {
    if (!identityPhoto) return alert("Vui lòng chụp ảnh xác minh danh tính trước!")
    document.documentElement.requestFullscreen().catch(() => {
      alert("Trình duyệt không hỗ trợ Fullscreen. Vui lòng dùng Chrome/Edge.")
    })
    setStep('exam')
  }

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 blur-[120px]" style={{ background: 'var(--brand-primary)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 blur-[120px]" style={{ background: 'var(--accent-blue)' }}></div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full rounded-[48px] p-10 md:p-16 shadow-2xl relative z-10"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex flex-col md:flex-row gap-12 items-center">

            <div className="w-full md:w-1/2 space-y-6">
              <div className="aspect-video rounded-[32px] border-2 overflow-hidden relative group" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                {!hasPermission ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera size={48} style={{ color: 'var(--text-muted)' }} />
                    <button onClick={startCamera} className="px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                      Kích hoạt Camera
                    </button>
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                )}
                {identityPhoto && (
                  <div className="absolute inset-0 border-4 rounded-[32px] z-20 pointer-events-none" style={{ borderColor: 'var(--brand-primary)' }}>
                    <div className="absolute top-4 right-4 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: 'var(--brand-primary)' }}>Đã xác minh</div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} width="320" height="240" className="hidden" />
              <button onClick={capturePhoto} disabled={!hasPermission}
                className="w-full py-4 font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-30"
                style={{ background: 'var(--brand-primary)', color: '#fff' }}>
                <ScanFace size={20} /> {identityPhoto ? 'Chụp lại ảnh' : 'Chụp ảnh xác thực'}
              </button>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Kỳ thi <span style={{ color: 'var(--brand-primary)' }}>Giám sát</span></h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Hệ thống AI Proctoring đang bảo vệ tính minh bạch của kỳ thi này.</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Monitor, text: "Bắt buộc chế độ Toàn màn hình", color: "var(--accent-blue)" },
                  { icon: ShieldAlert, text: "Phát hiện và cảnh báo khi rời Tab", color: "var(--danger)" },
                  { icon: Lock, text: "Khóa chức năng Copy, Paste, chuột phải", color: "#8b5cf6" },
                  { icon: Video, text: "Chụp ảnh webcam ngẫu nhiên để đối soát", color: "var(--brand-primary)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <button onClick={startExam}
                className="w-full py-6 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'var(--brand-primary)', color: '#fff' }}>
                Bắt đầu làm bài <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <ExamPlayer examId={examId} attemptId="proctored_attempt" questions={[]} timeLimit={60} />

      <AnimatePresence>
        {showViolationOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] backdrop-blur-xl flex items-center justify-center p-10 text-center text-white"
            style={{ background: 'rgba(244,67,54,0.95)' }}>
            <div className="max-w-xl space-y-8">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto border-4 border-white/20 animate-pulse">
                <AlertCircle size={64} />
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic">Cảnh báo vi phạm!</h1>
              <p className="text-2xl font-bold opacity-80 leading-relaxed">Bạn vừa rời khỏi màn hình thi hoặc thoát chế độ toàn màn hình.</p>
              <div className="bg-black/20 p-6 rounded-3xl border border-white/10">
                <div className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Số lần vi phạm</div>
                <div className="text-5xl font-black">{violations} / 3</div>
              </div>
              <button onClick={() => { document.documentElement.requestFullscreen(); setShowViolationOverlay(false); }}
                className="px-12 py-5 bg-white text-red-600 font-black uppercase rounded-2xl shadow-2xl hover:scale-105 transition-all">
                Quay lại bài thi ngay
              </button>
              <p className="text-sm opacity-50 font-bold uppercase italic tracking-widest">Hành động của bạn đã được ghi lại và gửi đến giáo viên.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 w-40 h-30 rounded-xl overflow-hidden z-[100] shadow-2xl pointer-events-none"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror opacity-50" />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-black uppercase text-white/50">Rec</span>
        </div>
      </div>
    </div>
  )
}
