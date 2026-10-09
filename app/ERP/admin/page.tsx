'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: 'SALE', password: '123' })
  const [editingId, setEditingId] = useState(null)
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
    if (error) return notify('❌ โหลดข้อมูลไม่สำเร็จ: ' + error.message)
    setUsers(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      // แก้ไขข้อมูล รวมถึงรหัสผ่าน
      const { error } = await supabase.from('erp_users').update({
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password
      }).eq('id', editingId)

      if (error) return notify('❌ แก้ไขไม่สำเร็จ: ' + error.message)
      notify('✅ อัปเดตข้อมูลและรหัสผ่านเรียบร้อย')
      setEditingId(null)
    } else {
      // เพิ่มพนักงานใหม่
      const { error } = await supabase.from('erp_users').insert([form])
      if (error) return notify('❌ บันทึกไม่สำเร็จ: ' + error.message)
      notify('✅ เพิ่มพนักงานใหม่เรียบร้อย')
    }

    setForm({ name: '', email: '', role: 'SALE', password: '123' })
    loadUsers()
  }

  function startEdit(user) {
    setEditingId(user.id)
    setForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'SALE',
      password: user.password || '123'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: '', email: '', role: 'SALE', password: '123' })
  }

  async function deleteUser(id) {
    if (!confirm('ยืนยันการลบพนักงานนี้?')) return
    const { error } = await supabase.from('erp_users').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบพนักงานเรียบร้อย')
    loadUsers()
  }

  const filtered = users.filter(u => 
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
          <p className="text-xs text-slate-500">เพิ่มบัญชีผู้ใช้งาน กำหนดสิทธิ์ และแก้ไขรหัสผ่านพนักงาน</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-100">ADMIN ONLY</span>
      </header>

      {/* ฟอร์มเพิ่ม / แก้ไขพนักงาน */}
      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-slate-800">
            {editingId ? '✏️ แก้ไขข้อมูลพนักงาน & รหัสผ่าน' : '➕ เพิ่มพนักงานใหม่เข้าสู่ระบบ'}
          </h3>
          {editingId && (
            <button onClick={cancelEdit} className="text-xs font-bold text-red-500 hover:underline">ยกเลิกการแก้ไข</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" required placeholder="ชื่อ-นามสกุล"
            className="rounded-2xl border p-3 text-sm bg-white"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email" required placeholder="อีเมลพนักงาน (ใช้ Login)"
            className="rounded-2xl border p-3 text-sm bg-white"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <select
            className="rounded-2xl border p-3 text-sm bg-white font-bold"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="SALE">ฝ่ายขาย (Sale)</option>
            <option value="INVENTORY">คลังสินค้า (Inventory)</option>
            <option value="PURCHASE">จัดซื้อ (Purchase)</option>
            <option value="ACCOUNTING">บัญชีการเงิน (Accounting)</option>
            <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
          </select>
          <input
            type="text" required placeholder="รหัสผ่าน (Password)"
            className="rounded-2xl border p-3 text-sm bg-white font-bold text-indigo-600"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" className={`sm:col-span-2 rounded-2xl py-3.5 font-bold text-white text-sm transition shadow-md ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {editingId ? '💾 บันทึกการแก้ไขข้อมูลและรหัสผ่าน' : '💾 บันทึกพนักงานใหม่'}
          </button>
        </form>
      </div>

      {/* รายชื่อพนักงานทั้งหมด */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายชื่อพนักงานทั้งหมด ({filtered.length} คน)</h3>
          <input
            type="text" placeholder="🔍 ค้นหาชื่อ หรืออีเมล..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filtered.map(user => (
            <div key={user.id} className="rounded-2xl border p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-indigo-300 transition">
              <div>
                <div className="font-extrabold text-slate-900 text-sm">{user.name} <span className="text-xs font-normal text-slate-500">({user.email})</span></div>
                <div className="text-xs font-bold text-indigo-600 mt-1">
                  ROLE: {user.role} | <span className="text-slate-700">PASSWORD: {user.password}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(user)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                  ✏️ แก้ไข
                </button>
                <button onClick={() => deleteUser(user.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}