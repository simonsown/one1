"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ParentChildPage() {
  const { studentId } = useParams()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single()
        if (error) throw error
        setStudent(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (studentId) fetchStudent()
  }, [studentId])

  if (loading) return <div className="min-h-[300px] flex items-center justify-center">Đang tải...</div>
  if (!student) return <div className="p-6">Không tìm thấy học sinh.</div>

  return (
    <div>
      <Navbar />
      <div className="bg-[#16213e] rounded-2xl border border-[#1e293b] p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{student.full_name}</h2>
            <p className="text-sm text-slate-400">Mã: {student.username || student.id}</p>
          </div>
          <Link href="/parent/children" className="text-sm text-[#00d2a0]">Quay lại danh sách</Link>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#0f1720] rounded-2xl p-4"> 
          <h3 className="font-bold mb-2">Hoạt động gần đây</h3>
          <p className="text-sm text-slate-400">(Hiển thị tóm tắt hoạt động của học sinh.)</p>
        </div>
        <div className="bg-[#0f1720] rounded-2xl p-4">
          <h3 className="font-bold mb-2">Thông tin</h3>
          <p className="text-sm text-slate-400">Trường: {student.school_name || 'Chưa cập nhật'}</p>
        </div>
      </div>
    </div>
  )
}
