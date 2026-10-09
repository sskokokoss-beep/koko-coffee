'use client'
import { useState } from 'react'

export default function AccountingPage() {
  const [transactions, setTransactions] = useState([
    { id: 'ACC-001', title: 'ขายโต๊ะทำงานไม้สัก (SO-2026-001)', type: 'income', category: 'รายได้จากการขาย', amount: 120000, date: '2026-06-01' },
    { id: 'ACC-002', title: 'ซื้อไม้สักแผ่นพรีเมียม (PO-001)', type: 'expense', category: 'ต้นทุนวัตถุดิบ', amount: 45000, date: '2026-06-02' },
    { id: 'ACC-003', title: 'ค่าน้ำค่าไฟสำนักงาน ประจำเดือน', type: 'expense', category: 'ค่าใช้จ่ายทั่วไป', amount: 6500, date: '2026-06-03' },
  ])

  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('income')
  const [category, setCategory] = useState('รายได้จากการขาย')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmDel, setConfirmDel] = useState(null)

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(null), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setType('income')
    setCategory('รายได้จากการขาย')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
  }

  function handleSave(e) {
    e.preventDefault()
    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? {
        ...t, title, type, category, amount: Number(amount), date
      } : t))
      notify('อัปเดตรายการบัญชีสำเร็จ')
    } else {
      const newTx = {
        id: `ACC-00${transactions.length + 1}`,
        title,
        type,
        category,
        amount: Number(amount),
        date,
      }
      setTransactions([newTx, ...transactions])
      notify('บันทึกรายการบัญชีสำเร็จ')
    }
    resetForm()
  }

  function startEdit(t) {
    setEditingId(t.id)
    setTitle(t.title)
    setType(t.type)
    setCategory(t.category)
    setAmount(t.amount)
    setDate(t.date)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doDelete() {
    setTransactions(transactions.filter(t => t.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบรายการบัญชีเรียบร้อย')
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netProfit = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900">💰 บัญชีการเงิน (Accounting & Finance)</h1>
        <p className="text-xs text-slate-500 mt-0.5">สรุปรายรับ รายจ่าย และคำนวณกำไรสุทธิของกิจการ</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">รายรับรวม (Total Income)</p>
          <h3 className="text-2xl font-extrabold text-emerald-600">+{totalIncome.toLocaleString()} ฿</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">รายจ่ายรวม (Total Expense)</p>
          <h3 className="text-2xl font-extrabold text-red-500">-{totalExpense.toLocaleString()} ฿</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">กำไรสุทธิ (Net Profit)</p>
          <h3 className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {netProfit.toLocaleString()} ฿
          </h3>
        </div>
      </div>

      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
        <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขรายการบัญชี' : '➕ บันทึกรายรับ / รายจ่าย'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">รายการ</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="เช่น ค่าโฆษณา Facebook" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ประเภท</label>
              <select value={type} onChange={e => {
                setType(e.target.value)
                setCategory(e.target.value === 'income' ? 'รายได้จากการขาย' : 'ค่าใช้จ่ายทั่วไป')
              }} className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white font-bold text-indigo-700">
                <option value="income">📈 รายรับ (Income)</option>
                <option value="expense">📉 รายจ่าย (Expense)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">หมวดหมู่</label>
              <input type="text" required value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวนเงิน (บาท)</label>
              <input type="number" min={0} required value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกรายการ'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl bg-slate-200 hover:bg-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-extrabold text-slate-800 mb-4">📋 ประวัติบัญชีการเงิน ({transactions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">รหัส</th>
                <th className="p-3">รายการ</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">จำนวนเงิน</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-indigo-600">{t.id}</td>
                  <td className="p-3 font-bold text-slate-800">{t.title}</td>
                  <td className="p-3 text-slate-600">{t.category}</td>
                  <td className="p-3 text-slate-500 text-xs">{t.date}</td>
                  <td className={`p-3 font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ฿
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => startEdit(t)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                      <button onClick={() => setConfirmDel(t)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">🗑️ ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-2xl">🗑️</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">ยืนยันการลบรายการ</h3>
              <p className="text-xs text-slate-500 mt-1">ต้องการลบ {confirmDel.title} ใช่หรือไม่?</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700">ยกเลิก</button>
              <button onClick={doDelete} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/30">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}