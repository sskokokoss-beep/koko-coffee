'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ERPDashboard() {
  const [userRole, setUserRole] = useState('admin')
  const [userEmail, setUserEmail] = useState('admin@erp.com')

  useEffect(() => {
    setUserEmail(localStorage.getItem('erp_user_email') || 'admin@erp.com')
    setUserRole(localStorage.getItem('erp_user_role') || 'admin')
  }, [])

  const stats = [
    { title: 'ยอดขายรวม (Sales)', value: '135,000 ฿', change: '+12.5%', isUp: true, icon: '💼', color: 'from-blue-600 to-indigo-600', link: '/ERP/sales' },
    { title: 'กำไรสุทธิ (Net Profit)', value: '68,500 ฿', change: '+8.2%', isUp: true, icon: '💰', color: 'from-emerald-600 to-teal-600', link: '/ERP/accounting' },
    { title: 'คลังสินค้าใกล้หมด', value: '1 รายการ', change: 'ต้องเติมสต็อก', isUp: false, icon: '📦', color: 'from-amber-500 to-orange-600', link: '/ERP/inventory' },
    { title: 'ใบสั่งผลิตรอดำเนินการ', value: '2 งาน', change: 'กำลังผลิตปกติ', isUp: true, icon: '🏭', color: 'from-violet-600 to-purple-600', link: '/ERP/manufacturing' },
  ]

  const quickActions = [
    { name: 'สร้างใบสั่งขาย', icon: '💼', href: '/ERP/sales', desc: 'บันทึกออเดอร์ลูกค้าใหม่' },
    { name: 'จัดการคลังสินค้า', icon: '📦', href: '/ERP/inventory', desc: 'ตรวจสอบและปรับปรุงสต็อก' },
    { name: 'บันทึกบัญชี', icon: '💰', href: '/ERP/accounting', desc: 'ตรวจสอบรายรับ-รายจ่าย' },
    { name: 'ออกใบกำกับภาษี', icon: '📄', href: '/ERP/documents', desc: 'สร้างเอกสารทางการค้า' },
  ]

  // กราฟวิเคราะห์เชิงลึกจำลองรายเดือน
  const monthlyData = [
    { month: 'ม.ค.', sales: 95000, profit: 42000 },
    { month: 'ก.พ.', sales: 110000, profit: 51000 },
    { month: 'มี.ค.', sales: 125000, profit: 58000 },
    { month: 'เม.ย.', sales: 105000, profit: 46000 },
    { month: 'พ.ค.', sales: 130000, profit: 62000 },
    { month: 'มิ.ย.', sales: 135000, profit: 68500 },
  ]

  const maxSales = Math.max(...monthlyData.map(d => d.sales))

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase">
              ✨ Enterprise Management System & RBAC Secured
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับกลับมา, <span className="text-indigo-400">{userEmail}</span> 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              ระบบเชื่อมโยงข้อมูลอัตโนมัติและควบคุมสิทธิ์การใช้งาน (RBAC) ทำงานสมบูรณ์พร้อมความปลอดภัยสูงสุด
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-bold shadow-lg">🛡️</div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">สิทธิ์ปัจจุบัน (RBAC Role)</p>
              <p className="text-xs font-extrabold text-white uppercase">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* สถิติภาพรวม */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <Link key={idx} href={s.link} className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-lg text-white`}>{s.icon}</div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${s.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.change}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">{s.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition">{s.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* กราฟวิเคราะห์เชิงลึก (Interactive Analytics Charts) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">📊 กราฟวิเคราะห์แนวโน้มยอดขายและกำไรย้อนหลัง (Analytics Trends)</h3>
          <p className="text-xs text-slate-500 mt-0.5">แสดงข้อมูลการเติบโตเปรียบเทียบระหว่างยอดขายรวมและกำไรสุทธิรายเดือน</p>
        </div>

        <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-64 pt-8 border-b border-slate-100 pb-4">
          {monthlyData.map((d, idx) => {
            const salesHeight = `${(d.sales / maxSales) * 100}%`
            const profitHeight = `${(d.profit / maxSales) * 100}%`
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex justify-center items-end gap-1.5 h-full relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl z-20">
                    ขาย: {d.sales.toLocaleString()} ฿ | กำไร: {d.profit.toLocaleString()} ฿
                  </div>
                  {/* Bar ยอดขาย */}
                  <div style={{ height: salesHeight }} className="w-1/2 bg-indigo-600 rounded-t-xl group-hover:bg-indigo-500 transition"></div>
                  {/* Bar กำไรสุทธิ */}
                  <div style={{ height: profitHeight }} className="w-1/2 bg-emerald-500 rounded-t-xl group-hover:bg-emerald-400 transition"></div>
                </div>
                <span className="text-xs font-bold text-slate-600 mt-2">{d.month}</span>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center items-center gap-6 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> ยอดขายรวม (Sales)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> กำไรสุทธิ (Net Profit)</div>
        </div>
      </div>

      {/* เมนูลัด */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">⚡ เมนูลัดยอดนิยม (Quick Actions)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa, idx) => (
            <Link key={idx} href={qa.href} className="bg-white p-5 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition border border-slate-200 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-xl transition">{qa.icon}</div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition">{qa.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{qa.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}