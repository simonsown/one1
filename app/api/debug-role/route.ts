import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Vui lòng đăng nhập trước!", { status: 401 })
  }

  // Ép vai trò sang teacher cho user hiện tại
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'teacher' })
    .eq('id', user.id)

  if (error) {
    return new Response("Lỗi: " + error.message, { status: 500 })
  }

  revalidatePath('/', 'layout')
  
  return new Response(`
    <html>
      <body style="background: #f8f9fa; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <h1 style="color: #089e60;">Thành công!</h1>
        <p>Tài khoản của bạn đã được nâng cấp lên vai trò <b>Giáo viên</b>.</p>
        <a href="/teacher" style="padding: 10px 20px; background: #089e60; color: black; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Về Dashboard Giáo viên</a>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
