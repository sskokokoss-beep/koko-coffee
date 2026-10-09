'use client'
import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'users'
  
  // จัดการสินค้า
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('เครื่องดื่ม')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')

  // จัดการพนักงาน / ผู้ใช้งานระบบ (Users)
  const [users, setUsers] = useState([
    { id: 'U01', username: 'cashier01', role: 'แคชเชียร์ (Cashier)', status: 'ใช้งาน' },
    { id: 'U02', username: 'kitchen01', role: 'พนักงานครัว (Kitchen)', status: 'ใช้งาน' },
    { id: 'U03', username: 'staff01', role: 'พนักงานรับออร์เดอร์ (POS)', status: 'ใช้งาน' },
  ])
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('พนักงานรับออร์เดอร์ (POS)')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const savedProd = localStorage.getItem('pos_products')
    if (savedProd) setProducts(JSON.parse(savedProd))

    const savedUsers = localStorage.getItem('pos_system_users')
    if (savedUsers) setUsers(JSON.parse(savedUsers))
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  // Product Actions
  function handleAddProduct(e) {
    e.preventDefault()
    if (!name || !price) return
    const newItem = {
      id: `P${Date.now().toString().slice(-4)}`,
      name, category, price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80'
    }
    const updated = [...products, newItem]
    setProducts(updated)
    localStorage.setItem('pos_products', JSON.stringify(updated))
    setName(''); setPrice(''); setImage('')
    notify('เพิ่มเมนูสินค้าสำเร็จ')
  }

  function handleDeleteProduct(id) {
    const updated = products.filter(p => p.id !== id)
    setProducts(updated)
    localStorage.setItem('pos_products', JSON.stringify(updated))
    notify('ลบสินค้าเรียบร้อย')
  }

  // User Actions
  function handleAddUser(e) {
    e.preventDefault()
    if (!newUsername || !newPassword) return
    const newUser = {
      id: `U${Date.now().toString().slice(-4)}`,
      username: newUsername,
      role: newRole,
      status: 'ใช้งาน'
    }
    const updated = [...users, newUser]
    setUsers(updated)
    localStorage.setItem('pos_system_users', JSON.stringify(updated))
    setNewUsername(''); setNewPassword('')
    notify('เพิ่มบัญชีผู้ใช้งานสำเร็จ')
  }

  function handleDeleteUser(id) {
    const updated = users.filter(u => u.id !== id)
    setUsers(updated)
    localStorage.setItem('pos_system_users', JSON.stringify(updated))
    notify('ลบผู้ใช้งานเรียบร้อย')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900 space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">⚙️ ระบบหลังบ้านผู้ดูแลระบบ (Admin Control Center)</h1>
          <p className="text-xs text-slate-500 mt-0.5">จัดการเมนูอาหาร, รูปภาพสินค้า และสิทธิ์การใช้งานของพนักงานในร้าน</p>
        </div>
        <a href="/pos" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition">🛒 กลับไปหน้าร้าน POS</a>
      </header>

      {/* แท็บเมนูหลังบ้าน */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border w-fit">
        <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
          🍔 จัดการเมนูสินค้า
        </button>
        <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
          👥 จัดการพนักงานและผู้ใช้งาน (Users)
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-extrabold text-slate-800">➕ เพิ่มเมนูอาหารใหม่</h3>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <input type="text" required placeholder="ชื่อสินค้า" value={name} onChange={e => setName(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold">
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                <option value="เบเกอรี่">เบเกอรี่</option>
                <option value="อาหารจานหลัก">อาหารจานหลัก</option>
              </select>
              <input type="number" required placeholder="ราคา" value={price} onChange={e => setPrice(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
              <input type="url" placeholder="ลิงก์รูปภาพ URL" value={image} onChange={e => setImage(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
              <button type="submit" className="rounded-2xl bg-indigo-600 text-white font-bold text-xs py-3 shadow">💾 บันทึกสินค้า</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-extrabold text-slate-800">📋 เมนูทั้งหมดในระบบ ({products.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr><th className="p-3">รูปภาพ</th><th className="p-3">ชื่อ</th><th className="p-3">หมวดหมู่</th><th className="p-3">ราคา</th><th className="p-3 text-center">จัดการ</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="p-3"><img src={p.image} className="w-10 h-10 rounded-xl object-cover shadow-sm" /></td>
                      <td className="p-3 font-extrabold">{p.name}</td>
                      <td className="p-3"><span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600">{p.category}</span></td>
                      <td className="p-3 font-extrabold text-indigo-600">{p.price} ฿</td>
                      <td className="p-3 text-center"><button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">ลบ</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-extrabold text-slate-800">➕ เพิ่มพนักงาน / ผู้ใช้งานระบบใหม่</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" required placeholder="ชื่อผู้ใช้งาน (Username)" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
              <input type="password" required placeholder="รหัสผ่าน (Password)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="rounded-2xl border p-3 text-xs bg-slate-50 font-bold">
                <option value="พนักงานรับออร์เดอร์ (POS)">พนักงานรับออร์เดอร์ (POS)</option>
                <option value="แคชเชียร์ (Cashier)">แคชเชียร์ (Cashier)</option>
                <option value="พนักงานครัว (Kitchen)">พนักงานครัว (Kitchen)</option>
                <option value="ผู้ดูแลระบบ (Admin)">ผู้ดูแลระบบ (Admin)</option>
              </select>
              <button type="submit" className="rounded-2xl bg-indigo-600 text-white font-bold text-xs py-3 shadow">💾 สร้างบัญชีพนักงาน</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-extrabold text-slate-800">👥 รายชื่อผู้มีสิทธิ์ใช้งานระบบ POS ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                  <tr><th className="p-3">Username</th><th className="p-3">ตำแหน่ง / สิทธิ์การใช้งาน</th><th className="p-3">สถานะ</th><th className="p-3 text-center">จัดการ</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-indigo-600">{u.username}</td>
                      <td className="p-3 font-bold text-slate-700">{u.role}</td>
                      <td className="p-3"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-extrabold">{u.status}</span></td>
                      <td className="p-3 text-center">
                        {u.username !== 'admin@erp.com' && (
                          <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">ลบ</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}