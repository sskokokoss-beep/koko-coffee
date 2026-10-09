'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@erp.com')
  const [password, setPassword] = useState('********')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    // จำลองการตรวจสอบสิทธิ์และบันทึกสถานะพรีเมียม Session
    setTimeout(() => {
      localStorage.setItem('erp_logged_in', 'true')
      localStorage.setItem('erp_user_email', email)
      notify('✨ เข้าสู่ระบบสำเร็จ กำลังพาเข้าสู่ระบบ ERP...')
      setTimeout(() => {
        router.push('/ERP')
      }, 800)
    }, 600)
  }

  function handleQuickAccess(path) {
    localStorage.setItem('erp_logged_in', 'true')
    router.push(path)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-2xl tracking-wide animate-bounce">
          {toast}
        </div>
      )}

      {/* Decorative Glow Backgrounds */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-white">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 text-3xl">
            🏢
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Enterprise ERP System</h1>
            <p className="text-xs text-indigo-200/80 mt-1 font-medium">ระบบบริหารจัดการทรัพยากรองค์กรอัจฉริยะ (Role-Based Access Control)</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">อีเมลผู้ใช้งาน (Email)</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner" 
              placeholder="admin@erp.com" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? '⏳ กำลังตรวจสอบสิทธิ์...' : '🔐 เข้าสู่ระบบ (Login) อย่างปลอดภัย'}
          </button>
        </form>

        {/* Quick Access Divider */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <p className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase text-center">📌 เมนูลัดระบบงานภายในองค์กร:</p>
          <div className="grid grid-cols-3 gap-2.5">
            <button 
              onClick={() => handleQuickAccess('/ERP')}
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 px-2 text-xs font-bold text-slate-200 transition text-center truncate cursor-pointer"
            >
              📊 แดชบอร์ด
            </button>
            <button 
              onClick={() => handleQuickAccess('/ERP/documents')}
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 px-2 text-xs font-bold text-slate-200 transition text-center truncate cursor-pointer"
            >
              📄 ออกใบกำกับภาษี
            </button>
            <button 
              onClick={() => handleQuickAccess('/ERP/repairs')}
              className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 px-2 text-xs font-bold text-slate-200 transition text-center truncate cursor-pointer"
            >
              🛠️ ระบบแจ้งซ่อม
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}