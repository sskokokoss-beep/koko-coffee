'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function UsersPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: 'sale', password: '123' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'sale', password: '' })
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadUsers() {
    const { data, error } = await supabase.from('erp_users').select('*').order('id', { ascending: false })
    if (error) return notify('❌ โหลดข้อมูลพนักงานไม่สำเร็จ: ' + error.message)
    setList(data || [])
  }

  async function addUser(e) {
    e.preventDefault()
    const { error } = await supabase.from('erp_users').insert([form])
    if (error) return notify('❌ เพิ่มพนักงานไม่สำเร็จ: ' + error.message)
    setForm({ name: '', email: '', role: 'sale', password: '123' })
    notify('✅ เพิ่มพนักงานใหม่เรียบร้อย')
    loadUsers()
  }

  function beginEdit(user) {
    setEditId(user.id)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'sale',
      password: user.password || '123'
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('erp_users').update(editForm).eq('id', id)
    if (error) return notify('❌ แก้ไขพนักงานไม่สำเร็จ: ' + error.message)
    setEditId(null)
    notify('✅ อัปเดตข้อมูลพนักงานเรียบร้อย')
    loadUsers()
  }

  async function removeUser(id) {
    if (!confirm('ยืนยันการลบพนักงานรายนี้ออกจากระบบ?')) return
    const { error } = await supabase.from('erp_users').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบพนักงานเรียบร้อย')
    loadUsers()
  }

  const filtered = list.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">👥 จัดการพนักงานและสิทธิ์ (Admin Control)</h1>
          <p className="text-xs text-slate-500">เพิ่มบัญชีผู้ใช้งาน กำหนดสิทธิ์การเข้าถึง และจัดการข้อมูลพนักงาน</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase">
          Admin Only
        </div>
      </header>

      {/* ฟอร์มเพิ่มพนักงานใหม่ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-slate-800">➕ เพิ่มพนักงานใหม่เข้าสู่ระบบ</h3>
        <form onSubmit={addUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" required placeholder="ชื่อ-นามสกุล"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email" required placeholder="อีเมลพนักงาน (ใช้ Login)"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <select
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="sale">ฝ่ายขาย (Sale)</option>
            <option value="inventory">ฝ่ายคลังสินค้า (Inventory)</option>
            <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
          </select>
          <input
            type="text" required placeholder="รหัสผ่าน"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" className="sm:col-span-2 rounded-2xl bg-indigo-600 py-3.5 font-bold text-white text-sm hover:bg-indigo-700 transition shadow-md">
            💾 บันทึกพนักงานใหม่
          </button>
        </form>
      </div>

      {/* รายชื่อพนักงาน */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายชื่อพนักงานทั้งหมด ({filtered.length} คน)</h3>
          <input
            type="text" placeholder="🔍 ค้นหาชื่อ หรืออีเมล..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ไม่พบข้อมูลพนักงานในระบบ</div>
          )}

          {filtered.map(emp => (
            <div key={emp.id} className={`rounded-2xl border p-4 transition ${editId === emp.id ? 'border-amber-400 bg-amber-50' : 'bg-slate-50 hover:border-indigo-300'}`}>
              {editId === emp.id ? (
                // โหมดแก้ไขในแถว
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-amber-700 uppercase">✏️ กำลังแก้ไขพนักงาน ID: {emp.id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text" placeholder="ชื่อ"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <input
                      type="email" placeholder="อีเมล"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <select
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500 font-semibold"
                      value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="sale">ฝ่ายขาย (Sale)</option>
                      <option value="inventory">ฝ่ายคลังสินค้า (Inventory)</option>
                      <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                    </select>
                    <input
                      type="text" placeholder="รหัสผ่าน"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(emp.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                      ✅ บันทึกการแก้ไข
                    </button>
                    <button onClick={() => setEditId(null)} className="rounded-xl bg-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-400 transition">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                // โหมดแสดงผลปกติ
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-base">{emp.name} <span className="text-xs font-normal text-slate-500">({emp.email})</span></div>
                    <div className="text-xs text-indigo-600 font-extrabold uppercase mt-0.5">Role: {emp.role} | Password: {emp.password}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => beginEdit(emp)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => removeUser(emp.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}