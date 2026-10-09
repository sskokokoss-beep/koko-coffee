'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function SalesPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ customer: '', amount: '', details: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ customer: '', amount: '', details: '' })
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('erp_user')
    if (stored) setUser(JSON.parse(stored))
    load()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function load() {
    const { data, error } = await supabase.from('erp_sales').select('*').order('id', { ascending: false })
    if (error) return notify('❌ โหลดข้อมูลไม่สำเร็จ: ' + error.message)
    setList(data || [])
  }

  async function addSale(e) {
    e.preventDefault()
    const { error } = await supabase.from('erp_sales').insert([{
      customer: form.customer,
      amount: Number(form.amount || 0),
      details: form.details,
      sale_by: user?.name || 'ระบบ'
    }])
    if (error) return notify('❌ บันทึกไม่สำเร็จ: ' + error.message)
    setForm({ customer: '', amount: '', details: '' })
    notify('✅ บันทึกคำสั่งซื้อใหม่เรียบร้อย')
    load()
  }

  function beginEdit(row) {
    setEditId(row.id)
    setEditForm({
      customer: row.customer || '',
      amount: String(row.amount ?? ''),
      details: row.details || ''
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('erp_sales').update({
      customer: editForm.customer,
      amount: Number(editForm.amount || 0),
      details: editForm.details
    }).eq('id', id)

    if (error) return notify('❌ แก้ไขไม่สำเร็จ: ' + error.message)
    setEditId(null)
    notify('✅ แก้ไขข้อมูลเรียบร้อย')
    load()
  }

  async function removeSale(id) {
    if (!confirm('ยืนยันการลบรายการนี้ออกจากระบบ?')) return
    const { error } = await supabase.from('erp_sales').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบรายการเรียบร้อย')
    load()
  }

  const filtered = list.filter(s =>
    (s.customer || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.details || '').toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.reduce((a, s) => a + Number(s.amount || 0), 0)

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">🛒 โมดูลบริหารงานขาย (Sales & CRM)</h1>
          <p className="text-xs text-slate-500">บันทึก แก้ไข และลบคำสั่งซื้อได้ทันทีในตาราง</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase">
          {user?.role} Privilege
        </div>
      </header>

      {/* ฟอร์มเพิ่มรายการใหม่ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-slate-800">➕ บันทึกคำสั่งซื้อใหม่</h3>
        <form onSubmit={addSale} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text" required placeholder="ชื่อลูกค้า / บริษัท"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })}
          />
          <input
            type="text" inputMode="decimal" required placeholder="ยอดเงิน เช่น 200000"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.amount}
            onChange={e => onlyNumber(e.target.value) && setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="text" placeholder="รายละเอียดสินค้า / บริการ"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.details} onChange={e => setForm({ ...form, details: e.target.value })}
          />
          <button type="submit" className="sm:col-span-3 rounded-2xl bg-indigo-600 py-3.5 font-bold text-white text-sm hover:bg-indigo-700 transition shadow-md">
            💾 บันทึกคำสั่งซื้อ
          </button>
        </form>
      </div>

      {/* รายการทั้งหมด แก้ไขในแถวได้ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายการคำสั่งซื้อทั้งหมด ({filtered.length})</h3>
          <input
            type="text" placeholder="🔍 ค้นหาลูกค้า หรือรายละเอียด..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลคำสั่งซื้อในระบบ</div>
          )}

          {filtered.map(s => (
            <div key={s.id} className={`rounded-2xl border p-4 transition ${editId === s.id ? 'border-amber-400 bg-amber-50' : 'bg-slate-50 hover:border-indigo-300'}`}>
              {editId === s.id ? (
                // โหมดแก้ไขในแถว
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-amber-700 uppercase">✏️ กำลังแก้ไขรายการ #{s.id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text" placeholder="ชื่อลูกค้า"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.customer} onChange={e => setEditForm({ ...editForm, customer: e.target.value })}
                    />
                    <input
                      type="text" inputMode="decimal" placeholder="ยอดเงิน"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.amount}
                      onChange={e => onlyNumber(e.target.value) && setEditForm({ ...editForm, amount: e.target.value })}
                    />
                    <input
                      type="text" placeholder="รายละเอียด"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.details} onChange={e => setEditForm({ ...editForm, details: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(s.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
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
                    <div className="font-bold text-slate-900">
                      {s.customer}
                      {s.details && <span className="text-xs font-normal text-slate-500"> — {s.details}</span>}
                    </div>
                    <div className="text-xs text-indigo-600 mt-0.5">บันทึกโดย: {s.sale_by || 'ไม่ระบุ'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-extrabold text-emerald-600 text-base whitespace-nowrap">
                      +{Number(s.amount || 0).toLocaleString()} ฿
                    </div>
                    <button onClick={() => beginEdit(s)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => removeSale(s.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
          <span className="font-extrabold text-indigo-900 text-sm">ยอดขายรวมทั้งสิ้น</span>
          <span className="font-extrabold text-emerald-700 text-lg">{total.toLocaleString()} ฿</span>
        </div>
      </div>
    </div>
  )
}