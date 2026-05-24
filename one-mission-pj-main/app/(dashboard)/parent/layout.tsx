import { requireRole } from '@/lib/auth/rbac'
import ParentSidebar from '@/components/parent/ParentSidebar'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  // Bảo vệ toàn bộ /parent/* — chỉ parent và admin
  await requireRole(['parent', 'admin'])

  return (
    <div className="flex h-screen bg-[#0b0c11]">
      <ParentSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
