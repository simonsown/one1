import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-ssr-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next param is for redirecting the user back to the originally requested page
  const next = searchParams.get('next') ?? '/builder'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Kiểm tra xem profile đã có role chưa (tức là đã đăng ký hoàn tất chưa)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (!profile || !profile.role) {
        // Chưa có role (lần đầu đăng nhập qua Google), chuyển hướng sang bước chọn Role
        return NextResponse.redirect(`${origin}/register?step=2&oauth=true`)
      }
      
      // Đã có role, chuyển hướng theo vai trò thực tế
      const userRole = profile.role
      let redirectPath = '/builder'
      if (userRole === 'teacher') {
        redirectPath = '/teacher'
      } else if (userRole === 'parent') {
        redirectPath = '/parent'
      }
      
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with provider`)
}
