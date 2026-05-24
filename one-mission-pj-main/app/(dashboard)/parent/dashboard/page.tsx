import { requireRole } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase-ssr-server'
import { ChildCard } from '@/components/parent/ChildCard'
import { Sparkles, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentDashboardPage() {
  // 1. Xác thực và bảo vệ route
  const user = await requireRole(['parent', 'admin'])
  
  // 2. Fetch danh sách con đang theo dõi
  const supabase = await createClient()
  const { data: children, error } = await supabase
    .from('child_summary_for_parent')
    .select('*')
    .eq('parent_id', user.id)
    .order('last_active', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Lỗi fetch danh sách con:', error)
  }

  return (
    <div className="min-h-screen bg-[#0b0c11] text-[#dde0ed] p-6 md:p-8 max-w-6xl mx-auto">
      {/* GREETING */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#dde0ed] flex items-center gap-2">
            Xin chào, {user.full_name || 'Phụ huynh'} 👋
          </h1>
          <p className="text-[#636678] mt-1 text-sm md:text-base">
            Chào mừng bạn đến với Cổng thông tin Phụ huynh PC Master.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#111318] border border-white/5 rounded-xl px-4 py-3 self-start md:self-auto">
          <div className="w-10 h-10 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center text-[#00d4aa]">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-[#00d4aa]">{children?.length ?? 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#636678] font-bold">Học sinh theo dõi</div>
          </div>
        </div>
      </div>

      {/* CHILDREN KHÔNG CÓ → CTA LIÊN KẾT */}
      {(!children || children.length === 0) && (
        <div className="bg-[#111318] border border-dashed border-[#00d4aa]/20 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto my-12">
          <div className="text-5xl mb-5 animate-bounce">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold text-[#dde0ed] mb-2">
            Chưa liên kết tài khoản con
          </h3>
          <p className="text-[#636678] text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Liên kết tài khoản của con ngay bây giờ bằng mã học sinh (PCM-XXXXXXXX) để bắt đầu theo dõi chi tiết tiến độ học tập, luyện tập và làm quiz của con.
          </p>
          <a
            href="/parent/link-child"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/25 border border-[#00d4aa]/30 hover:border-[#00d4aa]/60 text-[#00d4aa] rounded-xl font-semibold text-sm transition-all duration-150 shadow-[0_0_15px_rgba(0,212,170,0.05)]"
          >
            <Sparkles size={16} />
            + Liên kết tài khoản con
          </a>
        </div>
      )}

      {/* DANH SÁCH CON — GRID CARDS */}
      {children && children.length > 0 && (
        <div>
          <div className="mb-4 text-xs font-bold text-[#636678] uppercase tracking-wider">
            Danh sách học sinh
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children.map((child) => (
              <ChildCard key={child.student_id} child={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
