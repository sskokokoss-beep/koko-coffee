'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function DocumentsPage() {
  const [list, setList] = useState([])
  const [docType, setDocType] = useState('Quotation')
  const [docNo, setDocNo] = useState('QT-2026-001')
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('บริษัท เวิลด์ ทรัสต์ จำกัด (สำนักงานใหญ่)')
  const [customerTaxId, setCustomerTaxId] = useState('0215544001390')
  const [customerAddress, setCustomerAddress] = useState('สวนอุตสาหกรรมโรจนะ 40/24 หมู่ 5 คานหาม อ.อุทัย จ.พระนครศรีอยุธยา 13210')
  
  const [items, setItems] = useState([
    { desc: 'IT SUPPORT / บริการดูแลระบบไอทีประจำเดือน', qty: '1', unit_price: '19500' }
  ])
  
  const [editingId, setEditingId] = useState(null)
  const [company, setCompany] = useState({
    nameTh: 'โกโก้ เซอร์วิส',
    nameEn: 'KOKOSERVICE',
    address: '89/157 ม.8 ต.ลาดสวาย อ.ลำลูกกา จ.ปทุมธานี 12150',
    phone: '0971349497',
    email: 'sskokokoss@gmail.com',
    taxId: '3550100204899',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png'
  })
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [printDoc, setPrintDoc] = useState(null)

  useEffect(() => {
    loadDocs()
    const savedComp = localStorage.getItem('erp_company_profile')
    if (savedComp) {
      try { setCompany(JSON.parse(savedComp)) } catch(e) {}
    }
  }, [])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadDocs() {
    const { data, error } = await supabase.from('erp_documents').select('*').order('id', { ascending: false })
    if (error) return notify('❌ โหลดข้อมูลไม่สำเร็จ: ' + error.message)
    setList(data || [])
  }

  function addItemRow() {
    setItems([...items, { desc: '', qty: '', unit_price: '' }])
  }

  function removeItemRow(index) {
    if (items.length === 1) return notify('⚠️ ต้องมีสินค้าอย่างน้อย 1 รายการ')
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index, field, value) {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  async function addDoc(e) {
    e.preventDefault()
    const subtotal = items.reduce((sum, i) => sum + (Number(i.qty || 0) * Number(i.unit_price || 0)), 0)
    
    const docPayload = {
      doc_type: docType,
      doc_no: docNo,
      doc_date: docDate,
      customer_name: customerName,
      customer_tax_id: customerTaxId,
      customer_address: customerAddress,
      item_desc: JSON.stringify(items),
      qty: 1,
      unit_price: subtotal
    }

    if (editingId) {
      const { error } = await supabase.from('erp_documents').update(docPayload).eq('id', editingId)
      if (error) return notify('❌ แก้ไขไม่สำเร็จ: ' + error.message)
      notify('✅ อัปเดตเอกสารเรียบร้อย')
      setEditingId(null)
    } else {
      const { error } = await supabase.from('erp_documents').insert([docPayload])
      if (error) return notify('❌ บันทึกไม่สำเร็จ: ' + error.message)
      notify('✅ สร้างเอกสารเรียบร้อย')
    }

    resetForm()
    loadDocs()
  }

  function startEditDoc(doc) {
    setEditingId(doc.id)
    setDocType(doc.doc_type || 'Quotation')
    setDocNo(doc.doc_no || '')
    setDocDate(doc.doc_date || new Date().toISOString().split('T')[0])
    setCustomerName(doc.customer_name || '')
    setCustomerTaxId(doc.customer_tax_id || '')
    setCustomerAddress(doc.customer_address || '')

    try {
      if (doc.item_desc && doc.item_desc.startsWith('[')) {
        setItems(JSON.parse(doc.item_desc))
      } else {
        setItems([{ desc: doc.item_desc || '', qty: doc.qty || '1', unit_price: doc.unit_price || '0' }])
      }
    } catch (e) {
      setItems([{ desc: doc.item_desc || '', qty: '1', unit_price: '0' }])
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditDoc() {
    setEditingId(null)
    resetForm()
  }

  function resetForm() {
    setDocNo('QT-2026-001')
    setCustomerName('บริษัท เวิลด์ ทรัสต์ จำกัด (สำนักงานใหญ่)')
    setCustomerTaxId('0215544001390')
    setCustomerAddress('สวนอุตสาหกรรมโรจนะ 40/24 หมู่ 5 คานหาม อ.อุทัย จ.พระนครศรีอยุธยา 13210')
    setItems([{ desc: 'IT SUPPORT / บริการดูแลระบบไอทีประจำเดือน', qty: '1', unit_price: '19500' }])
  }

  async function removeDoc(id) {
    if (!confirm('ยืนยันการลบเอกสารนี้?')) return
    const { error } = await supabase.from('erp_documents').delete().eq('id', id)
    if (error) return notify('❌ ลบไม่สำเร็จ: ' + error.message)
    notify('🗑️ ลบเอกสารเรียบร้อย')
    loadDocs()
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompany({ ...company, logoUrl: reader.result })
      reader.readAsDataURL(file)
    }
  }

  function saveCompanyProfile(e) {
    e.preventDefault()
    localStorage.setItem('erp_company_profile', JSON.stringify(company))
    setIsEditingCompany(false)
    notify('✅ บันทึกข้อมูลบริษัทเรียบร้อย')
  }

  function parseItems(item_desc, unit_price) {
    try {
      if (item_desc.startsWith('[')) {
        return JSON.parse(item_desc)
      }
    } catch (e) {}
    return [{ desc: item_desc, qty: 1, unit_price: unit_price }]
  }

  const filtered = list.filter(d => 
    (d.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.doc_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.doc_type || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 relative print:static print:space-y-0 print:m-0 print:p-0">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* แก้ปัญหา Scroll Offset ที่ทำให้เกิดพื้นที่ว่างด้านบนตอนสั่งพิมพ์ */
          .print-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: white !important;
          }
          .print-hide {
            display: none !important;
          }
          .a4-container {
            width: 210mm !important;
            height: 296.5mm !important; /* บังคับความสูงเต็มกระดาษ เผื่อขอบ 0.5mm กันเด้งหน้าใหม่ */
            margin: 0 !important;
            padding: 10mm !important; /* ขอบกระดาษด้านใน */
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {toast && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl print:hidden">
          {toast}
        </div>
      )}

      {/* Modal พิมพ์ฟอร์มเอกสาร */}
      {printDoc && (() => {
        const docItems = parseItems(printDoc.item_desc, printDoc.unit_price)
        const subtotal = docItems.reduce((s, i) => s + (Number(i.qty || 0) * Number(i.unit_price || 0)), 0)
        const vat = subtotal * 0.07
        const grandTotal = subtotal + vat

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/80 flex flex-col items-center py-8 overflow-y-auto print-modal-overlay">
            
            {/* กล่องควบคุม (ซ่อนตอนพิมพ์) */}
            <div className="print-hide w-full max-w-[210mm] bg-white p-3 rounded-2xl shadow-xl sticky top-0 z-10 mb-4 shrink-0 flex justify-between items-center">
              <span className="font-extrabold text-slate-800 text-sm">🖨️ ตัวอย่างก่อนพิมพ์เอกสาร (ตั้ง Scale: Default)</span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white">พิมพ์ / บันทึก PDF</button>
                <button onClick={() => setPrintDoc(null)} className="rounded-xl bg-slate-300 px-5 py-2 text-xs font-bold text-slate-700">ปิด</button>
              </div>
            </div>

            {/* พื้นที่เอกสาร A4 */}
            <div className="a4-container bg-white shadow-2xl w-[210mm] min-h-[297mm] flex flex-col p-[10mm] text-[12px] font-sans text-black border border-slate-200 box-border shrink-0">
              
              {/* 1. Header Section */}
              <div className="flex-none">
                <div className="flex justify-between items-start pb-4">
                  <div className="flex items-start gap-4">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">ไม่มีโลโก้</div>
                    )}
                    <div className="space-y-1">
                      <h2 className="text-xl font-extrabold text-blue-800">{company.nameTh}</h2>
                      <p className="font-bold text-blue-900 tracking-wider text-xs">{company.nameEn}</p>
                      <p className="text-[11px] text-slate-800">{company.address}</p>
                      <p className="text-[11px] text-slate-800">มือถือ: {company.phone} &nbsp;|&nbsp; Email: {company.email}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="border-2 border-black rounded-xl p-2 text-center w-56 mb-2">
                      <div className="font-extrabold text-sm uppercase">
                        {printDoc.doc_type === 'Quotation' && 'ใบเสนอราคา / QUOTATION'}
                        {printDoc.doc_type === 'TaxInvoice' && 'ใบกำกับภาษี / ใบเสร็จรับเงิน'}
                        {printDoc.doc_type === 'Receipt' && 'ใบเสร็จรับเงิน / RECEIPT'}
                        {printDoc.doc_type === 'DeliveryOrder' && 'ใบส่งของ / DELIVERY ORDER'}
                      </div>
                    </div>
                    <p className="text-[11px]">เอกสารออกเป็นชุด</p>
                    <p className="text-[11px]">เลขประจำตัวผู้เสียภาษี: {company.taxId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 mt-2">
                  <div className="col-span-7 border-2 border-black rounded-xl p-3 space-y-1">
                    <div className="font-bold border-b border-black pb-1 mb-2">ลูกค้า / Customer</div>
                    <div className="font-extrabold">{printDoc.customer_name}</div>
                    <div>เลขประจำตัวผู้เสียภาษี: {printDoc.customer_tax_id}</div>
                    <div>ที่อยู่: {printDoc.customer_address}</div>
                  </div>
                  <div className="col-span-5 border-2 border-black rounded-xl p-3 space-y-2">
                    <div className="flex justify-between"><span>เลขที่เอกสาร:</span> <span className="font-bold">{printDoc.doc_no}</span></div>
                    <div className="flex justify-between"><span>วันที่:</span> <span className="font-bold">{printDoc.doc_date}</span></div>
                    <div className="flex justify-between"><span>ใบสั่งซื้อ:</span> <span>-</span></div>
                    <div className="flex justify-between"><span>เครดิต:</span> <span>30 วัน</span></div>
                  </div>
                </div>
              </div>

              {/* 2. Content Table (Flex ยืดความสูงดัน Footer ลงข้างล่างสุด) */}
              <div className="flex-1 mt-3 flex flex-col border-2 border-black border-b-0 rounded-t-xl overflow-hidden relative">
                
                {/* หัวตาราง */}
                <div className="flex bg-slate-100 border-b-2 border-black font-bold text-center">
                  <div className="w-12 border-r-2 border-black py-2">ลำดับ<br/>Item</div>
                  <div className="flex-1 border-r-2 border-black py-2">รหัสสินค้า/รายละเอียด<br/>Code/Description</div>
                  <div className="w-16 border-r-2 border-black py-2">จำนวน<br/>Qty</div>
                  <div className="w-24 border-r-2 border-black py-2">ราคาหน่วยละ<br/>Unit Price</div>
                  <div className="w-28 py-2">จำนวนเงิน<br/>Amount</div>
                </div>

                {/* พื้นที่รายการสินค้า */}
                <div className="flex-1 relative flex flex-col">
                  {/* ขีดเส้นตารางแนวตั้งแบบ Absolute ลงมาจนสุดความสูงกล่อง */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    <div className="w-12 border-r-2 border-black h-full"></div>
                    <div className="flex-1 border-r-2 border-black h-full"></div>
                    <div className="w-16 border-r-2 border-black h-full"></div>
                    <div className="w-24 border-r-2 border-black h-full"></div>
                    <div className="w-28 h-full"></div>
                  </div>

                  {/* รายการแสดงผล */}
                  <div className="relative z-10 flex flex-col">
                    {docItems.map((item, idx) => {
                      const q = Number(item.qty || 0)
                      const p = Number(item.unit_price || 0)
                      const total = q * p
                      return (
                        <div key={idx} className="flex text-center align-top">
                          <div className="w-12 py-2 px-1">{idx + 1}</div>
                          <div className="flex-1 py-2 px-3 text-left font-bold">{item.desc}</div>
                          <div className="w-16 py-2 px-1">{item.qty !== '' ? q : ''}</div>
                          <div className="w-24 py-2 px-1 text-right">{item.unit_price !== '' ? p.toLocaleString(undefined, {minimumFractionDigits: 2}) : ''}</div>
                          <div className="w-28 py-2 px-2 text-right font-bold">{total > 0 ? total.toLocaleString(undefined, {minimumFractionDigits: 2}) : ''}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Summary Section (ชิดท้ายตาราง) */}
              <div className="flex-none border-x-2 border-b-2 border-black rounded-b-xl overflow-hidden flex">
                <div className="flex-1 border-r-2 border-black flex flex-col">
                  <div className="p-2 border-b-2 border-black h-full flex flex-col justify-start">
                    <span className="font-bold">หมายเหตุ/Remark:</span>
                  </div>
                  <div className="p-3 text-center font-bold text-sm bg-slate-50 uppercase flex items-center justify-center h-12">
                    {grandTotal > 0 ? `( ${grandTotal.toLocaleString()} BAHT EXACTLY )` : '-'}
                  </div>
                </div>
                <div className="w-[208px] flex flex-col text-sm">
                  <div className="flex justify-between p-2 border-b-2 border-black">
                    <span className="font-bold">รวมเงิน</span> 
                    <span>{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b-2 border-black bg-slate-50">
                    <span className="font-bold">V.A.T. 7%</span> 
                    <span>{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between p-2 font-extrabold h-12 items-center">
                    <span>จำนวนเงินรวม</span> 
                    <span>{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* 4. Footer Signatures (ชิดขอบล่างสุดของกระดาษ) */}
              <div className="flex-none mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-black rounded-xl p-4 text-center space-y-6">
                    <div className="text-xs font-bold">ได้รับสินค้าตามรายการถูกต้องแล้ว</div>
                    <div className="flex justify-between px-4 text-[10px]">
                      <div>
                        ......................................................<br/>
                        <span className="mt-1 block">ผู้รับเงิน/COLLECTOR BY</span>
                      </div>
                      <div>
                        ......../......../........<br/>
                        <span className="mt-1 block">วันที่/Date</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-4 text-[10px]">
                      <div>
                        ......................................................<br/>
                        <span className="mt-1 block">ผู้รับของ/RECEIVER</span>
                      </div>
                      <div>
                        ......../......../........<br/>
                        <span className="mt-1 block">วันที่/Date</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-2 border-black rounded-xl p-4 text-center flex flex-col justify-end pb-8">
                    <div>
                      ...................................................................<br/>
                      <span className="mt-2 block font-bold">ผู้มีอำนาจลงนาม</span>
                      <span className="mt-1 block text-[10px]">Authorized Signature</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] font-bold text-slate-800">ถ้าได้รับสินค้าชำรุดหรือบกพร่องโปรดแจ้ง ภายใน 7 วัน มิฉะนั้นบริษัทฯ จะถือว่าสินค้าอยู่ในสภาพที่สมบูรณ์และจะไม่รับเปลี่ยนหรือคืนสินค้า</p>
                  <p className="text-[9px] text-slate-600 italic">If the above goods out fo order/deficiency, Please notify us within 7 days, otherwise we will assumed that the goods condition and no changing</p>
                </div>
              </div>
              
            </div>
          </div>
        )
      })()}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">📄 ระบบออกเอกสารธุรกิจ (Billing & Quotation)</h1>
          <p className="text-xs text-slate-500">สร้างและพิมพ์ใบเสนอราคา, ใบกำกับภาษี, ใบเสร็จรับเงิน และใบส่งของ</p>
        </div>
        <button 
          onClick={() => setIsEditingCompany(!isEditingCompany)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
        >
          {isEditingCompany ? '❌ ปิดตั้งค่าบริษัท' : '⚙️ อัปโหลดโลโก้ & แก้ไขบริษัท'}
        </button>
      </header>

      {/* ฟอร์มตั้งค่าบริษัท */}
      {isEditingCompany && (
        <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-200 space-y-4 print:hidden">
          <h3 className="font-extrabold text-amber-900">🏢 ตั้งค่าข้อมูลบริษัทและอัปโหลดรูปโลโก้</h3>
          <form onSubmit={saveCompanyProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" required placeholder="ชื่อบริษัทภาษาไทย" className="rounded-2xl border p-3 text-sm bg-white" value={company.nameTh} onChange={e => setCompany({ ...company, nameTh: e.target.value })} />
            <input type="text" required placeholder="ชื่อบริษัทภาษาอังกฤษ" className="rounded-2xl border p-3 text-sm bg-white" value={company.nameEn} onChange={e => setCompany({ ...company, nameEn: e.target.value })} />
            <input type="text" required placeholder="เลขประจำตัวผู้เสียภาษี" className="rounded-2xl border p-3 text-sm bg-white" value={company.taxId} onChange={e => setCompany({ ...company, taxId: e.target.value })} />
            <input type="text" required placeholder="เบอร์โทรศัพท์" className="rounded-2xl border p-3 text-sm bg-white" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
            <input type="email" required placeholder="อีเมล" className="rounded-2xl border p-3 text-sm bg-white" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
            <div className="flex flex-col justify-center bg-white border rounded-2xl p-2.5">
              <label className="text-xs font-bold text-slate-500 mb-1">🖼️ เลือกไฟล์รูปภาพโลโก้:</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <input type="text" required placeholder="ที่อยู่บริษัท" className="rounded-2xl border p-3 text-sm bg-white sm:col-span-2 lg:col-span-3" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
            <button type="submit" className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-amber-600 py-3 font-bold text-white text-sm hover:bg-amber-700 transition shadow-md">
              💾 บันทึกข้อมูลบริษัท
            </button>
          </form>
        </div>
      )}

      {/* ฟอร์มสร้าง/แก้ไข เอกสาร */}
      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'} print:hidden`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-slate-800">
            {editingId ? '✏️ กำลังแก้ไขเอกสาร ID: ' + editingId : '➕ สร้างเอกสารใหม่'}
          </h3>
          {editingId && (
            <button onClick={cancelEditDoc} className="text-xs font-bold text-red-500 hover:underline">ยกเลิกการแก้ไข</button>
          )}
        </div>

        <form onSubmit={addDoc} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="rounded-2xl border p-3 text-sm bg-white font-bold" value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="Quotation">ใบเสนอราคา (Quotation)</option>
              <option value="TaxInvoice">ใบกำกับภาษี/ใบเสร็จรับเงิน</option>
              <option value="Receipt">ใบเสร็จรับเงิน (Receipt)</option>
              <option value="DeliveryOrder">ใบส่งสินค้า (Delivery Order)</option>
            </select>
            <input type="text" required placeholder="เลขที่เอกสาร เช่น QT-2026-001" className="rounded-2xl border p-3 text-sm bg-white" value={docNo} onChange={e => setDocNo(e.target.value)} />
            <input type="date" required className="rounded-2xl border p-3 text-sm bg-white" value={docDate} onChange={e => setDocDate(e.target.value)} />
            <input type="text" required placeholder="ชื่อลูกค้า / บริษัท" className="rounded-2xl border p-3 text-sm bg-white sm:col-span-2" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <input type="text" placeholder="เลขประจำตัวผู้เสียภาษีลูกค้า" className="rounded-2xl border p-3 text-sm bg-white" value={customerTaxId} onChange={e => setCustomerTaxId(e.target.value)} />
            <input type="text" placeholder="ที่อยู่ลูกค้า" className="rounded-2xl border p-3 text-sm bg-white sm:col-span-3" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-700 text-sm">📦 รายการสินค้า / บริการ / ข้อความเพิ่มเติม</h4>
              <button type="button" onClick={addItemRow} className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition">
                ➕ เพิ่มแถวรายการ
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-7">
                    <input 
                      type="text" required placeholder={`รายละเอียด / ข้อความแถวที่ ${index + 1}`}
                      className="w-full rounded-xl border p-2.5 text-sm bg-slate-50"
                      value={item.desc} onChange={e => updateItem(index, 'desc', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input 
                      type="text" inputMode="decimal" placeholder="จำนวน (เว้นว่างได้)"
                      className="w-full rounded-xl border p-2.5 text-sm bg-slate-50 text-center"
                      value={item.qty} onChange={e => onlyNumber(e.target.value) && updateItem(index, 'qty', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input 
                      type="text" inputMode="decimal" placeholder="ราคา (เว้นว่างได้)"
                      className="w-full rounded-xl border p-2.5 text-sm bg-slate-50 text-right"
                      value={item.unit_price} onChange={e => onlyNumber(e.target.value) && updateItem(index, 'unit_price', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-1 text-center">
                    <button type="button" onClick={() => removeItemRow(index)} className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-200 transition">
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className={`w-full rounded-2xl py-3.5 font-bold text-white text-sm transition shadow-md ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {editingId ? '💾 บันทึกการแก้ไขเอกสาร' : '💾 บันทึกและออกเอกสาร'}
          </button>
        </form>
      </div>

      {/* รายการเอกสารทั้งหมด */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h3 className="font-extrabold text-slate-800">📋 รายการเอกสารทั้งหมด ({filtered.length})</h3>
          <input type="text" placeholder="🔍 ค้นหาเลขที่เอกสาร หรือลูกค้า..." className="rounded-2xl border p-2.5 text-sm bg-slate-50 w-full sm:w-72" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="rounded-2xl border p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-indigo-300 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-indigo-600">{item.doc_no}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700">{item.doc_type}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm mt-1">{item.customer_name}</div>
                <div className="text-xs text-slate-500">วันที่: {item.doc_date} | ยอดรวม VAT 7%: {(Number(item.unit_price) * 1.07).toLocaleString()} ฿</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPrintDoc(item)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                  🖨 พิมพ์เอกสาร
                </button>
                <button onClick={() => startEditDoc(item)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition">
                  ✏️ แก้ไข
                </button>
                <button onClick={() => removeDoc(item.id)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition">
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}