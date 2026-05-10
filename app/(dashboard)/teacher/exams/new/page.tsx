'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Trash2, Save, ArrowLeft, 
  HelpCircle, CheckCircle2, Layout, 
  Settings, Eye, Loader2, Sparkles,
  ChevronDown, ChevronUp, GripVertical
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 45,
    pass_score: 50,
    is_published: false
  })

  const [questions, setQuestions] = useState([
    {
      id: '1',
      type: 'multiple_choice',
      text: '',
      points: 10,
      options: [
        { id: 'a', text: '', is_correct: true },
        { id: 'b', text: '', is_correct: false },
        { id: 'c', text: '', is_correct: false },
        { id: 'd', text: '', is_correct: false },
      ]
    }
  ])

  const addQuestion = () => {
    const newId = (questions.length + 1).toString()
    setQuestions([...questions, {
      id: newId,
      type: 'multiple_choice',
      text: '',
      points: 10,
      options: [
        { id: 'a', text: '', is_correct: true },
        { id: 'b', text: '', is_correct: false },
        { id: 'c', text: '', is_correct: false },
        { id: 'd', text: '', is_correct: false },
      ]
    }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const updateOption = (qId: string, optId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(opt => opt.id === optId ? { ...opt, text } : opt)
        }
      }
      return q
    }))
  }

  const setCorrectOption = (qId: string, optId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(opt => ({ ...opt, is_correct: opt.id === optId }))
        }
      }
      return q
    }))
  }

  const handleSaveExam = async () => {
    if (!examData.title) {
      alert('Vui lòng nhập tiêu đề đề thi')
      return
    }
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Chưa đăng nhập')

      // 1. Lưu thông tin đề thi
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: examData.title,
          description: examData.description,
          duration: examData.duration,
          pass_score: examData.pass_score,
          teacher_id: user.id,
          is_published: examData.is_published
        })
        .select()
        .single()

      if (examError) throw examError

      // 2. Lưu danh sách câu hỏi
      const questionsToInsert = questions.map((q, idx) => ({
        exam_id: exam.id,
        text: q.text,
        type: q.type,
        points: q.points,
        options: q.options,
        order_index: idx
      }))

      const { error: qError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (qError) throw qError

      alert('Đã tạo đề thi thành công!')
      router.push('/teacher/exams')
    } catch (error: any) {
      alert('Lỗi khi lưu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6 md:p-12">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/teacher/exams" className="p-3 bg-[#16213e] rounded-2xl border border-[#1e293b] hover:border-[#00d2a0] transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Thiết kế <span className="text-[#00d2a0]">Đề thi</span></h1>
            <p className="text-slate-400 text-sm">Xây dựng bài kiểm tra trắc nghiệm và thực hành.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSaveExam}
            disabled={loading}
            className="px-8 py-3 bg-[#00d2a0] text-black font-bold rounded-2xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,160,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Lưu đề thi
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Settings */}
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-[#16213e] border border-[#1e293b]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Settings size={18} className="text-[#00d2a0]" /> Cấu hình chung
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-2 block tracking-widest">Tiêu đề đề thi</label>
                <input 
                  type="text" 
                  value={examData.title}
                  onChange={(e) => setExamData({...examData, title: e.target.value})}
                  className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl px-4 py-3 focus:border-[#00d2a0] outline-none"
                  placeholder="Ví dụ: Kiểm tra 15p - Kiến thức CPU"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-2 block tracking-widest">Thời gian (phút)</label>
                <input 
                  type="number" 
                  value={examData.duration}
                  onChange={(e) => setExamData({...examData, duration: parseInt(e.target.value)})}
                  className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl px-4 py-3 focus:border-[#00d2a0] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase mb-2 block tracking-widest">Điểm đạt (%)</label>
                <input 
                  type="number" 
                  value={examData.pass_score}
                  onChange={(e) => setExamData({...examData, pass_score: parseInt(e.target.value)})}
                  className="w-full bg-[#0f0f1a] border border-[#1e293b] rounded-xl px-4 py-3 focus:border-[#00d2a0] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Editor */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {questions.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-[40px] bg-[#16213e] border border-[#1e293b] relative group"
              >
                <div className="absolute -left-3 top-10 w-8 h-8 rounded-full bg-[#0f0f1a] border border-[#1e293b] flex items-center justify-center text-xs font-bold text-[#00d2a0]">
                  {idx + 1}
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <textarea 
                      placeholder="Nhập nội dung câu hỏi..."
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      className="w-full bg-transparent text-xl font-bold border-none outline-none resize-none placeholder:text-slate-700"
                      rows={2}
                    />
                  </div>
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt) => (
                    <div key={opt.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${opt.is_correct ? 'bg-[#00d2a0]/10 border-[#00d2a0]/40' : 'bg-[#0f0f1a] border-[#1e293b]'}`}>
                      <button 
                        onClick={() => setCorrectOption(q.id, opt.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${opt.is_correct ? 'border-[#00d2a0] bg-[#00d2a0]' : 'border-slate-700'}`}
                      >
                        {opt.is_correct && <CheckCircle2 size={14} className="text-black" />}
                      </button>
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                        placeholder={`Đáp án ${opt.id.toUpperCase()}`}
                        className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Layout size={14} /> Trắc nghiệm
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} /> 10 Điểm
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={addQuestion}
            className="w-full py-8 rounded-[40px] border-2 border-dashed border-[#1e293b] text-slate-500 hover:text-[#00d2a0] hover:border-[#00d2a0] transition-all flex flex-col items-center gap-4 group"
          >
            <div className="p-4 bg-[#16213e] rounded-2xl group-hover:bg-[#00d2a0] group-hover:text-black transition-all">
              <Plus size={32} />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm">Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>
    </div>
  )
}
