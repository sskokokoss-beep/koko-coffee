'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ERPLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('admin@erp.com')
  const [userRole, setUserRole] = useState('admin')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const isLogin = localStorage.getItem('erp_logged_in')
    if (!isLogin) {
      router.push('/')
      return
    }
    setUserEmail(localStorage.getItem('erp_user_email') || 'admin@erp.com')
    setUserRole(localStorage.getItem('erp_user_role') || 'admin')
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

  function doLogout() {
    localStorage.removeItem('erp_logged_in')
    localStorage.removeItem('erp_user_email')
    localStorage.removeItem('erp_user_role')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col justify-between p-5 shrink-0 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-600/30">E</div>
            <div>
              <h2 className="font-extrabold text-white text-base leading-tight">Enterprise ERP</h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-bold uppercase">
                {userRole}
              </span>
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

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <p className="text-[11px] font-bold text-white truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-500">สถานะ: เชื่อมต่อปกติ</p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto text-slate-900 w-full">
        {children}
      </main>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-2xl">🚪</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการออกจากระบบ</h3>
              <p className="text-xs text-slate-500 mt-1">คุณต้องการออกจากระบบใช่หรือไม่?</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={doLogout}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/30"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}