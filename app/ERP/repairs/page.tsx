'use client'
import { useState } from 'react'

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([
    { id: 'REP-001', title: 'เครื่องปริ้นเตอร์กระดาษติด', asset: 'HP LaserJet Pro M404n', reporter: 'สมชาย ใจดี', priority: 'ปานกลาง', status: 'รอดำเนินการ', desc: 'กระดาษติดในชุดความร้อน พิมพ์ไม่ได้เลย' },
    { id: 'REP-002', title: 'แอร์ห้องประชุมใหญ่ไม่เย็น', asset: 'Daikin Inverter 24,000 BTU', reporter: 'วิชัย มั่นคง', priority: 'สูง', status: 'กำลังซ่อม', desc: 'มีลมออกแต่ไม่เย็น มีน้ำหยดเล็กน้อย' },
  ])

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [asset, setAsset] = useState('')
  const [reporter, setReporter] = useState('')
  const [priority, setPriority] = useState('ปานกลาง')
  const [status, setStatus] = useState('รอดำเนินการ')
  const [desc, setDesc] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setAsset('')
    setReporter('')
    setPriority('ปานกลาง')
    setStatus('รอดำเนินการ')
    setDesc('')
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setRepairs(repairs.map(r => r.id === editingId ? {
        ...r, title, asset, reporter, priority, status, desc
      } : r))
      notify('อัปเดตข้อมูลการแจ้งซ่อมสำเร็จ')
    } else {
      const newRepair = {
        id: `REP-00${repairs.length + 1}`,
        title,
        asset,
        reporter,
        priority,
        status,
        desc,
      }
      setRepairs([newRepair, ...repairs])
      notify('ส่งเรื่องแจ้งซ่อมสำเร็จ')
    }
    resetForm()
  }

  function startEdit(r) {
    setEditingId(r.id)
    setTitle(r.title)
    setAsset(r.asset)
    setReporter(r.reporter)
    setPriority(r.priority)
    setStatus(r.status)
    setDesc(r.desc)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateStatus(id, newStatus) {
    setRepairs(repairs.map(r => r.id === id ? { ...r, status: newStatus } : r))
    notify(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อย`)
  }

  function doDelete() {
    setRepairs(repairs.filter(r => r.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบรายการแจ้งซ่อมเรียบร้อย')
  }

  const priorityStyle = {
    'ต่ำ': 'bg-slate-100 text-slate-700',
    'ปานกลาง': 'bg-amber-100 text-amber-700',
    'สูง': 'bg-orange-100 text-orange-700',
    'เร่งด่วนที่สุด': 'bg-red-100 text-red-600 animate-pulse',
  }

  const statusStyle = {
    'รอดำเนินการ': 'bg-amber-100 text-amber-700',
    'กำลังซ่อม': 'bg-blue-100 text-blue-700',
    'ซ่อมเสร็จแล้ว': 'bg-emerald-100 text-emerald-700',
    'ยกเลิก': 'bg-slate-100 text-slate-500',
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">🛠️ ระบบแจ้งซ่อมอุปกรณ์ (Repair & Maintenance)</h1>
        <p className="text-xs text-slate-500 mt-0.5">บันทึก ติดตามสถานะอาการเสีย และสรุปรายงานการซ่อมแซมทรัพย์สินในองค์กร</p>
      </header>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขใบแจ้งซ่อม' : '➕ สร้างใบแจ้งซ่อมอุปกรณ์ใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">หัวข้ออาการเสีย / ปัญหา</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="เช่น เครื่องปริ้นเตอร์กระดาษติด" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่ออุปกรณ์ / ทรัพย์สิน</label>
              <input type="text" required value={asset} onChange={e => setAsset(e.target.value)}
                placeholder="เช่น HP LaserJet Pro M404n" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ผู้แจ้งซ่อม</label>
              <input type="text" required value={reporter} onChange={e => setReporter(e.target.value)}
                placeholder="ชื่อ-นามสกุล หรือแผนก" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ระดับความเร่งด่วน</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="ต่ำ">🟢 ต่ำ</option>
                <option value="ปานกลาง">🟡 ปานกลาง</option>
                <option value="สูง">🟠 สูง</option>
                <option value="เร่งด่วนที่สุด">🔴 เร่งด่วนที่สุด</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">สถานะการซ่อม</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="รอดำเนินการ">⏳ รอดำเนินการ</option>
                <option value="กำลังซ่อม">🔧 กำลังซ่อม</option>
                <option value="ซ่อมเสร็จแล้ว">✅ ซ่อมเสร็จแล้ว</option>
                <option value="ยกเลิก">❌ ยกเลิก</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600 mb-1 block">รายละเอียดอาการเสียเพิ่มเติม</label>
              <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="ระบุอาการเสียหรือสถานที่ตั้งอุปกรณ์..." className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '🚀 ส่งเรื่องแจ้งซ่อม'}
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
        <h3 className="font-extrabold text-slate-800 mb-4">📋 รายการแจ้งซ่อมทั้งหมด ({repairs.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">รหัส</th>
                <th className="p-3">ปัญหา / หัวข้อ</th>
                <th className="p-3">อุปกรณ์</th>
                <th className="p-3">ผู้แจ้ง</th>
                <th className="p-3">ความเร่งด่วน</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ / เปลี่ยนสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-indigo-600">{r.id}</td>
                  <td className="p-3 font-bold text-slate-800">{r.title}</td>
                  <td className="p-3 text-slate-600">{r.asset}</td>
                  <td className="p-3 text-slate-600">{r.reporter}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${priorityStyle[r.priority]}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => startEdit(r)} className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                      {r.status !== 'รอดำเนินการ' && (
                        <button onClick={() => updateStatus(r.id, 'รอดำเนินการ')} className="px-2 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg">รอ</button>
                      )}
                      {r.status !== 'กำลังซ่อม' && (
                        <button onClick={() => updateStatus(r.id, 'กำลังซ่อม')} className="px-2 py-1 text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg">ซ่อม</button>
                      )}
                      {r.status !== 'ซ่อมเสร็จแล้ว' && (
                        <button onClick={() => updateStatus(r.id, 'ซ่อมเสร็จแล้ว')} className="px-2 py-1 text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg">เสร็จ</button>
                      )}
                      <button onClick={() => setConfirmDel(r)} className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">ลบ</button>
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
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบรายการแจ้งซ่อม</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบ {confirmDel.id} ใช่หรือไม่?</p>
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