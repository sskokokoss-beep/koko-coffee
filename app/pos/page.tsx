'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function POSOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [category, setCategory] = useState('ทั้งหมด')
  const [customerName, setCustomerName] = useState('')
  const [toast, setToast] = useState(null)

  // 1. ดึงสินค้าจากฐานข้อมูล SQL ผ่าน API
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
      })
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id)
      if (found) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : null
      }
      return item
    }).filter(Boolean))
  }

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const vat = subTotal * 0.07
  const grandTotal = subTotal + vat

  // 2. ส่งออร์เดอร์เข้า API ไปยัง Supabase (SQL)
  async function handleSendOrder() {
    if (cart.length === 0) return

    const orderData = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      queue: `A-${Math.floor(Math.random() * 90) + 10}`,
      customer: customerName || 'ลูกคบทั่วไป',
      subTotal,
      vat,
      grandTotal,
      items: cart
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    if (res.ok) {
      notify('ส่งออร์เดอร์เข้าครัวและฐานข้อมูล SQL สำเร็จ!')
      setCart([])
      setCustomerName('')
    } else {
      notify('เกิดข้อผิดพลาดในการส่งออร์เดอร์')
    }
  }

  const filteredProducts = category === 'ทั้งหมด' 
    ? products 
    : products.filter(p => p.category === category)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-base font-extrabold tracking-wide">CAFE & RESTAURANT POS</h1>
            <p className="text-[10px] text-slate-400">ระบบรับออร์เดอร์หน้าร้าน (Cloud SQL)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="/pos/kitchen" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition">🍳 ห้องครัว (KDS)</a>
          <a href="/pos/cashier" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition">💰 จุดคิดเงิน</a>
          <a href="/pos/admin" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition">⚙️ หลังบ้าน</a>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] w-full mx-auto">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['ทั้งหมด', 'เครื่องดื่ม', 'เบเกอรี่', 'อาหารจานหลัก'].map((cat, idx) => (
              <button key={idx} onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition shrink-0 shadow-sm ${
                  category === cat ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition text-left overflow-hidden flex flex-col justify-between group">
                <div className="h-32 w-full bg-slate-100 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs line-clamp-1">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-indigo-600">{p.price} ฿</span>
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition">+</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>🛒 รายการออร์เดอร์</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">{cart.length} รายการ</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อลูกค้า / โต๊ะ</label>
              <input type="text" placeholder="เช่น โต๊ะ 04 หรือ คุณ A" value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="w-full rounded-2xl border p-3 text-xs bg-slate-50 font-bold" />
            </div>

            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">ยังไม่ได้เลือกสินค้า</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-extrabold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-indigo-600">{item.price} ฿</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white border rounded-lg font-bold text-xs">-</button>
                      <span className="text-xs font-extrabold w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white border rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-base font-extrabold text-slate-900">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-indigo-600">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span>
            </div>
            <button onClick={handleSendOrder} disabled={cart.length === 0}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 py-3.5 text-xs font-extrabold text-white shadow-lg transition">
              🚀 ส่งออร์เดอร์ไปห้องครัว & แคชเชียร์
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}