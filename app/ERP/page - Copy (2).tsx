'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function ERPDashboardPage() {
  const [docCount, setDocCount] = useState(0)
  const [repairCount, setRepairCount] = useState(0)
  const [pendingRepairs, setPendingRepairs] = useState(0)
  const [recentDocs, setRecentDocs] = useState([])
  const [recentRepairs, setRecentRepairs] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    // โหลดจำนวนและข้อมูลเอกสาร
    const { data: docs, error: docErr } = await supabase.from('erp_documents').select('*').order('id', { ascending: false })
    if (!docErr && docs) {
      setDocCount(docs.length)
      setRecentDocs(docs.slice(0, 5)) // แสดง 5 รายการล่าสุด
    }

    // โหลดจำนวนและข้อมูลแจ้งซ่อม
    const { data: repairs, error: repErr } = await supabase.from('erp_repairs').select('*').order('id', { ascending: false })
    if (!repErr && repairs) {
      setRepairCount(repairs.length)
      setPendingRepairs(repairs.filter(r => r.status === 'รอดำเนินการ' || r.status === 'กำลังดำเนินการ').length)
      setRecentRepairs(repairs.slice(0, 5)) // แสดง 5 รายการล่าสุด
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">👋 ยินดีต้อนรับสู่ระบบ Enterprise ERP</h1>
          <p className="text-xs text-slate-500 mt-1">ภาพรวมการจัดการเอกสารธุรกิจ ใบกำกับภาษี และระบบแจ้งซ่อมอุปกรณ์ภายในองค์กร</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ERP/documents" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm">
            📄 ไปหน้าออกเอกสาร
          </Link>
          <Link href="/ERP/repairs" className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm">
            🛠️ ไปหน้าแจ้งซ่อม
          </Link>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">เอกสารทั้งหมด</p>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{docCount}</h4>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">📁</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">งานแจ้งซ่อมทั้งหมด</p>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{repairCount}</h4>
          </div>
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">🛠️</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600">งานซ่อมที่ต้องดำเนินงาน</p>
            <h4 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingRepairs}</h4>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">⏳</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600">สถานะระบบ</p>
            <h4 className="text-lg font-extrabold text-emerald-600 mt-2">🟢 พร้อมใช้งาน</h4>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🚀</div>
        </div>
      </div>

      {/* Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* เอกสารล่าสุด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">📄 เอกสารธุรกิจล่าสุด</h3>
            <Link href="/ERP/documents" className="text-xs font-bold text-indigo-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr><th className="p-3 rounded-l-xl">วันที่</th><th className="p-3">เลขเอกสาร</th><th className="p-3">ลูกค้า</th><th className="p-3 text-right rounded-r-xl">ยอดรวม</th></tr>
              </thead>
              <tbody>
                {recentDocs.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-slate-400 italic">ยังไม่มีประวัติเอกสาร</td></tr>
                ) : (
                  recentDocs.map(d => (
                    <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">{d.doc_date}</td>
                      <td className="p-3 font-bold text-indigo-600">{d.doc_no}</td>
                      <td className="p-3 truncate max-w-[150px]">{d.customer_name}</td>
                      <td className="p-3 text-right font-bold">{Number(d.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* แจ้งซ่อมล่าสุด */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">🛠️ รายการแจ้งซ่อมล่าสุด</h3>
            <Link href="/ERP/repairs" className="text-xs font-bold text-indigo-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr><th className="p-3 rounded-l-xl">วันที่</th><th className="p-3">ปัญหา / หัวข้อ</th><th className="p-3">อุปกรณ์</th><th className="p-3 text-center rounded-r-xl">สถานะ</th></tr>
              </thead>
              <tbody>
                {recentRepairs.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-slate-400 italic">ยังไม่มีข้อมูลแจ้งซ่อม</td></tr>
                ) : (
                  recentRepairs.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">{r.report_date || '-'}</td>
                      <td className="p-3 font-bold text-slate-700">{r.title}</td>
                      <td className="p-3 truncate max-w-[120px]">{r.equipment}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          r.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-800' :
                          r.status === 'ยกเลิก' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}