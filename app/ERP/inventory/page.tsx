'use client'
import { useState } from 'react'

export default function InventoryPage() {
  const [items, setItems] = useState([
    { id: 'SKU-001', name: 'ไม้สักแผ่นพรีเมียม', category: 'วัตถุดิบ', qty: 150, minQty: 20, unit: 'แผ่น', price: 1200 },
    { id: 'SKU-002', name: 'ตะปูควง 2 นิ้ว', category: 'วัสดุสิ้นเปลือง', qty: 12, minQty: 50, unit: 'กล่อง', price: 85 },
    { id: 'SKU-003', name: 'โครงเหล็กโต๊ะทำงาน', category: 'ชิ้นส่วน', qty: 45, minQty: 10, unit: 'ชุด', price: 2500 },
    { id: 'SKU-004', name: 'เบาะหนังเทียมสีดำ', category: 'วัตถุดิบ', qty: 8, minQty: 15, unit: 'ชิ้น', price: 650 },
  ])

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('วัตถุดิบ')
  const [qty, setQty] = useState(0)
  const [minQty, setMinQty] = useState(10)
  const [unit, setUnit] = useState('ชิ้น')
  const [price, setPrice] = useState(0)
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setCategory('วัตถุดิบ')
    setQty(0)
    setMinQty(10)
    setUnit('ชิ้น')
    setPrice(0)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setItems(items.map(i => i.id === editingId ? {
        ...i, name, category, qty: Number(qty), minQty: Number(minQty), unit, price: Number(price)
      } : i))
      notify('อัปเดตข้อมูลสินค้าสำเร็จ')
    } else {
      const newItem = {
        id: `SKU-00${items.length + 1}`,
        name,
        category,
        qty: Number(qty),
        minQty: Number(minQty),
        unit,
        price: Number(price),
      }
      setItems([newItem, ...items])
      notify('เพิ่มสินค้าในคลังสำเร็จ')
    }
    resetForm()
  }

  function startEdit(i) {
    setEditingId(i.id)
    setName(i.name)
    setCategory(i.category)
    setQty(i.qty)
    setMinQty(i.minQty)
    setUnit(i.unit)
    setPrice(i.price)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function adjustQty(id, amount) {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + amount)
        return { ...item, qty: newQty }
      }
      return item
    }))
    notify('ปรับปรุงจำนวนสต็อกเรียบร้อย')
  }

  function doDelete() {
    setItems(items.filter(i => i.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบสินค้าออกจากระบบเรียบร้อย')
  }

  const filtered = items.filter(i =>
    [i.id, i.name, i.category].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">📦 ระบบคลังสินค้า (Inventory & Stock)</h1>
        <p className="text-xs text-slate-500 mt-0.5">ควบคุมสต็อกวัตถุดิบและสินค้าสำเร็จรูป พร้อมแจ้งเตือนเมื่อสินค้าใกล้หมด</p>
      </header>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มรายการสินค้า / วัตถุดิบใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อสินค้า / วัตถุดิบ</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="เช่น แผ่นไม้ MDF" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">หมวดหมู่</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="วัตถุดิบ">🪵 วัตถุดิบ (Raw Material)</option>
                <option value="ชิ้นส่วน">⚙️ ชิ้นส่วน (Components)</option>
                <option value="วัสดุสิ้นเปลือง">🔩 วัสดุสิ้นเปลือง (Supplies)</option>
                <option value="สินค้าสำเร็จรูป">📦 สินค้าสำเร็จรูป (Finished Goods)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวนเริ่มต้น</label>
              <input type="number" min={0} required value={qty} onChange={e => setQty(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">จุดเตือนขั้นต่ำ (Min Qty)</label>
              <input type="number" min={1} required value={minQty} onChange={e => setMinQty(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">หน่วยนับ</label>
              <input type="text" required value={unit} onChange={e => setUnit(e.target.value)}
                placeholder="ชิ้น, กล่อง, แผ่น" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ราคาต่อหน่วย (บาท)</label>
              <input type="number" min={0} required value={price} onChange={e => setPrice(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกสินค้าลงคลัง'}
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
          <h3 className="font-extrabold text-slate-800">📋 คลังสินค้าทั้งหมด ({filtered.length})</h3>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ค้นหารหัส, ชื่อ, หมวดหมู่..."
            className="w-full sm:w-72 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">รหัส SKU</th>
                <th className="p-3">ชื่อสินค้า</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3">คงเหลือ</th>
                <th className="p-3">ราคา/หน่วย</th>
                <th className="p-3 text-center">สถานะสต็อก</th>
                <th className="p-3 text-center rounded-tr-2xl">ปรับสต็อก / จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500 italic">ไม่พบข้อมูลสินค้าในคลัง</td></tr>
              ) : (
                filtered.map(i => {
                  const isLow = i.qty <= i.minQty
                  return (
                    <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-indigo-600">{i.id}</td>
                      <td className="p-3 font-bold text-slate-800">{i.name}</td>
                      <td className="p-3 text-slate-600">{i.category}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {i.qty} <span className="text-xs font-normal text-slate-500">{i.unit}</span>
                      </td>
                      <td className="p-3 text-slate-600">{i.price.toLocaleString()} ฿</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-600 animate-pulse">
                            ⚠️ ใกล้หมด
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">
                            ปกติ
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => adjustQty(i.id, -1)} title="ลด 1" className="w-7 h-7 font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg">-</button>
                          <button onClick={() => adjustQty(i.id, 1)} title="เพิ่ม 1" className="w-7 h-7 font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg">+</button>
                          <button onClick={() => startEdit(i)} className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️</button>
                          <button onClick={() => setConfirmDel(i)} className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบสินค้า</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบ {confirmDel.name} ใช่หรือไม่?</p>
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