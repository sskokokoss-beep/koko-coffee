'use client'
import { useState, useEffect } from 'react'

export default function SalesPage() {
  const [sales, setSales] = useState([
    { id: 'SO-2026-001', customer: 'บริษัท เฟอร์นิเจอร์ไทย จำกัด', product: 'โต๊ะทำงานไม้สัก', qty: 10, total: 120000, date: '2026-06-01', status: 'ชำระแล้ว' },
    { id: 'SO-2026-002', customer: 'คุณสมศักดิ์ รักดี', product: 'เก้าอี้สำนักงาน', qty: 5, total: 15000, date: '2026-06-03', status: 'รอชำระเงิน' },
  ])

  useEffect(() => {
    const saved = localStorage.getItem('erp_sales')
    if (saved) {
      setSales(JSON.parse(saved))
    } else {
      localStorage.setItem('erp_sales', JSON.stringify(sales))
    }
  }, [])

  function saveToStorage(updated) {
    setSales(updated)
    localStorage.setItem('erp_sales', JSON.stringify(updated))
  }

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [customer, setCustomer] = useState('')
  const [product, setProduct] = useState('')
  const [qty, setQty] = useState('')
  const [total, setTotal] = useState('')
  const [status, setStatus] = useState('รอชำระเงิน')
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setCustomer('')
    setProduct('')
    setQty('')
    setTotal('')
    setStatus('รอชำระเงิน')
  }

  function handleSave(e) {
    e.preventDefault()
    if (!customer || !product || total === '') return

    let updated = []
    const saleId = editingId || `SO-2026-0${sales.length + 1}`

    if (editingId) {
      updated = sales.map(s => s.id === editingId ? { ...s, customer, product, qty: Number(qty || 1), total: Number(total), status } : s)
      notify('อัปเดตรายการขายสำเร็จ')
    } else {
      const newSale = {
        id: saleId,
        customer,
        product,
        qty: Number(qty || 1),
        total: Number(total),
        date: new Date().toISOString().split('T')[0],
        status,
      }
      updated = [newSale, ...sales]
      notify('สร้างรายการขายและบันทึกบัญชีอัตโนมัติสำเร็จ')
    }
    saveToStorage(updated)

    // Workflow: บันทึกหรืออัปเดตรายรับลงในระบบบัญชี (Accounting) อัตโนมัติ
    const savedTx = JSON.parse(localStorage.getItem('erp_transactions') || '[]')
    const existingIndex = savedTx.findIndex(t => t.ref === saleId)
    const txData = {
      id: `ACC-${Date.now().toString().slice(-4)}`,
      title: `ขายสินค้า: ${product} (${customer})`,
      type: 'income',
      category: 'รายได้จากการขาย',
      amount: Number(total),
      date: new Date().toISOString().split('T')[0],
      ref: saleId
    }

    if (existingIndex >= 0) {
      savedTx[existingIndex] = { ...savedTx[existingIndex], amount: Number(total), title: `ขายสินค้า: ${product} (${customer})` }
    } else {
      savedTx.unshift(txData)
    }
    localStorage.setItem('erp_transactions', JSON.stringify(savedTx))

    resetForm()
  }

  function startEdit(s) {
    setEditingId(s.id)
    setCustomer(s.customer)
    setProduct(s.product)
    setQty(s.qty)
    setTotal(s.total)
    setStatus(s.status)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doDelete() {
    const updated = sales.filter(s => s.id !== confirmDel.id)
    saveToStorage(updated)
    setConfirmDel(null)
    notify('ลบรายการขายเรียบร้อย')
  }

  const statusStyle = {
    'รอชำระเงิน': 'bg-amber-100 text-amber-700',
    'ชำระแล้ว': 'bg-emerald-100 text-emerald-700',
    'ยกเลิก': 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">💼 ระบบงานขาย (Sales Orders & Auto Accounting)</h1>
          <p className="text-xs text-slate-500 mt-0.5">บันทึกคำสั่งซื้อและเชื่อมโยงรายรับเข้าสู่ระบบบัญชีโดยอัตโนมัติ</p>
        </div>
        <button onClick={() => window.print()} className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-2">
          🖨️ พิมพ์รายงานการขาย
        </button>
      </header>

      {/* ฟอร์มบันทึกการขาย */}
      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขรายการขาย' : '➕ สร้างรายการขายใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อลูกค้า</label>
              <input type="text" required value={customer} onChange={e => setCustomer(e.target.value)}
                placeholder="เช่น บริษัท ABC จำกัด" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">รายการสินค้า</label>
              <input type="text" required value={product} onChange={e => setProduct(e.target.value)}
                placeholder="เช่น โต๊ะทำงาน" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวน</label>
              <input type="number" min={1} required value={qty} onChange={e => setQty(e.target.value)}
                placeholder="1" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ยอดรวม (บาท)</label>
              <input type="number" min={0} step="any" required value={total} onChange={e => setTotal(e.target.value)}
                placeholder="0.00" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">สถานะการชำระ</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="รอชำระเงิน">⏳ รอชำระเงิน</option>
                <option value="ชำระแล้ว">✅ ชำระแล้ว</option>
                <option value="ยกเลิก">❌ ยกเลิก</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '🚀 บันทึกรายการขาย'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl bg-slate-200 hover:bg-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ตารางรายการขาย */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-extrabold text-slate-800 mb-4">📋 ประวัติการขายทั้งหมด ({sales.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">เลขที่ออเดอร์</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3">สินค้า</th>
                <th className="p-3">จำนวน</th>
                <th className="p-3">ยอดรวม</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-indigo-600">{s.id}</td>
                  <td className="p-3 font-bold text-slate-800">{s.customer}</td>
                  <td className="p-3 text-slate-600">{s.product}</td>
                  <td className="p-3">{s.qty}</td>
                  <td className="p-3 font-extrabold text-slate-900">{s.total.toLocaleString()} ฿</td>
                  <td className="p-3 text-slate-500 text-xs">{s.date}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${statusStyle[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => startEdit(s)} className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                      <button onClick={() => setConfirmDel(s)} className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">ลบ</button>
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
            <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบรายการขาย</h3>
            <p className="text-xs text-slate-500">ต้องการลบออเดอร์ {confirmDel.id} ใช่หรือไม่?</p>
            <div className="flex gap-2.5 pt-1">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold">ยกเลิก</button>
              <button onClick={doDelete} className="flex-1 rounded-xl bg-red-500 text-white py-3 text-xs font-bold">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}