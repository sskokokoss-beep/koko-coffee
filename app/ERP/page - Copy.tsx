'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function ERPDashboard() {
  const [user, setUser] = useState(null)
  const [totalSales, setTotalSales] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [totalPurchase, setTotalPurchase] = useState(0)
  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('erp_user')
    if (stored) setUser(JSON.parse(stored))
    fetchSummary()
  }, [])

  async function fetchSummary() {
    // 1. ยอดขายรวม
    const { data: sales } = await supabase.from('erp_sales').select('amount')
    if (sales) {
      const sum = sales.reduce((acc, s) => acc + Number(s.amount || 0), 0)
      setTotalSales(sum)
    }

    // 2. สินค้าในคลังทั้งหมด & เช็คสินค้าใกล้หมด (<= 5 ชิ้น)
    const { data: inv } = await supabase.from('erp_inventory').select('*')
    if (inv) {
      const sumQty = inv.reduce((acc, i) => acc + Number(i.qty || 0), 0)
      setTotalStock(sumQty)

      const lowStock = inv.filter(i => Number(i.qty || 0) <= 5)
      setLowStockItems(lowStock)
    }

    // 3. ยอดจัดซื้อรวม
    const { data: pur } = await supabase.from('erp_purchase').select('total_price')
    if (pur) {
      const sumPur = pur.reduce((acc, p) => acc + Number(p.total_price || 0), 0)
      setTotalPurchase(sumPur)
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">📊 ภาพรวมระบบองค์กร (Dashboard)</h1>
        <p className="text-sm text-slate-500 mt-1">ยินดีต้อนรับคุณ {user?.name || 'ผู้ใช้งาน'} เข้าสู่ระบบบริหารจัดการส่วนกลาง</p>
      </header>

      {/* แจ้งเตือนสินค้าใกล้หมด (Low Stock Alert Banner) */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="font-extrabold text-red-800 text-base">แจ้งเตือนสินค้าใกล้หมดคลัง (Low Stock Alert)</h2>
          </div>
          <p className="text-xs text-red-600">พบสินค้าที่มีจำนวนคงเหลือเหลือน้อยกว่าหรือเท่ากับ 5 ชิ้น กรุณาตรวจสอบและดำเนินการจัดซื้อเพิ่ม:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white border border-red-200 rounded-2xl p-3 flex justify-between items-center shadow-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                  <div className="text-xs text-slate-400">SKU: {item.sku || '-'}</div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-red-100 text-red-700 font-extrabold text-xs">
                  เหลือ {item.qty} ชิ้น
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* การ์ดสรุปข้อมูล */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดขายรวมองค์กร</div>
          <div className="text-2xl font-extrabold text-emerald-600">{totalSales.toLocaleString()} ฿</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">สินค้าในคลังทั้งหมด</div>
          <div className="text-2xl font-extrabold text-indigo-600">{totalStock.toLocaleString()} ชิ้น</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดจัดซื้อรวม</div>
          <div className="text-2xl font-extrabold text-amber-600">{totalPurchase.toLocaleString()} ฿</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">สิทธิ์การใช้งานของคุณ</div>
          <div className="text-2xl font-extrabold text-slate-800 uppercase">{user?.role || '-'}</div>
        </div>
      </div>
    </div>
  )
}