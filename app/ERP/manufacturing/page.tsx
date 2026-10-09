'use client'
import { useState } from 'react'

export default function ManufacturingPage() {
  const [orders, setOrders] = useState([
    { id: 'PO-2026-001', product: 'โต๊ะทำงานไม้สัก', qty: 10, dueDate: '2026-06-15', status: 'รอดำเนินการ', materials: 'ไม้สัก 20 แผ่น, ตะปู 100 ตัว' },
    { id: 'PO-2026-002', product: 'เก้าอี้สำนักงานเบาะหนัง', qty: 25, dueDate: '2026-06-20', status: 'กำลังผลิต', materials: 'โครงเหล็ก 25 ชุด, เบาะหนัง 25 ชิ้น' },
  ])

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [product, setProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [materials, setMaterials] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setProduct('')
    setQty(1)
    setDueDate('')
    setMaterials('')
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setOrders(orders.map(o => o.id === editingId ? {
        ...o, product, qty: Number(qty), dueDate, materials
      } : o))
      notify('อัปเดตใบสั่งผลิตสำเร็จ')
    } else {
      const newOrder = {
        id: `PO-2026-00${orders.length + 1}`,
        product,
        qty: Number(qty),
        dueDate,
        status: 'รอดำเนินการ',
        materials: materials || 'วัตถุดิบมาตรฐานตามสูตร BOM',
      }
      setOrders([newOrder, ...orders])
      notify('สร้างใบสั่งผลิตสำเร็จ')
    }
    resetForm()
  }

  function startEdit(o) {
    setEditingId(o.id)
    setProduct(o.product)
    setQty(o.qty)
    setDueDate(o.dueDate)
    setMaterials(o.materials)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateStatus(id, newStatus) {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
    notify(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อย`)
  }

  function doDelete() {
    setOrders(orders.filter(o => o.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบใบสั่งผลิตเรียบร้อย')
  }

  const statusStyle = {
    'รอดำเนินการ': 'bg-amber-100 text-amber-700',
    'กำลังผลิต': 'bg-blue-100 text-blue-700',
    'เสร็จสิ้น': 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">🏭 ระบบผลิตสินค้า (Manufacturing & BOM)</h1>
        <p className="text-xs text-slate-500 mt-0.5">วางแผนการผลิต ติดตามสถานะใบสั่งผลิต และควบคุมการใช้วัตถุดิบ</p>
      </header>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขใบสั่งผลิต' : '➕ สร้างใบสั่งผลิตใหม่ (Production Order)'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อสินค้าที่ผลิต</label>
              <input type="text" required value={product} onChange={e => setProduct(e.target.value)}
                placeholder="เช่น ชั้นวางหนังสือ" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวนที่ผลิต</label>
              <input type="number" min={1} required value={qty} onChange={e => setQty(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">กำหนดส่งมอบ (Due Date)</label>
              <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">รายการวัตถุดิบที่ใช้ (BOM)</label>
              <input type="text" value={materials} onChange={e => setMaterials(e.target.value)}
                placeholder="เช่น ไม้ 10 แผ่น, สกรู 50 ตัว" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '🚀 ออกใบสั่งผลิต'}
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
        <h3 className="font-extrabold text-slate-800 mb-4">📋 รายการใบสั่งผลิตทั้งหมด ({orders.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">เลขที่ใบสั่งผลิต</th>
                <th className="p-3">สินค้า</th>
                <th className="p-3">จำนวน</th>
                <th className="p-3">วัตถุดิบ (BOM)</th>
                <th className="p-3">กำหนดส่ง</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ / เปลี่ยนสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-indigo-600">{o.id}</td>
                  <td className="p-3 font-bold text-slate-800">{o.product}</td>
                  <td className="p-3 text-slate-600">{o.qty} ชิ้น</td>
                  <td className="p-3 text-slate-500 text-xs">{o.materials}</td>
                  <td className="p-3 text-slate-600">{o.dueDate}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${statusStyle[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => startEdit(o)} className="px-2.5 py-1 text-[11px] font-bold bg-amber-200 hover:bg-amber-300 text-slate-800 rounded-lg">✏️ แก้ไข</button>
                      {o.status !== 'รอดำเนินการ' && (
                        <button onClick={() => updateStatus(o.id, 'รอดำเนินการ')} className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg">รอ</button>
                      )}
                      {o.status !== 'กำลังผลิต' && (
                        <button onClick={() => updateStatus(o.id, 'กำลังผลิต')} className="px-2.5 py-1 text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg">ผลิต</button>
                      )}
                      {o.status !== 'เสร็จสิ้น' && (
                        <button onClick={() => updateStatus(o.id, 'เสร็จสิ้น')} className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg">เสร็จ</button>
                      )}
                      <button onClick={() => setConfirmDel(o)} className="px-2.5 py-1 text-[11px] font-bold bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-2xl">🗑️</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบใบสั่งผลิต</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบ {confirmDel.id} ({confirmDel.product}) ใช่หรือไม่?</p>
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