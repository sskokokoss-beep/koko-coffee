'use client'
import { useState, useEffect } from 'react'

export default function CashierPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cash, setCash] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('pos_kitchen_orders')
    if (saved) setOrders(JSON.parse(saved))
  }, [])

  function handleCheckout(order) {
    setSelectedOrder(order)
  }

  function printReceipt() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-900 space-y-6">
      <header className="bg-white p-6 rounded-3xl shadow-sm border flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">💰 จุดคิดเงินและพิมพ์ใบเสร็จ (Cashier Counter)</h1>
          <p className="text-xs text-slate-500 mt-0.5">เลือกออร์เดอร์เพื่อชำระเงินและออกใบเก็บเงินให้ลูกค้า</p>
        </div>
        <a href="/pos" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow">🛒 กลับไปหน้าร้าน POS</a>
      </header>

      {/* ใบเสร็จสำหรับพิมพ์ */}
      {selectedOrder && (
        <div className="hidden print:block p-8 bg-white text-slate-900 space-y-4 max-w-sm mx-auto">
          <div className="text-center border-b pb-4">
            <h2 className="text-lg font-extrabold">CAFE & RESTAURANT</h2>
            <p className="text-xs text-slate-500">ใบเสร็จรับเงิน / Cash Receipt</p>
            <p className="text-xs font-bold mt-1">คิว: {selectedOrder.queue} | ออร์เดอร์: {selectedOrder.id}</p>
          </div>
          <div className="text-xs space-y-1">
            <p>ลูกค้า: {selectedOrder.customer}</p>
            <p>เวลา: {selectedOrder.time}</p>
          </div>
          <table className="w-full text-xs border-y py-2">
            <thead><tr className="border-b"><th className="text-left py-1">รายการ</th><th className="text-center">จำนวน</th><th className="text-right">ราคา</th></tr></thead>
            <tbody>
              {selectedOrder.items.map((i, idx) => (
                <tr key={idx}><td className="py-1">{i.name}</td><td className="text-center">{i.qty}</td><td className="text-right">{(i.price * i.qty).toLocaleString()} ฿</td></tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs space-y-1 pt-2 border-t">
            <div className="flex justify-between font-extrabold text-sm"><span>ยอดรวมสุทธิ</span><span>{selectedOrder.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} ฿</span></div>
            <div className="flex justify-between text-slate-500"><span>รับเงินสด</span><span>{Number(cash).toLocaleString()} ฿</span></div>
            <div className="flex justify-between text-slate-500"><span>เงินทอน</span><span>{(Number(cash) - selectedOrder.grandTotal).toLocaleString()} ฿</span></div>
          </div>
          <div className="text-center text-[10px] text-slate-400 pt-6">*** ขอบคุณที่ใช้บริการ ***</div>
        </div>
      )}

      {/* หน้าจอปกติ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800">📋 รายการออร์เดอร์รอชำระเงิน</h3>
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
                <div>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">คิว: {order.queue}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">{order.id} — {order.customer}</h4>
                  <p className="text-xs text-indigo-600 font-extrabold mt-0.5">{order.grandTotal.toLocaleString()} ฿</p>
                </div>
                <button onClick={() => handleCheckout(order)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow">
                  💵 คิดเงิน / ออกใบเสร็จ
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedOrder && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-extrabold text-slate-800 border-b pb-3">🧮 ชำระเงินออร์เดอร์: {selectedOrder.id}</h3>
            <div className="text-sm space-y-2">
              <p className="font-bold">ลูกค้า: {selectedOrder.customer}</p>
              <p className="text-xl font-extrabold text-indigo-600">ยอดชำระ: {selectedOrder.grandTotal.toLocaleString()} ฿</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">รับเงินสด (บาท)</label>
              <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="0.00"
                className="w-full rounded-2xl border p-3 text-sm font-bold bg-slate-50" />
            </div>
            {Number(cash) >= selectedOrder.grandTotal && (
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-700 text-xs font-extrabold flex justify-between">
                <span>เงินทอน:</span><span>{(Number(cash) - selectedOrder.grandTotal).toLocaleString()} ฿</span>
              </div>
            )}
            <button onClick={printReceipt} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold shadow">
              🖨️ พิมพ์ใบเสร็จให้ลูกค้า
            </button>
          </div>
        )}
      </div>
    </div>
  )
}