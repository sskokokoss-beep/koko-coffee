'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function AccountingPage() {
  const [totalSales, setTotalSales] = useState(0)
  const [totalPurchase, setTotalPurchase] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ expense_name: '', amount: '', category: 'ค่าใช้จ่ายทั่วไป' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ expense_name: '', amount: '', category: '' })
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadAccountingData()
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadAccountingData() {
    const { data: sales } = await supabase.from('erp_sales').select('amount')
    if (sales) {
      const sumSales = sales.reduce((a, s) => a + Number(s.amount || 0), 0)
      setTotalSales(sumSales)
    }

    const { data: pur } = await supabase.from('erp_purchase').select('total_price')
    if (pur) {
      const sumPur = pur.reduce((a, p) => a + Number(p.total_price || 0), 0)
      setTotalPurchase(sumPur)
    }

    const { data: exp } = await supabase.from('erp_expenses').select('*').order('id', { ascending: false })
    if (exp) setExpenses(exp || [])
  }

  async function addExpense(e) {
    e.preventDefault()
    const { error } = await supabase.from('erp_expenses').insert([{
      expense_name: form.expense_name,
      amount: Number(form.amount || 0),
      category: form.category
    }])
    if (error) return notify('❌ บันทึกค่าใช้จ่ายไม่สำเร็จ: ' + error.message)
    setForm({ expense_name: '', amount: '', category: 'ค่าใช้จ่ายทั่วไป' })
    notify('✅ บันทึกรายจ่ายเรียบร้อย')
    loadAccountingData()
  }

  function beginEdit(item) {
    setEditId(item.id)
    setEditForm({
      expense_name: item.expense_name || '',
      amount: String(item.amount ?? ''),
      category: item.category || 'ค่าใช้จ่ายทั่วไป'
    })
  }

  async function saveEdit(id) {
    const { error } = await supabase.from('erp_expenses').update({
      expense_name: editForm.expense_name,
      amount: Number(editForm.amount || 0),
      category: editForm.category
    }).eq('id', id)

    if (error) return notify('❌ แก้ไขไม่สำเร็จ: ' + error.message)
    setEditId(null)
    notify('✅ อัปเดตรายจ่ายเรียบร้อย')
    loadAccountingData()
  }

  async function removeExpense(id) {
    if (!confirm('ยืนยันการลบรายการค่าใช้จ่ายนี้?')) return
    const { error } = await supabase.from('erp_expenses').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบรายการเรียบร้อย')
    loadAccountingData()
  }

  const filteredExp = expenses.filter(ex => 
    (ex.expense_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (ex.category || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalOtherExpense = filteredExp.reduce((a, ex) => a + Number(ex.amount || 0), 0)
  const totalCostAll = totalPurchase + totalOtherExpense
  const netProfit = totalSales - totalCostAll

  // คำนวณหมวดหมู่ค่าใช้จ่ายสำหรับกราฟวิเคราะห์
  const categorySummary = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'อื่นๆ'
    acc[cat] = (acc[cat] || 0) + Number(curr.amount || 0)
    return acc
  }, {})

  const maxVal = Math.max(totalSales, totalCostAll, 1)

  function exportExcel() {
    let csv = '\uFEFF'
    csv += 'Financial Report & Analytics - Enterprise ERP\n\n'
    csv += 'Category,Amount (THB)\n'
    csv += `Total Revenue (รายรับรวม),${totalSales}\n`
    csv += `Total Purchase Cost (ต้นทุนจัดซื้อ),${totalPurchase}\n`
    csv += `Other Expenses (ค่าใช้จ่ายอื่นๆ),${totalOtherExpense}\n`
    csv += `Net Profit (กำไรสุทธิ),${netProfit}\n\n`
    csv += 'Expense Details\n'
    csv += 'ID,Expense Name,Category,Amount\n'
    filteredExp.forEach(e => {
      csv += `${e.id},"${e.expense_name}","${e.category}",${e.amount}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'erp_financial_analytics.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('📊 ส่งออกไฟล์ Excel สำเร็จ')
  }

  function exportPDF() {
    window.print()
    notify('📄 เปิดหน้าต่างพิมพ์เอกสาร PDF สำเร็จ')
  }

  return (
    <div className="space-y-6 relative print:p-0 print:bg-white">
      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl print:hidden">
          {toast}
        </div>
      )}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-none print:shadow-none">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">📊 บัญชีการเงิน & กราฟวิเคราะห์ (Analytics & P&L)</h1>
          <p className="text-xs text-slate-500">วิเคราะห์โครงสร้างรายรับ ต้นทุน กำไรสุทธิ และสัดส่วนค่าใช้จ่ายองค์กร</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={exportExcel} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm">
            📊 Export Excel
          </button>
          <button onClick={exportPDF} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm">
            📄 Export PDF
          </button>
        </div>
      </header>

      {/* สรุปตัวเลขการเงิน */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายรับรวม (Total Revenue)</div>
          <div className="text-2xl font-extrabold text-emerald-600">+{totalSales.toLocaleString()} ฿</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ต้นทุนรวม (Total Cost)</div>
          <div className="text-2xl font-extrabold text-red-500">-{totalCostAll.toLocaleString()} ฿</div>
        </div>
        <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 space-y-2 ${netProfit >= 0 ? 'border-emerald-300 bg-emerald-50/20' : 'border-red-300 bg-red-50/20'}`}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">กำไรสุทธิ (Net Profit)</div>
          <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} ฿
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะกิจการ</div>
          <div className={`text-xl font-extrabold uppercase ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {netProfit >= 0 ? '🟢 กำไร (Profitable)' : '🔴 ขาดทุน (Loss)'}
          </div>
        </div>
      </div>

      {/* ส่วนกราฟวิเคราะห์ภาพรวม (Analytics Visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-800">📈 เปรียบเทียบรายรับและต้นทุน (Revenue vs Costs)</h3>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>รายรับรวม (Revenue)</span>
                <span className="text-emerald-600">{totalSales.toLocaleString()} ฿</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalSales / maxVal) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>ต้นทุนรวม (Total Costs)</span>
                <span className="text-red-500">{totalCostAll.toLocaleString()} ฿</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalCostAll / maxVal) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>กำไรสุทธิ (Net Profit)</span>
                <span className={netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>{netProfit.toLocaleString()} ฿</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${netProfit >= 0 ? 'bg-indigo-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, Math.abs(netProfit / maxVal) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-800">🏷️ สัดส่วนค่าใช้จ่ายตามหมวดหมู่ (Expense Breakdown)</h3>
          <div className="space-y-3 pt-2">
            {Object.keys(categorySummary).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">ยังไม่มีข้อมูลค่าใช้จ่ายแยกตามหมวดหมู่</div>
            ) : (
              Object.entries(categorySummary).map(([cat, val], idx) => {
                const percentage = totalOtherExpense > 0 ? (val / totalOtherExpense) * 100 : 0
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>{cat}</span>
                      <span>{val.toLocaleString()} ฿ ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ฟอร์มบันทึกค่าใช้จ่ายอื่นๆ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 print:hidden">
        <h3 className="font-extrabold text-slate-800">➕ บันทึกค่าใช้จ่ายองค์กร (Expenses Tracker)</h3>
        <form onSubmit={addExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text" required placeholder="รายการค่าใช้จ่าย เช่น ค่าเช่าออฟฟิศ, ค่าน้ำไฟ"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.expense_name} onChange={e => setForm({ ...form, expense_name: e.target.value })}
          />
          <input
            type="text" inputMode="decimal" required placeholder="จำนวนเงิน (บาท)"
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
            value={form.amount}
            onChange={e => onlyNumber(e.target.value) && setForm({ ...form, amount: e.target.value })}
          />
          <select
            className="rounded-2xl border p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold"
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="ค่าใช้จ่ายทั่วไป">ค่าใช้จ่ายทั่วไป (General)</option>
            <option value="เงินเดือนพนักงาน">เงินเดือนพนักงาน (Payroll)</option>
            <option value="ค่าสาธารณูปโภค">ค่าสาธารณูปโภค (Utilities)</option>
            <option value="ค่าการตลาด">ค่าการตลาด (Marketing)</option>
          </select>
          <button type="submit" className="sm:col-span-3 rounded-2xl bg-slate-900 py-3.5 font-bold text-white text-sm hover:bg-slate-800 transition shadow-md">
            💾 บันทึกค่าใช้จ่าย
          </button>
        </form>
      </div>

      {/* ตารางรายการค่าใช้จ่าย */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายการค่าใช้จ่ายอื่นๆ ({filteredExp.length} รายการ)</h3>
          <input
            type="text" placeholder="🔍 ค้นหาค่าใช้จ่าย หรือหมวดหมู่..."
            className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72 focus:bg-white focus:outline-none focus:border-indigo-500 print:hidden"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filteredExp.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลค่าใช้จ่ายอื่นๆ ในระบบ</div>
          )}

          {filteredExp.map(item => (
            <div key={item.id} className={`rounded-2xl border p-4 transition ${editId === item.id ? 'border-amber-400 bg-amber-50' : 'bg-slate-50'}`}>
              {editId === item.id ? (
                <div className="space-y-3 print:hidden">
                  <div className="text-xs font-extrabold text-amber-700 uppercase">✏️ กำลังแก้ไขค่าใช้จ่าย ID: {item.id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text" placeholder="ชื่อค่าใช้จ่าย"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.expense_name} onChange={e => setEditForm({ ...editForm, expense_name: e.target.value })}
                    />
                    <input
                      type="text" inputMode="decimal" placeholder="จำนวนเงิน"
                      className="rounded-xl border p-2.5 text-sm bg-white focus:outline-none focus:border-amber-500"
                      value={editForm.amount}
                      onChange={e => onlyNumber(e.target.value) && setEditForm({ ...editForm, amount: e.target.value })}
                    />
                    <select
                      className="rounded-xl border p-2.5 text-sm bg-white font-semibold"
                      value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="ค่าใช้จ่ายทั่วไป">ค่าใช้จ่ายทั่วไป</option>
                      <option value="เงินเดือนพนักงาน">เงินเดือนพนักงาน</option>
                      <option value="ค่าสาธารณูปโภค">ค่าสาธารณูปโภค</option>
                      <option value="ค่าการตลาด">ค่าการตลาด</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(item.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                      ✅ บันทึกการแก้ไข
                    </button>
                    <button onClick={() => setEditId(null)} className="rounded-xl bg-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-400 transition">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-base">{item.expense_name}</div>
                    <div className="text-xs text-indigo-600 font-extrabold uppercase mt-0.5">หมวดหมู่: {item.category}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-red-500 text-base">-{Number(item.amount || 0).toLocaleString()} ฿</div>
                    </div>
                    <div className="flex gap-2 print:hidden">
                      <button onClick={() => beginEdit(item)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                        ✏️ แก้ไข
                      </button>
                      <button onClick={() => removeExpense(item.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center rounded-2xl bg-slate-100 p-4 border border-slate-200">
          <span className="font-extrabold text-slate-700 text-sm">รวมค่าใช้จ่ายอื่นๆ ทั้งสิ้น</span>
          <span className="font-extrabold text-red-500 text-lg">-{totalOtherExpense.toLocaleString()} ฿</span>
        </div>
      </div>
    </div>
  )
}