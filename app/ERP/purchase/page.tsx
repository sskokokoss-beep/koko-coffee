'use client'
import { useState, useEffect } from 'react'

export default function PurchasePage() {
  const [purchases, setPurchases] = useState([
    { id: 'PO-PUR-001', supplier: 'บริษัท ไม้สักไทย จำกัด', item: 'ไม้สักแผ่นพรีเมียม (50 แผ่น)', total: 60000, date: '2026-06-01', status: 'ได้รับสินค้าแล้ว' },
    { id: 'PO-PUR-002', supplier: 'ร้านฮาร์ดแวร์เซ็นเตอร์', item: 'ตะปูควง และอุปกรณ์ช่าง', total: 4500, date: '2026-06-04', status: 'รอจัดส่ง' },
  ])

  useEffect(() => {
    const saved = localStorage.getItem('erp_purchase')
    if (saved) setPurchases(JSON.parse(saved))
  }, [])

  function saveToStorage(updated) {
    setPurchases(updated)
    localStorage.setItem('erp_purchase', JSON.stringify(updated))
  }

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [supplier, setSupplier] = useState('')
  const [item, setItem] = useState('')
  const [total, setTotal] = useState('')
  const [status, setStatus] = useState('รอจัดส่ง')
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setSupplier('')
    setItem('')
    setTotal('')
    setStatus('รอจัดส่ง')
  }

  function handleSave(e) {
    e.preventDefault()
    let updated = []
    const poId = editingId || `PO-PUR-00${purchases.length + 1}`

    if (editingId) {
      updated = purchases.map(p => p.id === editingId ? { ...p, supplier, item, total: Number(total), status } : p)
      notify('อัปเดตใบสั่งซื้อสำเร็จ')
    } else {
      const newPurchase = {
        id: poId,
        supplier,
        item,
        total: Number(total),
        date: new Date().toISOString().split('T')[0],
        status,
      }
      updated = [newPurchase, ...purchases]
      notify('สร้างใบสั่งซื้อและบันทึกรายจ่ายอัตโนมัติสำเร็จ')
    }
    saveToStorage(updated)

    // Workflow: บันทึกรายจ่ายลงบัญชีอัตโนมัติ
    const savedTx = JSON.parse(localStorage.getItem('erp_transactions') || '[]')
    const existingIndex = savedTx.findIndex(t => t.ref === poId)
    const txData = {
      id: `ACC-${Date.now().toString().slice(-4)}`,
      title: `จัดซื้อ: ${item} (${supplier})`,
      type: 'expense',
      category: 'ต้นทุนวัตถุดิบ',
      amount: Number(total),
      date: new Date().toISOString().split('T')[0],
      ref: poId
    }

    if (existingIndex >= 0) {
      savedTx[existingIndex] = { ...savedTx[existingIndex], amount: Number(total), title: `จัดซื้อ: ${item} (${supplier})` }
    } else {
      savedTx.unshift(txData)
    }
    localStorage.setItem('erp_transactions', JSON.stringify(savedTx))

    resetForm()
  }

  function startEdit(p) {
    setEditingId(p.id)
    setSupplier(p.supplier)
    setItem(p.item)
    setTotal(p.total)
    setStatus(p.status)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doDelete() {
    const updated = purchases.filter(p => p.id !== confirmDel.id)
    saveToStorage(updated)
    setConfirmDel(null)
    notify('ลบใบสั่งซื้อเรียบร้อย')
  }

  const statusStyle = {
    'รอจัดส่ง': 'bg-amber-100 text-amber-700',
    'ได้รับสินค้าแล้ว': 'bg-emerald-100 text-emerald-700',
    'ยกเลิก': 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">🛒 ระบบจัดซื้อ (Purchase Orders & Auto Expense)</h1>
        <p className="text-xs text-slate-500 mt-0.5">จัดการใบสั่งซื้อวัตถุดิบพร้อมบันทึกรายจ่ายเข้าบัญชีอัตโนมัติ</p>
      </header>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขใบสั่งซื้อ' : '➕ สร้างใบสั่งซื้อใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อผู้ขาย / Supplier</label>
              <input type="text" required value={supplier} onChange={e => setSupplier(e.target.value)}
                placeholder="เช่น บริษัท วัสดุก่อสร้าง จำกัด" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">รายการสินค้า / วัตถุดิบ</label>
              <input type="text" required value={item} onChange={e => setItem(e.target.value)}
                placeholder="เช่น ไม้สัก 30 แผ่น" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ยอดเงินรวม (บาท)</label>
              <input type="number" min={0} required value={total} onChange={e => setTotal(e.target.value)}
                placeholder="เช่น 25000" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">สถานะการจัดส่ง</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="รอจัดส่ง">⏳ รอจัดส่ง</option>
                <option value="ได้รับสินค้าแล้ว">✅ ได้รับสินค้าแล้ว</option>
                <option value="ยกเลิก">❌ ยกเลิก</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '🚀 บันทึกใบสั่งซื้อ'}
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
        <h3 className="font-extrabold text-slate-800 mb-4">📋 รายการใบสั่งซื้อทั้งหมด ({purchases.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">เลขที่ใบสั่งซื้อ</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">รายการสินค้า</th>
                <th className="p-3">ยอดรวม</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-indigo-600">{p.id}</td>
                  <td className="p-3 font-bold text-slate-800">{p.supplier}</td>
                  <td className="p-3 text-slate-600">{p.item}</td>
                  <td className="p-3 font-extrabold text-slate-900">{p.total.toLocaleString()} ฿</td>
                  <td className="p-3 text-slate-500 text-xs">{p.date}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => startEdit(p)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                      <button onClick={() => setConfirmDel(p)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">🗑️ ลบ</button>
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
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบใบสั่งซื้อ</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบใบสั่งซื้อ {confirmDel.id} ใช่หรือไม่?</p>
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