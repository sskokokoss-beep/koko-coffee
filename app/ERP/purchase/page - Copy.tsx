'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function PurchasePage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ supplier_name: '', product_name: '', qty: '', total_price: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ supplier_name: '', product_name: '', qty: '', total_price: '', status: 'Pending' })
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('erp_user')
    if (stored) setUser(JSON.parse(stored))
    loadPurchases()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadPurchases() {
    const { data, error } = await supabase.from('erp_purchase').select('*').order('id', { ascending: false })
    if (error) return notify('❌ โหลดข้อมูลจัดซื้อไม่สำเร็จ: ' + error.message)
    setList(data || [])
  }

  async function addPurchase(e) {
    e.preventDefault()
    const { error } = await supabase.from('erp_purchase').insert([{
      supplier_name: form.supplier_name,
      product_name: form.product_name,
      qty: Number(form.qty || 0),
      total_price: Number(form.total_price || 0),
      status: 'Pending'
    }])
    if (error) return notify('❌ บันทึกใบจัดซื้อไม่สำเร็จ: ' + error.message)
    setForm({ supplier_name: '', product_name: '', qty: '', total_price: '' })
    notify('✅ สร้างใบสั่งซื้อสำเร็จ')
    loadPurchases()
  }

  function beginEdit(item) {
    setEditId(item.id)
    setEditForm({
      supplier_name: item.supplier_name || '',
      product_name: item.product_name || '',
      qty: String(item.qty ?? ''),
      total_price: String(item.total_price ?? ''),
      status: item.status || 'Pending'
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('erp_purchase').update({
      supplier_name: editForm.supplier_name,
      product_name: editForm.product_name,
      qty: Number(editForm.qty || 0),
      total_price: Number(editForm.total_price || 0),
      status: editForm.status
    }).eq('id', id)

    if (error) return notify('❌ แก้ไขไม่สำเร็จ: ' + error.message)
    setEditId(null)
    notify('✅ อัปเดตใบจัดซื้อเรียบร้อย')
    loadPurchases()
  }

  async function removePurchase(id) {
    if (!confirm('ยืนยันการลบรายการจัดซื้อนี้?')) return
    const { error } = await supabase.from('erp_purchase').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบรายการเรียบร้อย')
    loadPurchases()
  }

  const filtered = list.filter(p => 
    (p.supplier_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.product_name || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalCost = filtered.reduce((a, p) => a + Number(p.total_price || 0), 0)

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">📦 ระบบจัดซื้อ (Purchase Management)</h1>
          <p className="text-xs text-slate-500">บันทึกใบสั่งซื้อสินค้าจากซัพพลายเออร์ ติดตามสถานะ และควบคุมต้นทุน</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-extrabold uppercase">
          {user?.role} Privilege
        </div>
      </header>

      {/* ฟอร์มเพิ่มใบสั่งซื้อ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-slate-800">➕ สร้างใบสั่งซื้อสินค้าใหม่ (Purchase Order)</h3>
        <form onSubmit={addPurchase} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text" required placeholder="ชื่อซัพพลายเออร์ (Supplier)"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
            value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })}
          />
          <input
            type="text" required placeholder="ชื่อสินค้าที่สั่งซื้อ"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
            value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })}
          />
          <input
            type="text" inputMode="decimal" required placeholder="จำนวน (Qty)"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
            value={form.qty}
            onChange={e => onlyNumber(e.target.value) && setForm({ ...form, qty: e.target.value })}
          />
          <input
            type="text" inputMode="decimal" required placeholder="ราคารวมทั้งหมด (บาท)"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
            value={form.total_price}
            onChange={e => onlyNumber(e.target.value) && setForm({ ...form, total_price: e.target.value })}
          />
          <button type="submit" className="sm:col-span-2 lg:col-span-4 rounded-2xl bg-amber-600 py-3.5 font-bold text-white text-sm hover:bg-amber-700 transition shadow-md">
            🛒 บันทึกใบสั่งซื้อสินค้า
          </button>
        </form>
      </div>

      {/* รายการคำสั่งซื้อ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายการใบสั่งซื้อทั้งหมด ({filtered.length} รายการ)</h3>
          <input
            type="text" placeholder="🔍 ค้นหาซัพพลายเออร์ หรือสินค้า..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72 focus:bg-white focus:outline-none focus:border-amber-500"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลการจัดซื้อในระบบ</div>
          )}

          {filtered.map(item => (
            <div key={item.id} className={`rounded-2xl border p-4 transition ${editId === item.id ? 'border-amber-400 bg-amber-50' : 'bg-slate-50 hover:border-amber-300'}`}>
              {editId === item.id ? (
                // โหมดแก้ไขในแถว
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-amber-700 uppercase">✏️ กำลังแก้ไขใบสั่งซื้อ ID: {item.id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text" placeholder="ซัพพลายเออร์"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.supplier_name} onChange={e => setEditForm({ ...editForm, supplier_name: e.target.value })}
                    />
                    <input
                      type="text" placeholder="สินค้า"
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
                      type="text" inputMode="decimal" placeholder="ราคารวม"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.total_price}
                      onChange={e => onlyNumber(e.target.value) && setEditForm({ ...editForm, total_price: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <select
                      className="rounded-xl border p-2.5 text-sm bg-white font-bold"
                      value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Pending">⏳ รออนุมัติ (Pending)</option>
                      <option value="Approved">✅ อนุมัติแล้ว (Approved)</option>
                      <option value="Received">📦 รับสินค้าแล้ว (Received)</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                        ✅ บันทึกการแก้ไข
                      </button>
                      <button onClick={() => setEditId(null)} className="rounded-xl bg-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-400 transition">
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // โหมดแสดงผลปกติ
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-base">
                      {item.supplier_name} <span className="text-xs font-normal text-slate-500">— สั่งซื้อ: {item.product_name} ({item.qty} ชิ้น)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        item.status === 'Received' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Approved' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-amber-600 text-base">{Number(item.total_price || 0).toLocaleString()} ฿</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => beginEdit(item)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                        ✏️ แก้ไข
                      </button>
                      <button onClick={() => removePurchase(item.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center rounded-2xl bg-amber-50 p-4 border border-amber-100">
          <span className="font-extrabold text-amber-900 text-sm">ยอดจัดซื้อรวมทั้งสิ้น</span>
          <span className="font-extrabold text-amber-700 text-lg">{totalCost.toLocaleString()} ฿</span>
        </div>
      </div>
    </div>
  )
}