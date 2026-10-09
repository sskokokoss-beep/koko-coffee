'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ERPLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('erp_user')
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      router.push('/login')
    }
  }, [router])

  function handleLogout() {
    localStorage.removeItem('erp_user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar เมนูด้านข้าง */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              🏢
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">Enterprise ERP</h2>
              <p className="text-xs text-indigo-400 uppercase font-bold">Role: {user?.role || 'User'}</p>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm font-bold">
            <button
              onClick={() => router.push('/ERP')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              📊 แดชบอร์ดรวม
            </button>
            <button
              onClick={() => router.push('/ERP/sales')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/sales' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              🛒 ระบบงานขาย (Sales)
            </button>
            <button
              onClick={() => router.push('/ERP/inventory')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/inventory' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              📦 คลังสินค้า (Inventory)
            </button>
            <button
              onClick={() => router.push('/ERP/purchase')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/purchase' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              📦 ระบบจัดซื้อ (Purchase)
            </button>
            <button
              onClick={() => router.push('/ERP/accounting')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/accounting' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              💰 บัญชีการเงิน (Accounting)
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/ERP/users')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/users' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                👥 จัดการพนักงาน (Admin)
              </button>
            )}
          </nav>
        </div>
            <button
              onClick={() => router.push('/ERP/documents')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-center gap-3 ${pathname === '/ERP/documents' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              📑 ออกใบกำกับภาษี/ใบเสนอราคา
            </button>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="text-xs">
            <div className="font-bold text-white">{user?.name || 'ผู้ใช้งานระบบ'}</div>
            <div className="text-slate-500 truncate">{user?.email || ''}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2.5 text-xs font-bold transition text-center border border-red-500/30"
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* เนื้อหาหลักแต่ละหน้า */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}