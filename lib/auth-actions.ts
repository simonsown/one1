'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu' }
  }

  // Logic Admin đặc biệt theo yêu cầu của USER
  if (email === 'admin' && password === 'nguyen200113') {
    // Trong thực tế nên dùng auth.signIn, nhưng đây là yêu cầu hardcode cho Admin
    // Ta sẽ redirect thẳng về /admin và middleware sẽ kiểm tra session sau
    // Để middleware hoạt động, ta vẫn cần một session thật hoặc giả lập
    // Ở đây ta giả sử đã có user admin trong DB
    const { error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@pcmaster.com', // Email thật của admin trong hệ thống
      password: password,
    })
    if (!adminError) {
      revalidatePath('/', 'layout')
      redirect('/admin')
    }
  }

  // 1. Thực hiện đăng nhập thẳng bằng Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    const errMsg = error.message.toLowerCase()
    
    if (errMsg.includes('confirm') || errMsg.includes('email_not_confirmed')) {
      friendlyError = 'Tài khoản của bạn chưa được xác nhận qua Email. Vui lòng kiểm tra hộp thư đến (Inbox/Spam) để nhấp vào liên kết kích hoạt trước khi đăng nhập!'
    } else if (errMsg.includes('invalid') || errMsg.includes('credentials')) {
      friendlyError = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    } else {
      friendlyError = error.message
    }
    return { error: friendlyError }
  }

  const user = data.user

  // 2. Tự động cứu hộ Profile nếu bị thiếu (ví dụ: do RLS hoặc Trigger lúc đăng ký)
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const role = user.user_metadata?.role || 'student'
      const fullName = user.user_metadata?.full_name || email.split('@')[0]
      
      const { error: rescueError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
      })
      
      if (rescueError) {
        console.error('Profile Rescue Failed:', rescueError)
      }
    }
  }

  // Lấy role cuối cùng
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const userRole = finalProfile?.role || user!.user_metadata?.role || 'student'
  
  revalidatePath('/', 'layout')
  
  if (userRole === 'student') {
    redirect('/builder')
  } else {
    redirect(`/${userRole}`)
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string || 'student'
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  const classCode = formData.get('class_code') as string

  if (!email || !password || !fullName) {
    return { error: 'Vui lòng điền đủ thông tin bắt buộc' }
  }

  let schoolId = null;
  let classIdToJoin = null;

  // 1. Kiểm tra mã trường (nếu có)
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .single()
      
    if (school) schoolId = school.id;
  }

  // 3. Đăng ký tài khoản Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      }
    }
  })

  if (error) return { error: error.message }

  if (data.user) {
    // 4. Tạo Profile thủ công (đảm bảo role và school_id được lưu ngay lập tức)
    // Dùng upsert vì có thể trigger đã tạo một bản ghi rỗng trước đó
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      school_id: schoolId,
      school_name: schoolName,
      updated_at: new Date().toISOString()
    });

    if (profileError) console.error('Profile Creation Error:', profileError);
  }

  revalidatePath('/', 'layout')
  redirect('/login?registered=true')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, schools(*)')
    .eq('id', user.id)
    .single()

  return profile;
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })
  
  if (data.url) {
    redirect(data.url)
  }
}

export async function completeOAuthRegistration(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Không tìm thấy phiên đăng nhập' }
  }

  const role = formData.get('role') as string || 'student'
  const schoolCode = formData.get('school_code') as string
  const schoolName = formData.get('school_name') as string
  
  let schoolId = null;
  if (schoolCode) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode)
      .single()
      
    if (school) schoolId = school.id;
  }

  // Cập nhật profile cho tài khoản Google đã tạo
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    role: role,
    school_id: schoolId,
    school_name: schoolName,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    return { error: 'Lỗi khi cập nhật hồ sơ: ' + profileError.message }
  }

  revalidatePath('/', 'layout')
  
  if (role === 'student') {
    redirect('/builder')
  } else {
    redirect(`/${role}`)
  }
}
