'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ERPLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('erp_logged_in')
    if (isLoggedIn !== 'true') {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งานระบบ ERP')
      router.push('/')
    }
  }, [router])

  const menuItems = [
    { name: 'แดชบอร์ดรวม', href: '/ERP', icon: '📊' },
    { name: 'ระบบงานขาย (Sales)', href: '/ERP/sales', icon: '💼' },
    { name: 'คลังสินค้า (Inventory)', href: '/ERP/inventory', icon: '📦' },
    { name: 'ระบบจัดซื้อ (Purchase)', href: '/ERP/purchase', icon: '🛒' },
    { name: 'บัญชีการเงิน (Accounting)', href: '/ERP/accounting', icon: '💰' },
    { name: 'ระบบผลิตสินค้า', href: '/ERP/manufacturing', icon: '🏭' },
    { name: 'จัดการพนักงาน (Admin)', href: '/ERP/staff', icon: '👥' },
    { name: 'ออกใบกำกับภาษี/ใบเสนอราคา', href: '/ERP/documents', icon: '📄' },
    { name: 'ระบบแจ้งซ่อมอุปกรณ์', href: '/ERP/repairs', icon: '🛠️' },
  ]

  function handleLogout() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('erp_logged_in')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar ด้านซ้าย */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-5 shrink-0 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">E</div>
            <div>
              <h2 className="font-extrabold text-white text-base leading-tight">Enterprise ERP</h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-bold">ROLE: ADMIN</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ส่วนท้าย Sidebar */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <p className="text-[11px] font-bold text-white">ท่านผู้ดูแล ระบบ</p>
            <p className="text-[10px] text-slate-500 truncate">admin@erp.com</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* เนื้อหาหลักด้านขวา */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}