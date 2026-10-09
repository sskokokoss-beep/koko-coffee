'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      if (email && password) {
        localStorage.setItem('erp_logged_in', 'true')
        localStorage.setItem('erp_user_email', email)
        localStorage.setItem('erp_user_role', email.includes('admin') ? 'admin' : 'staff')
        router.push('/ERP')
      } else {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">🏢</div>
          <h1 className="text-2xl font-extrabold">Enterprise ERP</h1>
          <p className="text-xs text-indigo-200">เข้าสู่ระบบเพื่อใช้งาน (โหมดจำลองสถานะ)</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-xs font-bold text-red-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@erp.com"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </main>
  )
}