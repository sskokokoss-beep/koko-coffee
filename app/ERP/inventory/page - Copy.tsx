'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function InventoryPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ product_name: '', qty: '', price: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ product_name: '', qty: '', price: '' })
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('erp_user')
    if (stored) setUser(JSON.parse(stored))
    loadStock()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadStock() {
    const { data, error } = await supabase.from('erp_inventory').select('*').order('id', { ascending: false })
    if (error) return notify('❌ โหลดสต็อกไม่สำเร็จ: ' + error.message)
    setList(data || [])
  }

  async function addStock(e) {
    e.preventDefault()
    const { error } = await supabase.from('erp_inventory').insert([{
      product_name: form.product_name,
      qty: Number(form.qty || 0),
      price: Number(form.price || 0)
    }])
    if (error) return notify('❌ เพิ่มสินค้าไม่สำเร็จ: ' + error.message)
    setForm({ product_name: '', qty: '', price: '' })
    notify('✅ เพิ่มสินค้าเข้าคลังเรียบร้อย')
    loadStock()
  }

  function beginEdit(item) {
    setEditId(item.id)
    setEditForm({
      product_name: item.product_name || '',
      qty: String(item.qty ?? ''),
      price: String(item.price ?? '')
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('erp_inventory').update({
      product_name: editForm.product_name,
      qty: Number(editForm.qty || 0),
      price: Number(editForm.price || 0)
    }).eq('id', id)

    if (error) return notify('❌ แก้ไขสต็อกไม่สำเร็จ: ' + error.message)
    setEditId(null)
    notify('✅ อัปเดตข้อมูลสินค้าเรียบร้อย')
    loadStock()
  }

  async function removeStock(id) {
    if (!confirm('ยืนยันการลบสินค้านี้ออกจากคลัง?')) return
    const { error } = await supabase.from('erp_inventory').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบสินค้าเรียบร้อย')
    loadStock()
  }

  const filtered = list.filter(i => (i.product_name || '').toLowerCase().includes(search.toLowerCase()))
  const totalQty = filtered.reduce((a, i) => a + Number(i.qty || 0), 0)
  const totalVal = filtered.reduce((a, i) => a + (Number(i.qty || 0) * Number(i.price || 0)), 0)

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">📦 โมดูลบริหารคลังสินค้า (Inventory)</h1>
          <p className="text-xs text-slate-500">ควบคุมสต็อกสินค้า ตรวจสอบจำนวน และจัดการรายการสินค้า</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-extrabold uppercase">
          {user?.role} Privilege
        </div>
      </header>

      {/* ฟอร์มเพิ่มสินค้า (เฉพาะ Admin หรือ Inventory) */}
      {(user?.role === 'admin' || user?.role === 'inventory') && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-800">➕ เพิ่มสินค้าเข้าคลัง (Stock In)</h3>
          <form onSubmit={addStock} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text" required placeholder="ชื่อสินค้า"
              className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })}
            />
            <input
              type="text" inputMode="decimal" required placeholder="จำนวน (Qty)"
              className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              value={form.qty}
              onChange={e => onlyNumber(e.target.value) && setForm({ ...form, qty: e.target.value })}
            />
            <input
              type="text" inputMode="decimal" required placeholder="ราคาต่อหน่วย (บาท)"
              className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              value={form.price}
              onChange={e => onlyNumber(e.target.value) && setForm({ ...form, price: e.target.value })}
            />
            <button type="submit" className="sm:col-span-3 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white text-sm hover:bg-emerald-700 transition shadow-md">
              📦 บันทึกเพิ่มลงสต็อก
            </button>
          </form>
        </div>
      )}

      {/* รายการคลังสินค้า */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 สินค้าคงเหลือทั้งหมด ({filtered.length} รายการ)</h3>
          <input
            type="text" placeholder="🔍 ค้นหาชื่อสินค้า..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72 focus:bg-white focus:outline-none focus:border-emerald-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลสินค้าในคลัง</div>
          )}

          {filtered.map(item => (
            <div key={item.id} className={`rounded-2xl border p-4 transition ${editId === item.id ? 'border-amber-400 bg-amber-50' : 'bg-slate-50 hover:border-emerald-300'}`}>
              {editId === item.id ? (
                // โหมดแก้ไขในแถว
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-amber-700 uppercase">✏️ กำลังแก้ไขสินค้า ID: {item.id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text" placeholder="ชื่อสินค้า"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.product_name} onChange={e => setEditForm({ ...editForm, product_name: e.target.value })}
                    />
                    <input
                      type="text" inputMode="decimal" placeholder="จำนวน"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.qty}
                      onChange={e => onlyNumber(e.target.value) && setEditForm({ ...editForm, qty: e.target.value })}
                    />
                    <input
                      type="text" inputMode="decimal" placeholder="ราคาต่อหน่วย"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.price}
                      onChange={e => onlyNumber(e.target.value) && setEditForm({ ...editForm, price: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(item.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
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
                    <div className="font-bold text-slate-900 text-base">{item.product_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">ราคา: {Number(item.price || 0).toLocaleString()} บาท/หน่วย</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-indigo-600 text-base">{Number(item.qty || 0).toLocaleString()} ชิ้น</div>
                      <div className="text-xs text-slate-400">มูลค่ารวม: {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString()} ฿</div>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'inventory') && (
                      <div className="flex gap-2">
                        <button onClick={() => beginEdit(item)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                          ✏️ แก้ไข
                        </button>
                        <button onClick={() => removeStock(item.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                          🗑️ ลบ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center rounded-2xl bg-emerald-50 p-4 border border-emerald-100 gap-2">
          <span className="font-extrabold text-emerald-900 text-sm">สรุปคลังสินค้าทั้งหมด</span>
          <div className="flex gap-6 text-sm">
            <span className="font-bold text-slate-700">จำนวนรวม: <strong className="text-emerald-700">{totalQty.toLocaleString()}</strong> ชิ้น</span>
            <span className="font-bold text-slate-700">มูลค่าสต็อกรวม: <strong className="text-emerald-700">{totalVal.toLocaleString()} ฿</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}