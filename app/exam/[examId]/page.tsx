import { createClient } from '@/lib/supabase-ssr-server'
import { redirect } from 'next/navigation'
import ExamPlayer from './ExamPlayer'
import { startExamAttempt } from '@/lib/exam-actions'

export default async function ExamPage({ params }: { params: { examId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Khởi tạo phiên thi (Attempt)
  const res = await startExamAttempt(params.examId)
  if (res.error) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">Lỗi: {res.error}</div>
  }

  // 2. Mock Questions (Dựa theo Mega Prompt)
  const dummyQuestions: any = [
    {
      id: 'q1',
      text: "CPU được ví như bộ phận nào của con người?",
      type: 'single',
      options: [
        { id: 'A', text: "Trái tim" },
        { id: 'B', text: "Bộ não" },
        { id: 'C', text: "Đôi mắt" },
        { id: 'D', text: "Bàn tay" }
      ]
    },
    {
      id: 'q2',
      text: "RAM là bộ nhớ chỉ đọc, không bị mất dữ liệu khi mất điện.",
      type: 'boolean'
    },
    {
      id: 'q3',
      text: "Bộ phận nào dùng để lưu trữ dữ liệu lâu dài?",
      type: 'fill'
    },
    {
      id: 'q4',
      text: "Hãy trình bày ngắn gọn tầm quan trọng của bộ nguồn (PSU) trong máy tính.",
      type: 'essay'
    }
  ]

  return (
    <ExamPlayer 
      examId={params.examId} 
      attemptId={res.attemptId} 
      questions={dummyQuestions} 
      timeLimit={30} 
    />
  )
}
