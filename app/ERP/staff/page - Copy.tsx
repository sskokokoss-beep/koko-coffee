'use client'
import { useState, useEffect } from 'react'

export default function StaffPage() {
  const [staff, setStaff] = useState([
    { id: '1', fullName: 'Phusit Kantha', email: 'admin@erp.com', phone: '0654161997', role: 'admin' },
    { id: '2', fullName: 'สมชาย ใจดี', email: 'somchai@erp.com', phone: '0891234567', role: 'staff' },
  ])
  const [toast, setToast] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('staff')
  const [password, setPassword] = useState('')

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setFullName(''); setEmail(''); setPhone(''); setRole('staff'); setPassword('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      setStaff(staff.map(s => s.id === editingId ? { ...s, fullName, phone, role } : s))
      notify('อัปเดตข้อมูลพนักงานสำเร็จ')
    } else {
      const newStaff = {
        id: Date.now().toString(),
        fullName,
        email,
        phone,
        role,
      }
      setStaff([newStaff, ...staff])
      notify('เพิ่มพนักงานใหม่สำเร็จ')
    }
    resetForm()
  }

  function startEdit(s) {
    setEditingId(s.id)
    setFullName(s.fullName)
    setEmail(s.email)
    setPhone(s.phone)
    setRole(s.role)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doDelete() {
    setStaff(staff.filter(s => s.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบพนักงานเรียบร้อย')
  }

  const filtered = staff.filter(s =>
    [s.fullName, s.email, s.phone, s.role].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  const roleStyle = {
    admin: 'bg-violet-100 text-violet-700',
    manager: 'bg-blue-100 text-blue-700',
    staff: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">👥 ระบบจัดการพนักงาน (Staff Management)</h1>
        <p className="text-xs text-slate-500 mt-0.5">จัดการข้อมูลพนักงานในระบบอย่างรวดเร็วและเสถียร</p>
      </header>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขข้อมูลพนักงาน' : '➕ เพิ่มพนักงานใหม่'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อ - นามสกุล</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">อีเมล</label>
              <input type="email" required disabled={!!editingId} value={email} onChange={e => setEmail(e.target.value)}
                placeholder="somchai@erp.com" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white disabled:bg-slate-100" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">เบอร์โทรศัพท์</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="0891234567" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ตำแหน่ง / สิทธิ์</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="staff">👤 Staff (พนักงานทั่วไป)</option>
                <option value="manager">📋 Manager (ผู้จัดการ)</option>
                <option value="admin">🛡️ Admin (ผู้ดูแลระบบ)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกข้อมูล'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl bg-slate-200 hover:bg-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="font-extrabold text-slate-800">📋 รายชื่อพนักงานทั้งหมด ({filtered.length})</h3>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ค้นหา..."
            className="w-full sm:w-72 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">ชื่อ - นามสกุล</th>
                <th className="p-3">อีเมล</th>
                <th className="p-3">เบอร์โทรศัพท์</th>
                <th className="p-3">สิทธิ์</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500 italic">ไม่พบข้อมูลพนักงาน</td></tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{s.fullName}</td>
                    <td className="p-3 text-slate-600">{s.email}</td>
                    <td className="p-3 text-slate-600">{s.phone || '—'}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${roleStyle[s.role]}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => startEdit(s)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                        <button onClick={() => setConfirmDel(s)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">🗑️ ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-2xl">🗑️</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบพนักงาน</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบ {confirmDel.fullName} ใช่หรือไม่?</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700">ยกเลิก</button>
              <button onClick={doDelete} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/30">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}