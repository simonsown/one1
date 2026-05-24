'use server'

import { verifyRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'

// Liên kết phụ huynh với học sinh qua student_id
export async function linkChildAction(studentId: string, relationship: string = 'parent') {
  const parent = await verifyRole(['parent', 'admin'])
  const supabase = await createClient()

  // Kiểm tra học sinh tồn tại và có role student
  const { data: student, error } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', studentId)
    .eq('role', 'student')  // Chỉ liên kết được với student
    .single()

  if (error || !student) throw new Error('Không tìm thấy học sinh')

  // Tạo liên kết
  const { error: linkError } = await supabase
    .from('parent_student_links')
    .upsert({
      parent_id: parent.id,
      student_id: studentId,
      relationship,
      status: 'active'
    }, { onConflict: 'parent_id,student_id' })

  if (linkError) throw new Error('Không thể liên kết tài khoản')

  // Gửi thông báo cho học sinh
  await supabase.from('notifications').insert({
    user_id: studentId,
    type: 'parent_link_request',
    title: 'Phụ huynh đang theo dõi bạn',
    body: 'Một phụ huynh đã liên kết tài khoản để theo dõi tiến độ học của bạn.',
    action_url: '/student/profile/privacy'
  })

  revalidatePath('/parent/dashboard')
  revalidatePath('/parent/children')
  return { success: true }
}

// Thu hồi quyền theo dõi (học sinh thực hiện)
export async function revokeParentLinkAction(parentId: string) {
  const student = await verifyRole(['student'])
  const supabase = await createClient()

  const { error } = await supabase
    .from('parent_student_links')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: student.id
    })
    .eq('parent_id', parentId)
    .eq('student_id', student.id)
    
  if (error) throw new Error('Không thể thu hồi quyền theo dõi: ' + error.message)
  revalidatePath('/student/profile/privacy')
}

// Tìm kiếm học sinh qua student_code
export async function findStudentByCodeAction(code: string) {
  await verifyRole(['parent', 'admin'])
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('find_student_by_code', { input_code: code.toUpperCase().trim() })

  if (error || !data || data.length === 0) {
    return { error: 'Không tìm thấy học sinh với mã này' }
  }
  return { student: data[0] }
}
