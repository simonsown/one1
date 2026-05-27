import { createClient } from '@/lib/supabase-ssr-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // Kiểm tra profile đã có chưa (lần đầu đăng nhập Google)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Nếu chưa có profile hoặc chưa chọn vai trò → redirect onboarding
      if (!profile || !profile.role) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      // Redirect theo role (đối với học sinh sẽ về /builder như yêu cầu)
      const dashboardUrl = {
        teacher: '/teacher',
        admin: '/admin',
        parent: '/parent',
        student: '/builder',
      }[profile.role as 'teacher' | 'admin' | 'parent' | 'student'] ?? '/builder'

      return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin))
}
