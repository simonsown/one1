import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import { User, ShieldCheck, HelpCircle, Mail, Key } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentProfilePage() {
  const user = await requireRole(['parent', 'admin'])
  const supabase = await createClient()

  // Lấy email từ auth
  const { data: authData } = await supabase.auth.getUser()
  const email = authData.user?.email || 'Chưa cập nhật'

  // Fetch số lượng con đang liên kết
  const { count } = await supabase
    .from('parent_student_links')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', user.id)
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-[#0b0c11] text-[#dde0ed] p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#dde0ed] flex items-center gap-2">
          <User size={24} className="text-[#00d4aa]" />
          Hồ sơ của bạn
        </h1>
        <p className="text-[#636678] mt-1 text-sm">
          Thông tin tài khoản phụ huynh và cấu hình hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1f2130] flex items-center justify-center text-3xl font-bold text-[#00d4aa] border border-white/5 uppercase">
              {user.full_name?.[0] || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dde0ed]">{user.full_name || 'Phụ huynh'}</h2>
              <div className="text-xs text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/20 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1 font-bold">
                Phụ huynh
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#636678] font-medium flex items-center gap-2">
                <Mail size={16} />
                Email đăng nhập
              </span>
              <span className="text-[#dde0ed] font-semibold">{email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#636678] font-medium flex items-center gap-2">
                <ShieldCheck size={16} />
                Số lượng con liên kết
              </span>
              <span className="text-[#dde0ed] font-semibold">{count || 0} học sinh</span>
            </div>
          </div>
        </div>

        {/* Security Policy Details */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#dde0ed] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#00d4aa]" />
            Bảo mật & Quyền riêng tư
          </h3>
          <p className="text-xs text-[#636678] leading-relaxed">
            Để tạo môi trường học tập thoải mái, PC Master áp dụng chính sách bảo mật thông tin nghiêm ngặt:
          </p>
          <ul className="text-xs text-[#636678] space-y-2 list-disc pl-4 leading-relaxed">
            <li>Phụ huynh <span className="text-[#dde0ed]">chỉ được xem</span> tiến độ %, streak, giờ học, và kết quả kiểm tra quiz tổng quát của con.</li>
            <li>Phụ huynh <span className="text-red-400">không thể xem</span> chi tiết các câu trả lời cụ thể trong bài làm hoặc can thiệp bài học của con.</li>
            <li>Học sinh có quyền thu hồi quyền theo dõi của phụ huynh bất cứ lúc nào trong trang cá nhân của mình.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
