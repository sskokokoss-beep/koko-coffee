'use client'
import { useState } from 'react'

export default function AccountingPage() {
  const [transactions, setTransactions] = useState([
    { id: 'ACC-001', title: 'ขายโต๊ะทำงานไม้สัก (SO-2026-001)', type: 'income', category: 'รายได้จากการขาย', amount: 120000, date: '2026-06-01', ref: 'SO-2026-001' },
    { id: 'ACC-002', title: 'ซื้อไม้สักแผ่นพรีเมียม (PO-PUR-001)', type: 'expense', category: 'ต้นทุนวัตถุดิบ', amount: 45000, date: '2026-06-02', ref: 'PO-PUR-001' },
    { id: 'ACC-003', title: 'ค่าน้ำค่าไฟสำนักงาน ประจำเดือน', type: 'expense', category: 'ค่าใช้จ่ายทั่วไป', amount: 6500, date: '2026-06-03', ref: 'EXP-001' },
    { id: 'ACC-004', title: 'ค่าโฆษณา Facebook Ads', type: 'expense', category: 'ค่าการตลาด', amount: 12000, date: '2026-06-04', ref: 'EXP-002' },
  ])

  const [activeTab, setActiveTab] = useState('transactions') // 'transactions', 'income-statement', 'tax-report', 'cash-flow'
  const [toast, setToast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('income')
  const [category, setCategory] = useState('รายได้จากการขาย')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [ref, setRef] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)
  
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')

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
    setRef('')
  }

  function handleSave(e) {
    e.preventDefault()
    if (!title || !amount) return

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? {
        ...t, title, type, category, amount: Number(amount), date, ref: ref || '-'
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
        ref: ref || '-',
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
    setRef(t.ref)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doDelete() {
    setTransactions(transactions.filter(t => t.id !== confirmDel.id))
    setConfirmDel(null)
    notify('ลบรายการบัญชีเรียบร้อย')
  }

  // คำนวณตัวเลขการเงิน
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0

  // จัดกลุ่มหมวดหมู่สำหรับงบกำไรขาดทุน
  const incomeCategories = transactions.filter(t => t.type === 'income').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const expenseCategories = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  // กรองข้อมูลสำหรับตารางธุรกรรม
  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === 'all' || t.type === filterType
    const matchSearch = [t.id, t.title, t.category, t.ref].join(' ').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header พร้อมปุ่มพิมพ์รายงาน */}
      <header className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">💰 บัญชีการเงินและรายงาน (Accounting & Reports)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ระบบจัดการบัญชี วิเคราะห์งบการเงิน และออกรายงานสำหรับผู้บริหาร</p>
        </div>
        <button onClick={() => window.print()} className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-2">
          🖨️ พิมพ์รายงาน / บันทึก PDF
        </button>
      </header>

      {/* การ์ดสรุปตัวเลขการเงิน */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg">📈</div>
          <p className="text-xs font-bold text-slate-400 uppercase">รายรับรวม (Total Income)</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">+{totalIncome.toLocaleString()} ฿</h3>
          <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">กระแสเงินสดรับเข้า</span>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-lg">📉</div>
          <p className="text-xs font-bold text-slate-400 uppercase">รายจ่ายรวม (Total Expense)</p>
          <h3 className="text-2xl font-extrabold text-red-500 mt-2">-{totalExpense.toLocaleString()} ฿</h3>
          <span className="inline-block mt-2 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">ต้นทุนและค่าใช้จ่าย</span>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-lg">💎</div>
          <p className="text-xs font-bold text-slate-400 uppercase">กำไรสุทธิ (Net Profit)</p>
          <h3 className={`text-2xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {netProfit.toLocaleString()} ฿
          </h3>
          <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${netProfit >= 0 ? 'text-indigo-700 bg-indigo-50' : 'text-red-700 bg-red-50'}`}>
            {netProfit >= 0 ? 'กิจการมีกำไร' : 'ขาดทุนสุทธิ'}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-lg">📊</div>
          <p className="text-xs font-bold text-slate-400 uppercase">อัตรากำไร (Profit Margin)</p>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-2">{profitMargin}%</h3>
          <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">เทียบกับรายรับรวม</span>
        </div>
      </div>

      {/* แท็บเมนูสลับระหว่าง ธุรกรรม และ รายงานด้านบัญชีทั้ง 3 ประเภท */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <button onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition ${activeTab === 'transactions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
          📋 บันทึกธุรกรรมรายวัน
        </button>
        <button onClick={() => setActiveTab('income-statement')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition ${activeTab === 'income-statement' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
          📊 งบกำไรขาดทุน (Income Statement)
        </button>
        <button onClick={() => setActiveTab('tax-report')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition ${activeTab === 'tax-report' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
          🧾 รายงานสรุปภาษี (Tax Summary)
        </button>
        <button onClick={() => setActiveTab('cash-flow')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition ${activeTab === 'cash-flow' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
          📈 รายงานกระแสเงินสด (Cash Flow)
        </button>
      </div>

      {/* เนื้อหาแต่ละแท็บ */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* ฟอร์มบันทึก / แก้ไขรายการบัญชี */}
          <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <h3 className="font-extrabold text-slate-800 mb-4">{editingId ? '✏️ แก้ไขรายการบัญชี' : '➕ บันทึกรายรับ / รายจ่ายใหม่'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อรายการธุรกรรม</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="เช่น ค่าวัตถุดิบ, ค่าโฆษณา" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">ประเภทบัญชี</label>
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
                    placeholder="เช่น รายได้จากการขาย, ต้นทุน" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">จำนวนเงิน (บาท)</label>
                  <input type="number" min={0} step="any" required value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">วันที่ทำรายการ</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">รหัสอ้างอิง (ถ้ามี)</label>
                  <input type="text" value={ref} onChange={e => setRef(e.target.value)}
                    placeholder="เช่น SO-2026-001 หรือ INV-02" className="w-full rounded-2xl border border-slate-200 p-3 text-sm bg-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition">
                  {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกรายการบัญชี'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="rounded-xl bg-slate-200 hover:bg-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition">
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ตารางประวัติบัญชี */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-extrabold text-slate-800">📋 ประวัติบัญชีการเงิน ({filteredTransactions.length})</h3>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg transition ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>ทั้งหมด</button>
                  <button onClick={() => setFilterType('income')} className={`px-3 py-1.5 rounded-lg transition ${filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}>รายรับ</button>
                  <button onClick={() => setFilterType('expense')} className={`px-3 py-1.5 rounded-lg transition ${filterType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'}`}>รายจ่าย</button>
                </div>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ค้นหารายการ, หมวดหมู่..."
                  className="w-full sm:w-60 rounded-xl border border-slate-200 px-3.5 py-2 text-xs bg-white" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 rounded-tl-2xl">รหัส</th>
                    <th className="p-3">รายการ</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">อ้างอิง</th>
                    <th className="p-3">วันที่</th>
                    <th className="p-3">จำนวนเงิน</th>
                    <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-400 italic">ไม่พบข้อมูลรายการบัญชีตามเงื่อนไข</td></tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-indigo-600">{t.id}</td>
                        <td className="p-3 font-bold text-slate-800">{t.title}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-indigo-500 font-mono font-bold">{t.ref || '—'}</td>
                        <td className="p-3 text-slate-500 text-xs">{t.date}</td>
                        <td className={`p-3 font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ฿
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button onClick={() => startEdit(t)} className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-lg">✏️ แก้ไข</button>
                            <button onClick={() => setConfirmDel(t)} className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">🗑️ ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* รายงานที่ 1: งบกำไรขาดทุน (Income Statement) */}
      {activeTab === 'income-statement' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">📊 งบกำไรขาดทุน (Income Statement)</h3>
            <p className="text-xs text-slate-500 mt-0.5">รายงานสรุปผลการดำเนินงานทางการเงิน แยกตามหมวดหมู่รายรับและรายจ่ายประจำงวด</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">1. รายได้ (Revenues)</h4>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                {Object.keys(incomeCategories).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลรายได้</p>
                ) : (
                  Object.entries(incomeCategories).map(([cat, val], idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">{cat}</span>
                      <span className="font-bold text-slate-900">+{val.toLocaleString()} ฿</span>
                    </div>
                  ))
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-emerald-600">
                  <span>รวมรายได้ทั้งหมด</span>
                  <span>+{totalIncome.toLocaleString()} ฿</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider mb-3">2. ต้นทุนและค่าใช้จ่าย (Expenses & Costs)</h4>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                {Object.keys(expenseCategories).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลค่าใช้จ่าย</p>
                ) : (
                  Object.entries(expenseCategories).map(([cat, val], idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">{cat}</span>
                      <span className="font-bold text-slate-900">-{val.toLocaleString()} ฿</span>
                    </div>
                  ))
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-red-500">
                  <span>รวมค่าใช้จ่ายทั้งหมด</span>
                  <span>-{totalExpense.toLocaleString()} ฿</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <p className="text-xs text-indigo-300 font-bold uppercase">กำไรสุทธิประจำงวด (Net Income)</p>
                <p className="text-2xl font-extrabold mt-1">{netProfit.toLocaleString()} ฿</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-300 font-bold uppercase">อัตรากำไรสุทธิ</p>
                <p className="text-xl font-extrabold mt-1">{profitMargin}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* รายงานที่ 2: รายงานสรุปภาษี (Tax Summary) */}
      {activeTab === 'tax-report' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">🧾 รายงานสรุปภาษี (Tax Report Summary)</h3>
            <p className="text-xs text-slate-500 mt-0.5">วิเคราะห์มูลค่าภาษีมูลค่าเพิ่ม (VAT 7% โดยประมาณ) จากยอดขายและยอดซื้อเพื่อเตรียมยื่นภาษี</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">ภาษีขาย (Output VAT)</p>
              <h4 className="text-xl font-extrabold text-emerald-600">+{(totalIncome * 0.07).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿</h4>
              <p className="text-[11px] text-slate-500">คำนวณจากยอดรายรับรวม</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">ภาษีซื้อ (Input VAT)</p>
              <h4 className="text-xl font-extrabold text-red-500">-{(totalExpense * 0.07).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿</h4>
              <p className="text-[11px] text-slate-500">คำนวณจากยอดรายจ่ายรวม</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 space-y-1">
              <p className="text-xs font-bold text-indigo-600 uppercase">ภาษีที่ต้องชำระสุทธิ (Net VAT)</p>
              <h4 className="text-xl font-extrabold text-indigo-900">
                {((totalIncome - totalExpense) * 0.07).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ฿
              </h4>
              <p className="text-[11px] text-indigo-700">ภาษีขาย หัก ภาษีซื้อ</p>
            </div>
          </div>
        </div>
      )}

      {/* รายงานที่ 3: รายงานกระแสเงินสด (Cash Flow Analysis) */}
      {activeTab === 'cash-flow' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">📈 รายงานกระแสเงินสด (Cash Flow Analysis)</h3>
            <p className="text-xs text-slate-500 mt-0.5">วิเคราะห์สภาพคล่องและการหมุนเวียนของเงินสดเข้า-ออกในกิจการ</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-800">กระแสเงินสดสุทธิ (Net Cash Flow)</p>
                <p className="text-xs text-slate-500 mt-0.5">สภาพคล่องรวมหักลบเงินสดรับและจ่าย</p>
              </div>
              <span className={`text-lg font-extrabold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} ฿
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase">💡 สรุปความเห็นผู้บริหาร (Executive Summary)</h4>
              <p className="text-xs text-indigo-800 leading-relaxed">
                {netProfit >= 0 ? 
                  'สถานะทางการเงินของกิจการอยู่ในเกณฑ์ "แข็งแกร่ง" มีกระแสเงินสดเป็นบวกและอัตรากำไรอยู่ในระดับที่น่าพอใจ สามารถนำกำไรสะสมไปขยายธุรกิจหรือลงทุนเพิ่มได้' :
                  'สถานะทางการเงินอยู่ในภาวะ "ต้องเฝ้าระวัง" เนื่องจากรายจ่ายสูงกว่ารายรับ แนะนำให้ผู้บริหารตรวจสอบและควบคุมต้นทุนในหมวดหมู่ที่มีค่าใช้จ่ายสูงโดยด่วน'}
              </p>
            </div>
          </div>
        </div>
      )}

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