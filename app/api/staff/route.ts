import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client สิทธิ์สูงสุด ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์เท่านั้น
function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ตรวจสอบว่าผู้เรียกเป็น admin จริง
async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อน', status: 401, user: null }

  const { data: profile } = await supabase
    .from('erp_profiles').select('role, email').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return { error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการพนักงานได้', status: 403, user: null }
  }
  return { error: null, status: 200, user: { id: user.id, email: profile.email } }
}

// ===== ดึงรายชื่อพนักงานทั้งหมด =====
export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await adminClient()
    .from('erp_profiles')
    .select('id, full_name, email, phone, role, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// ===== เพิ่มพนักงานใหม่ พร้อมรหัสผ่าน =====
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { full_name, email, phone, role, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
  }

  const admin = adminClient()

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (authError) {
    const msg = authError.message.includes('already been registered')
      ? 'อีเมลนี้ถูกใช้งานในระบบแล้ว'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Trigger สร้างโปรไฟล์ให้แล้ว เหลือเติมข้อมูลและสิทธิ์
  const { error: profileError } = await admin
    .from('erp_profiles')
    .upsert({ id: created.user.id, full_name, email, phone, role: role || 'staff' })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  await admin.from('erp_logs').insert([{
    user_email: guard.user!.email,
    action: 'CREATE_USER',
    module: 'STAFF',
    detail: `สร้างบัญชีพนักงาน ${email} สิทธิ์ ${role || 'staff'}`,
  }])

  return NextResponse.json({ success: true })
}

// ===== แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน =====
export async function PATCH(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { id, full_name, phone, role, password } = await request.json()
  if (!id) return NextResponse.json({ error: 'ไม่พบรหัสพนักงาน' }, { status: 400 })

  const admin = adminClient()

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
    }
    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { error } = await admin
    .from('erp_profiles')
    .update({ full_name, phone, role })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await admin.from('erp_logs').insert([{
    user_email: guard.user!.email,
    action: 'UPDATE_USER',
    module: 'STAFF',
    detail: `แก้ไขข้อมูลพนักงาน ${full_name}${password ? ' (เปลี่ยนรหัสผ่าน)' : ''}`,
  }])

  return NextResponse.json({ success: true })
}

// ===== ลบพนักงาน =====
export async function DELETE(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { id } = await request.json()

  if (id === guard.user!.id) {
    return NextResponse.json({ error: 'ไม่สามารถลบบัญชีของตนเองได้' }, { status: 400 })
  }

  const admin = adminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await admin.from('erp_logs').insert([{
    user_email: guard.user!.email,
    action: 'DELETE_USER',
    module: 'STAFF',
    detail: `ลบบัญชีพนักงานรหัส ${id}`,
  }])

  return NextResponse.json({ success: true })
}