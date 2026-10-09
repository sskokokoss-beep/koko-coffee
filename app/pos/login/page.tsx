'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('pos_auth', 'true')
      router.push('/pos')
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-extrabold">☕</div>
          <h2 className="text-xl font-extrabold text-slate-900">Admin Login</h2>
          <p className="text-xs text-slate-400">เข้าสู่ระบบ POS ด้วยรหัสผู้ดูแล (Admin)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="admin"
              className="w-full rounded-2xl border p-3 text-sm bg-slate-50 font-bold" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="admin"
              className="w-full rounded-2xl border p-3 text-sm bg-slate-50 font-bold" />
          </div>

          {error && <p className="text-xs text-red-500 font-bold text-center">รหัสผ่านไม่ถูกต้อง (ใช้ admin / admin)</p>}

          <button type="submit" className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 text-xs font-extrabold shadow-lg transition">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  )
}