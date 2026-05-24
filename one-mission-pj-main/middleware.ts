import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ═══ ROUTE PERMISSIONS MAP ═══
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin':   ['admin'],
  '/teacher': ['teacher', 'admin'],
  '/student': ['student', 'teacher', 'admin'],  // teacher có thể preview
  '/parent':  ['parent', 'admin'],
  '/builder': ['student', 'teacher', 'admin'],
  '/profile': ['student', 'teacher', 'admin', 'parent'],
  '/notifications': ['student', 'teacher', 'admin', 'parent'],
}

// ═══ PUBLIC ROUTES (no auth required) ═══
const PUBLIC_ROUTES = [
  '/', 
  '/login', 
  '/login/qr', 
  '/register', 
  '/about',
  '/forgot-password', 
  '/reset-password', 
  '/verify-email',
  '/verify'
]  // /verify/[cert-code] — public certificate verify

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // 1. Tạo Supabase client với cookies (server-side ONLY)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. Refresh session (QUAN TRỌNG: bắt buộc trên mọi request)
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()  // ← dùng getUser, không dùng getSession

  // 3. Kiểm tra public route
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  
  if (isPublicRoute) {
    // Nếu đã đăng nhập và vào /login hoặc /register → redirect về dashboard
    if (user && (pathname === '/login' || pathname === '/register')) {
      const profile = await getUserProfile(supabase, user.id)
      return NextResponse.redirect(new URL(getDashboardUrl(profile?.role), request.url))
    }
    return response
  }

  // 4. Chưa đăng nhập → redirect login
  if (!user || authError) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 5. Lấy role từ database (không từ cookie — bảo mật hơn)
  const profile = await getUserProfile(supabase, user.id)
  const role = profile?.role ?? 'guest'

  // 6. Check permission theo route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(r =>
    pathname.startsWith(r)
  )

  if (matchedRoute) {
    const allowedRoles = ROUTE_PERMISSIONS[matchedRoute]
    if (!allowedRoles.includes(role)) {
      // Redirect về đúng dashboard theo role
      return NextResponse.redirect(
        new URL(getDashboardUrl(role), request.url)
      )
    }
  }

  // 7. Thêm role vào header để Server Components dùng
  response.headers.set('x-user-role', role)
  response.headers.set('x-user-id', user.id)

  return response
}

// ═══ HELPERS ═══
async function getUserProfile(supabase: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()
  return data
}

function getDashboardUrl(role: string | undefined): string {
  switch (role) {
    case 'admin':   return '/admin'
    case 'teacher': return '/teacher'
    case 'parent':  return '/parent'
    case 'student':
    default:        return '/builder'
  }
}

// ═══ MATCHER CONFIG ═══
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
