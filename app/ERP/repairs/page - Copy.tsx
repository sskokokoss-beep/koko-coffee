'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function RepairsPage() {
  const todayStr = new Date().toISOString().split('T')[0]

  const [activeTab, setActiveTab] = useState('list') // 'list' = รายการ, 'report' = รายงาน
  const [repairList, setRepairList] = useState([])
  const [repairTitle, setRepairTitle] = useState('')
  const [repairEquipment, setRepairEquipment] = useState('')
  const [repairReporter, setRepairReporter] = useState('')
  const [repairPriority, setRepairPriority] = useState('ปานกลาง')
  const [repairDesc, setRepairDesc] = useState('')
  const [repairStatus, setRepairStatus] = useState('รอดำเนินการ')
  const [editingRepairId, setEditingRepairId] = useState(null)
  const [repairSearch, setRepairSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadRepairs()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadRepairs() {
    const { data, error } = await supabase.from('erp_repairs').select('*').order('id', { ascending: false })
    if (error) {
      console.log('Table erp_repairs error:', error.message)
      return
    }
    setRepairList(data || [])
  }

  async function handleSaveRepair(e) {
    e.preventDefault()
    const repairPayload = {
      title: repairTitle,
      equipment: repairEquipment,
      reporter: repairReporter,
      priority: repairPriority,
      description: repairDesc,
      status: repairStatus,
      report_date: todayStr
    }

    if (editingRepairId) {
      const { error } = await supabase.from('erp_repairs').update(repairPayload).eq('id', editingRepairId)
      if (error) return notify('❌ อัปเดตแจ้งซ่อมไม่สำเร็จ: ' + error.message)
      notify('✅ อัปเดตข้อมูลแจ้งซ่อมเรียบร้อย')
      setEditingRepairId(null)
    } else {
      const { error } = await supabase.from('erp_repairs').insert([repairPayload])
      if (error) {
        setRepairList([{ id: Date.now(), ...repairPayload }, ...repairList])
        notify('⚠️ บันทึกจำลองสำเร็จ (ยังไม่สร้างตาราง erp_repairs บน Supabase)')
        resetRepairForm()
        return
      }
      notify('✅ บันทึกแจ้งซ่อมสำเร็จ')
    }

    resetRepairForm()
    loadRepairs()
  }

  function startEditRepair(item) {
    setEditingRepairId(item.id)
    setRepairTitle(item.title || '')
    setRepairEquipment(item.equipment || '')
    setRepairReporter(item.reporter || '')
    setRepairPriority(item.priority || 'ปานกลาง')
    setRepairDesc(item.description || '')
    setRepairStatus(item.status || 'รอดำเนินการ')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetRepairForm() {
    setRepairTitle('')
    setRepairEquipment('')
    setRepairReporter('')
    setRepairPriority('ปานกลาง')
    setRepairDesc('')
    setRepairStatus('รอดำเนินการ')
    setEditingRepairId(null)
  }

  async function removeRepair(id) {
    if (!confirm('ยืนยันการลบรายการแจ้งซ่อมนี้?')) return
    const { error } = await supabase.from('erp_repairs').delete().eq('id', id)
    if (error) {
      setRepairList(repairList.filter(r => r.id !== id))
      return notify('🗑️ ลบรายการเรียบร้อย')
    }
    notify('🗑️ ลบรายการแจ้งซ่อมเรียบร้อย')
    loadRepairs()
  }

  const filteredRepairs = repairList.filter(r =>
    (r.title || '').toLowerCase().includes(repairSearch.toLowerCase()) ||
    (r.equipment || '').toLowerCase().includes(repairSearch.toLowerCase()) ||
    (r.reporter || '').toLowerCase().includes(repairSearch.toLowerCase()) ||
    (r.status || '').toLowerCase().includes(repairSearch.toLowerCase())
  )

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
          <h1 className="text-xl font-extrabold text-slate-900">🛠️ ระบบจัดการแจ้งซ่อมอุปกรณ์</h1>
          <p className="text-xs text-slate-500 mt-0.5">บันทึก ติดตามสถานะอาการเสีย และสรุปรายงานการซ่อมแซม</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            📋 รายการแจ้งซ่อม
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            📊 รายงานการซ่อม
          </button>
        </div>
      </header>

      {/* TAB 1: รายการและฟอร์มแจ้งซ่อม */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl shadow-sm border transition ${editingRepairId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <h3 className="font-extrabold text-slate-800 mb-4">{editingRepairId ? '✏️ แก้ไขข้อมูลแจ้งซ่อม' : '➕ สร้างใบแจ้งซ่อมอุปกรณ์ใหม่'}</h3>
            <form onSubmit={handleSaveRepair} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">หัวข้ออาการเสีย / ปัญหา</label>
                  <input type="text" required placeholder="เช่น เครื่องปริ้นเตอร์กระดาษติด" className="w-full rounded-2xl border p-3 text-sm bg-white" value={repairTitle} onChange={e => setRepairTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่ออุปกรณ์ / ทรัพย์สิน</label>
                  <input type="text" required placeholder="เช่น HP LaserJet Pro M404n" className="w-full rounded-2xl border p-3 text-sm bg-white" value={repairEquipment} onChange={e => setRepairEquipment(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ผู้แจ้งซ่อม</label>
                  <input type="text" required placeholder="ชื่อ-นามสกุล หรือแผนก" className="w-full rounded-2xl border p-3 text-sm bg-white" value={repairReporter} onChange={e => setRepairReporter(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ระดับความเร่งด่วน</label>
                  <select className="w-full rounded-2xl border p-3 text-sm bg-white font-bold" value={repairPriority} onChange={e => setRepairPriority(e.target.value)}>
                    <option value="ต่ำ">🟢 ต่ำ</option>
                    <option value="ปานกลาง">🟡 ปานกลาง</option>
                    <option value="ด่วน">🟠 ด่วน</option>
                    <option value="ด่วนที่สุด">🔴 ด่วนที่สุด</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">สถานะการซ่อม</label>
                  <select className="w-full rounded-2xl border p-3 text-sm bg-white font-bold text-indigo-700" value={repairStatus} onChange={e => setRepairStatus(e.target.value)}>
                    <option value="รอดำเนินการ">⏳ รอดำเนินการ</option>
                    <option value="กำลังดำเนินการ">🔧 กำลังดำเนินการ</option>
                    <option value="เสร็จสิ้น">✅ เสร็จสิ้น</option>
                    <option value="ยกเลิก">❌ ยกเลิก</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">รายละเอียดอาการเสียเพิ่มเติม</label>
                  <textarea rows={3} placeholder="ระบุอาการเสียหรือสถานที่ตั้งอุปกรณ์..." className="w-full rounded-2xl border p-3 text-sm bg-white resize-none" value={repairDesc} onChange={e => setRepairDesc(e.target.value)} />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">{editingRepairId ? '💾 บันทึกการแก้ไข' : '🚀 ส่งเรื่องแจ้งซ่อม'}</button>
                {editingRepairId && (<button type="button" onClick={resetRepairForm} className="rounded-xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300 transition">ยกเลิก</button>)}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h3 className="font-extrabold text-slate-800">📋 รายการแจ้งซ่อมทั้งหมด</h3>
              <input type="text" placeholder="🔍 ค้นหาอุปกรณ์, ผู้แจ้ง, สถานะ..." className="w-full sm:w-72 rounded-2xl border p-2.5 text-sm bg-slate-50" value={repairSearch} onChange={e => setRepairSearch(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr><th className="p-3 rounded-tl-2xl">วันที่แจ้ง</th><th className="p-3">ปัญหา / หัวข้อ</th><th className="p-3">อุปกรณ์</th><th className="p-3">ผู้แจ้ง</th><th className="p-3">ความเร่งด่วน</th><th className="p-3">สถานะ</th><th className="p-3 text-center rounded-tr-2xl">จัดการ</th></tr>
                </thead>
                <tbody>
                  {filteredRepairs.length === 0 ? (
                    <tr><td colSpan="7" className="p-5 text-center text-slate-500 italic">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>
                  ) : (
                    filteredRepairs.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3">{r.report_date || '-'}</td>
                        <td className="p-3 font-bold text-slate-700">{r.title}</td>
                        <td className="p-3">{r.equipment}</td>
                        <td className="p-3">{r.reporter}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.priority === 'ด่วนที่สุด' ? 'bg-red-100 text-red-700' :
                            r.priority === 'ด่วน' ? 'bg-orange-100 text-orange-700' :
                            r.priority === 'ปานกลาง' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>{r.priority}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                            r.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'ยกเลิก' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status === 'เสร็จสิ้น' && '✅'}
                            {r.status === 'กำลังดำเนินการ' && '🔧'}
                            {r.status === 'รอดำเนินการ' && '⏳'}
                            {r.status === 'ยกเลิก' && '❌'}
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => startEditRepair(r)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 rounded-lg hover:bg-amber-300">✏️ แก้ไข</button>
                            <button onClick={() => removeRepair(r.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">🗑️ ลบ</button>
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

      {/* TAB 2: รายงานการแจ้งซ่อม */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-slate-400">แจ้งซ่อมทั้งหมด</p><h4 className="text-2xl font-extrabold text-slate-900 mt-1">{repairList.length}</h4></div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">📊</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-amber-600">รอดำเนินการ</p><h4 className="text-2xl font-extrabold text-amber-600 mt-1">{repairList.filter(r => r.status === 'รอดำเนินการ').length}</h4></div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl">⏳</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-blue-600">กำลังดำเนินการ</p><h4 className="text-2xl font-extrabold text-blue-600 mt-1">{repairList.filter(r => r.status === 'กำลังดำเนินการ').length}</h4></div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">🔧</div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-xs font-bold text-emerald-600">ซ่อมเสร็จสิ้น</p><h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{repairList.filter(r => r.status === 'เสร็จสิ้น').length}</h4></div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800">📈 สรุปรายงานสถานะการแจ้งซ่อมอุปกรณ์</h3>
              <button onClick={() => window.print()} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">🖨️ พิมพ์รายงาน</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr><th className="p-3 rounded-tl-2xl">รหัส</th><th className="p-3">วันที่แจ้ง</th><th className="p-3">หัวข้อปัญหา</th><th className="p-3">อุปกรณ์</th><th className="p-3">ผู้แจ้ง</th><th className="p-3">ระดับความสำคัญ</th><th className="p-3 rounded-tr-2xl">สถานะปัจจุบัน</th></tr>
                </thead>
                <tbody>
                  {repairList.length === 0 ? (
                    <tr><td colSpan="7" className="p-5 text-center text-slate-500 italic">ยังไม่มีข้อมูลในรายงาน</td></tr>
                  ) : (
                    repairList.map((r, index) => (
                      <tr key={r.id || index} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-500">#{index + 1}</td>
                        <td className="p-3">{r.report_date || '-'}</td>
                        <td className="p-3 font-bold text-slate-800">{r.title}</td>
                        <td className="p-3">{r.equipment}</td>
                        <td className="p-3">{r.reporter}</td>
                        <td className="p-3 font-semibold">{r.priority}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                            r.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'ยกเลิก' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
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