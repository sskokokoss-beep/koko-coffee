'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function ManufacturingPage() {
  const todayStr = new Date().toISOString().split('T')[0]
  const [activeTab, setActiveTab] = useState('orders') // 'orders' = ใบสั่งผลิต, 'bom' = สูตรการผลิต, 'report' = รายงาน

  // States สำหรับใบสั่งผลิต (Production Orders)
  const [orders, setOrders] = useState([])
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [dueDate, setDueDate] = useState(todayStr)
  const [status, setStatus] = useState('รอดำเนินการ')
  const [editingOrderId, setEditingOrderId] = useState(null)

  // States สำหรับสูตรการผลิต (BOM)
  const [boms, setBoms] = useState([])
  const [bomProduct, setBomProduct] = useState('')
  const [bomMaterials, setBomMaterials] = useState('')
  const [editingBomId, setEditingBomId] = useState(null)

  const [toast, setToast] = useState('')

  useEffect(() => {
    loadOrders()
    loadBoms()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadOrders() {
    const { data, error } = await supabase.from('erp_production_orders').select('*').order('id', { ascending: false })
    if (!error && data) setOrders(data)
  }

  async function loadBoms() {
    const { data, error } = await supabase.from('erp_boms').select('*').order('id', { ascending: false })
    if (!error && data) setBoms(data)
  }

  // จัดการใบสั่งผลิต
  async function handleSaveOrder(e) {
    e.preventDefault()
    const payload = { product_name: productName, quantity: Number(quantity), due_date: dueDate, status }

    if (editingOrderId) {
      const { error } = await supabase.from('erp_production_orders').update(payload).eq('id', editingOrderId)
      if (error) return notify('❌ อัปเดตใบสั่งผลิตไม่สำเร็จ: ' + error.message)
      notify('✅ อัปเดตใบสั่งผลิตเรียบร้อย')
      setEditingOrderId(null)
    } else {
      const { error } = await supabase.from('erp_production_orders').insert([payload])
      if (error) {
        setOrders([{ id: Date.now(), ...payload }, ...orders])
        notify('⚠️ บันทึกจำลองสำเร็จ (ยังไม่สร้างตาราง erp_production_orders บน Supabase)')
        resetOrderForm()
        return
      }
      notify('✅ สร้างใบสั่งผลิตสำเร็จ')
    }
    resetOrderForm()
    loadOrders()
  }

  function startEditOrder(item) {
    setEditingOrderId(item.id)
    setProductName(item.product_name || '')
    setQuantity(item.quantity || '1')
    setDueDate(item.due_date || todayStr)
    setStatus(item.status || 'รอดำเนินการ')
  }

  function resetOrderForm() {
    setProductName('')
    setQuantity('1')
    setDueDate(todayStr)
    setStatus('รอดำเนินการ')
    setEditingOrderId(null)
  }

  async function removeOrder(id) {
    if (!confirm('ยืนยันการลบใบสั่งผลิตนี้?')) return
    const { error } = await supabase.from('erp_production_orders').delete().eq('id', id)
    if (error) {
      setOrders(orders.filter(o => o.id !== id))
      return notify('🗑️ ลบรายการเรียบร้อย')
    }
    notify('🗑️ ลบใบสั่งผลิตเรียบร้อย')
    loadOrders()
  }

  // จัดการสูตรการผลิต (BOM)
  async function handleSaveBom(e) {
    e.preventDefault()
    const payload = { product_name: bomProduct, materials: bomMaterials }

    if (editingBomId) {
      const { error } = await supabase.from('erp_boms').update(payload).eq('id', editingBomId)
      if (error) return notify('❌ แก้ไขสูตรไม่สำเร็จ: ' + error.message)
      notify('✅ อัปเดตสูตรการผลิตเรียบร้อย')
      setEditingBomId(null)
    } else {
      const { error } = await supabase.from('erp_boms').insert([payload])
      if (error) {
        setBoms([{ id: Date.now(), ...payload }, ...boms])
        notify('⚠️ บันทึกสูตรจำลองสำเร็จ (ยังไม่สร้างตาราง erp_boms บน Supabase)')
        resetBomForm()
        return
      }
      notify('✅ เพิ่มสูตรการผลิตสำเร็จ')
    }
    resetBomForm()
    loadBoms()
  }

  function startEditBom(bom) {
    setEditingBomId(bom.id)
    setBomProduct(bom.product_name || '')
    setBomMaterials(bom.materials || '')
  }

  function resetBomForm() {
    setBomProduct('')
    setBomMaterials('')
    setEditingBomId(null)
  }

  async function removeBom(id) {
    if (!confirm('ยืนยันการลบสูตรการผลิตนี้?')) return
    const { error } = await supabase.from('erp_boms').delete().eq('id', id)
    if (error) {
      setBoms(boms.filter(b => b.id !== id))
      return notify('🗑️ ลบสูตรเรียบร้อย')
    }
    notify('🗑️ ลบสูตรการผลิตเรียบร้อย')
    loadBoms()
  }

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">🏭 ระบบผลิตสินค้า (Manufacturing)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ควบคุมสูตรการผลิต ใบสั่งผลิต และติดตามสถานะไลน์การผลิตสินค้า</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            📋 ใบสั่งผลิต (Work Orders)
          </button>
          <button 
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'bom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            📦 สูตรการผลิต (BOM)
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            📊 รายงานการผลิต
          </button>
        </div>
      </header>

      {/* TAB 1: ใบสั่งผลิต (Production Orders) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl shadow-sm border transition ${editingOrderId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <h3 className="font-extrabold text-slate-800 mb-4">{editingOrderId ? '✏️ แก้ไขใบสั่งผลิต' : '➕ สร้างใบสั่งผลิตสินค้าใหม่'}</h3>
            <form onSubmit={handleSaveOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อสินค้าสำเร็จรูป</label>
                  <input type="text" required placeholder="เช่น ชุดโต๊ะทำงานออฟฟิศ รุ่น A1" className="w-full rounded-2xl border p-3 text-sm bg-white" value={productName} onChange={e => setProductName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวนที่ผลิต (หน่วย)</label>
                  <input type="number" min="1" required className="w-full rounded-2xl border p-3 text-sm bg-white text-center" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">กำหนดเสร็จ (Due Date)</label>
                  <input type="date" required className="w-full rounded-2xl border p-3 text-sm bg-white" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">สถานะการผลิต</label>
                  <select className="w-full rounded-2xl border p-3 text-sm bg-white font-bold text-indigo-700" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="รอดำเนินการ">⏳ รอดำเนินการ</option>
                    <option value="กำลังผลิต">⚙️ กำลังผลิต</option>
                    <option value="ผลิตเสร็จสิ้น">✅ ผลิตเสร็จสิ้น</option>
                    <option value="ยกเลิก">❌ ยกเลิก</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">{editingOrderId ? '💾 บันทึกการแก้ไข' : '🚀 ออกใบสั่งผลิต'}</button>
                {editingOrderId && (<button type="button" onClick={resetOrderForm} className="rounded-xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300 transition">ยกเลิก</button>)}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-slate-800 mb-4">📋 รายการใบสั่งผลิตทั้งหมด ({orders.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr><th className="p-3 rounded-tl-2xl">กำหนดเสร็จ</th><th className="p-3">สินค้าสำเร็จรูป</th><th className="p-3 text-center">จำนวนผลิต</th><th className="p-3">สถานะ</th><th className="p-3 text-center rounded-tr-2xl">จัดการ</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="5" className="p-5 text-center text-slate-500 italic">ยังไม่มีใบสั่งผลิตในระบบ</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3">{o.due_date}</td>
                        <td className="p-3 font-bold text-slate-800">{o.product_name}</td>
                        <td className="p-3 text-center font-bold text-indigo-600">{o.quantity}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                            o.status === 'ผลิตเสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'กำลังผลิต' ? 'bg-blue-100 text-blue-800' :
                            o.status === 'ยกเลิก' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>{o.status}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => startEditOrder(o)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 rounded-lg hover:bg-amber-300">✏️ แก้ไข</button>
                            <button onClick={() => removeOrder(o.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">🗑️ ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: สูตรการผลิต (BOM) */}
      {activeTab === 'bom' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl shadow-sm border transition ${editingBomId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <h3 className="font-extrabold text-slate-800 mb-4">{editingBomId ? '✏️ แก้ไขสูตรการผลิต (BOM)' : '📦 เพิ่มสูตรการผลิตสินค้า (BOM)'}</h3>
            <form onSubmit={handleSaveBom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อสินค้าสำเร็จรูป</label>
                  <input type="text" required placeholder="เช่น เก้าอี้สำนักงานพนักพิงสูง" className="w-full rounded-2xl border p-3 text-sm bg-white" value={bomProduct} onChange={e => setBomProduct(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">วัตถุดิบและส่วนประกอบที่ใช้ (BOM)</label>
                  <input type="text" required placeholder="เช่น ขาเหล็ก 1 ชิ้น, เบาะนั่ง 1 ชิ้น, ล้อ 5 ชิ้น" className="w-full rounded-2xl border p-3 text-sm bg-white" value={bomMaterials} onChange={e => setBomMaterials(e.target.value)} />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">{editingBomId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกสูตร BOM'}</button>
                {editingBomId && (<button type="button" onClick={resetBomForm} className="rounded-xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300 transition">ยกเลิก</button>)}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-slate-800 mb-4">📋 รายการสูตรการผลิตทั้งหมด ({boms.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr><th className="p-3 rounded-tl-2xl">ชื่อสินค้าสำเร็จรูป</th><th className="p-3">วัตถุดิบและส่วนประกอบ (BOM)</th><th className="p-3 text-center rounded-tr-2xl">จัดการ</th></tr>
                </thead>
                <tbody>
                  {boms.length === 0 ? (
                    <tr><td colSpan="3" className="p-5 text-center text-slate-500 italic">ยังไม่มีสูตรการผลิตในระบบ</td></tr>
                  ) : (
                    boms.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{b.product_name}</td>
                        <td className="p-3 text-slate-600">{b.materials}</td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => startEditBom(b)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 rounded-lg hover:bg-amber-300">✏️ แก้ไข</button>
                            <button onClick={() => removeBom(b.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">🗑️ ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: รายงานการผลิต */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-slate-400">ใบสั่งผลิตทั้งหมด</p><h4 className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</h4></div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">📊</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-amber-600">รอดำเนินการ</p><h4 className="text-2xl font-extrabold text-amber-600 mt-1">{orders.filter(o => o.status === 'รอดำเนินการ').length}</h4></div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl">⏳</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-blue-600">กำลังผลิต</p><h4 className="text-2xl font-extrabold text-blue-600 mt-1">{orders.filter(o => o.status === 'กำลังผลิต').length}</h4></div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">⚙️</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-emerald-600">ผลิตเสร็จสิ้น</p><h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{orders.filter(o => o.status === 'ผลิตเสร็จสิ้น').length}</h4></div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800">📈 สรุปรายงานสถานะใบสั่งผลิต</h3>
              <button onClick={() => window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">🖨️ พิมพ์รายงาน</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr><th className="p-3 rounded-tl-2xl">รหัส</th><th className="p-3">กำหนดเสร็จ</th><th className="p-3">สินค้าสำเร็จรูป</th><th className="p-3 text-center">จำนวนผลิต</th><th className="p-3 rounded-tr-2xl">สถานะปัจจุบัน</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="5" className="p-5 text-center text-slate-500 italic">ยังไม่มีข้อมูลในรายงาน</td></tr>
                  ) : (
                    orders.map((o, index) => (
                      <tr key={o.id || index} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-500">#{index + 1}</td>
                        <td className="p-3">{o.due_date}</td>
                        <td className="p-3 font-bold text-slate-800">{o.product_name}</td>
                        <td className="p-3 text-center font-bold text-indigo-600">{o.quantity}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                            o.status === 'ผลิตเสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'กำลังผลิต' ? 'bg-blue-100 text-blue-800' :
                            o.status === 'ยกเลิก' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>{o.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}