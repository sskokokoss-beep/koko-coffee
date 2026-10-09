'use client'
import { useState, useEffect } from 'react'

export default function KitchenPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('pos_kitchen_orders')
    if (saved) setOrders(JSON.parse(saved))
  }, [])

  function updateStatus(id, status) {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o)
    setOrders(updated)
    localStorage.setItem('pos_kitchen_orders', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900 space-y-6">
      <header className="bg-white p-6 rounded-3xl shadow-sm border flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">🍳 หน้าจอห้องครัวและใบคิว (Kitchen & Queue System)</h1>
          <p className="text-xs text-slate-500 mt-0.5">จัดการสถานะออร์เดอร์และแสดงใบคิวให้ลูกค้า</p>
        </div>
        <a href="/pos" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow">🛒 กลับไปหน้าร้าน POS</a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 font-bold">ยังไม่มีออร์เดอร์ส่งเข้ามาในครัว</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border p-6 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-sm">ใบคิว: {order.queue}</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-2">ออร์เดอร์: {order.id} ({order.customer})</h3>
                  <p className="text-[11px] text-slate-400">เวลา: {order.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  order.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                  order.status === 'กำลังทำ' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2.5 rounded-xl font-bold">
                    <span>{item.name}</span>
                    <span className="text-indigo-600">x {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => updateStatus(order.id, 'กำลังทำ')} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-xs font-bold">👨‍🍳 กำลังทำ</button>
                <button onClick={() => updateStatus(order.id, 'พร้อมเสิร์ฟ')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow">✅ ทำเสร็จแล้ว</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}