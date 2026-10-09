'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl space-y-8 text-center">
        <div>
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white text-4xl shadow-lg mb-4">
            🏢
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Enterprise ERP System</h1>
          <p className="text-sm text-slate-500 mt-2">ระบบบริหารจัดการทรัพยากรองค์กรอัจฉริยะ (Role-Based Access Control)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/login')}
            className="rounded-2xl bg-indigo-600 p-4 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            🔐 เข้าสู่ระบบ (Login)
          </button>
          <button 
            onClick={() => router.push('/ERP')}
            className="rounded-2xl bg-slate-100 p-4 font-bold text-slate-700 hover:bg-slate-200 transition flex items-center justify-center gap-2 border border-slate-200"
          >
            📊 ไปหน้าแดชบอร์ด (ERP)
          </button>
        </div>

        <div className="border-t pt-6 text-left space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">📌 เมนูลัดระบบงานภายใน:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={() => router.push('/ERP/sales')} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border text-xs font-bold transition text-center">
              🛒 ระบบงานขาย
            </button>
            <button onClick={() => router.push('/ERP/inventory')} className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border text-xs font-bold transition text-center">
              📦 คลังสินค้า
            </button>
            <button onClick={() => router.push('/ERP/users')} className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-600 border text-xs font-bold transition text-center">
              👥 จัดการพนักงาน
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}