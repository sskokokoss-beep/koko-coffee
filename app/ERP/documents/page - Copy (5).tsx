'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const onlyNumber = (v) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

export default function DocumentsPage() {
  const todayStr = new Date().toISOString().split('T')[0]

  const [list, setList] = useState([])
  const [docType, setDocType] = useState('TaxInvoiceInvDel')
  const [docNo, setDocNo] = useState('')
  const [poNumber, setPoNumber] = useState('') 
  
  const [docDate, setDocDate] = useState(todayStr)
  const [billingDate, setBillingDate] = useState(todayStr)
  const [receiptDate, setReceiptDate] = useState(todayStr)
  
  const [customerName, setCustomerName] = useState('')
  const [customerTaxId, setCustomerTaxId] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  
  const [items, setItems] = useState([
    { desc: '', qty: '', unit_price: '' }
  ])
  
  const [editingId, setEditingId] = useState(null)
  const [company, setCompany] = useState({
    nameTh: 'โกโก้ เซอร์วิส',
    nameEn: 'KOKOSERVICE',
    address: '89/157 ม.8 ต.ลาดสวาย อ.ลำลูกกา จ.ปทุมธานี 12150',
    phone: '**********',
    email: '**********@*****.***',
    taxId: '*************',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png'
  })
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  
  const [printDoc, setPrintDoc] = useState(null)
  const [printAsSet, setPrintAsSet] = useState(false)

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
      po_number: poNumber,
      doc_date: docDate,
      billing_date: billingDate,
      receipt_date: receiptDate,
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
    setDocType(doc.doc_type || 'TaxInvoiceInvDel')
    setDocNo(doc.doc_no || '')
    setPoNumber(doc.po_number || '')
    setDocDate(doc.doc_date || todayStr)
    setBillingDate(doc.billing_date || doc.doc_date || todayStr)
    setReceiptDate(doc.receipt_date || doc.doc_date || todayStr)
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
    setDocNo('')
    setPoNumber('')
    setDocDate(todayStr)
    setBillingDate(todayStr)
    setReceiptDate(todayStr)
    setCustomerName('')
    setCustomerTaxId('')
    setCustomerAddress('')
    setItems([{ desc: '', qty: '', unit_price: '' }])
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

  function getDocTitleDetails(type) {
    switch (type) {
      case 'TaxInvoiceInvDel':
        return {
          titleTh: 'ต้นฉบับใบกำกับภาษี/ใบแจ้งหนี้/ใบส่งของ',
          titleEn: 'ORIGINAL TAX INVOICE/INVOICE/DELIVERY ORDER',
          docNoLabel: 'เลขที่ใบกำกับภาษี',
          isReceipt: false
        }
      case 'CopyTaxInvoiceDel':
        return {
          titleTh: 'สำเนาใบกำกับภาษี/ใบส่งของ',
          titleEn: 'COPY TAX INVOICE / DELIVERY ORDER',
          docNoLabel: 'เลขที่ใบกำกับภาษี',
          isReceipt: false
        }
      case 'OriginalReceipt':
        return {
          titleTh: 'ต้นฉบับใบเสร็จรับเงิน',
          titleEn: 'ORIGINAL RECEIPT',
          docNoLabel: 'เลขที่ใบกำกับภาษี',
          isReceipt: true
        }
      case 'CopyReceipt':
        return {
          titleTh: 'สำเนาใบเสร็จรับเงิน',
          titleEn: 'COPY RECEIPT',
          docNoLabel: 'เลขที่ใบกำกับภาษี',
          isReceipt: true
        }
      case 'Quotation':
      default:
        return {
          titleTh: 'ใบเสนอราคา',
          titleEn: 'QUOTATION',
          docNoLabel: 'เลขที่เอกสาร',
          isReceipt: false
        }
    }
  }

  function openPrintModal(item, isSet = false) {
    setPrintDoc(item)
    setPrintAsSet(isSet)
  }

  return (
    <div className="space-y-6 relative print:static print:space-y-0 print:m-0 print:p-0">
      <style jsx global>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .print-modal-overlay {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important; margin: 0 !important;
            padding: 0 !important; display: block !important; background: white !important;
          }
          .print-hide { display: none !important; }
          .a4-container {
            width: 210mm !important; height: 296.5mm !important; margin: 0 auto !important;
            padding: 10mm !important; box-sizing: border-box !important; display: flex !important;
            flex-direction: column !important; border: none !important; box-shadow: none !important;
            page-break-after: always;
          }
          .a4-container:last-child { page-break-after: auto; }
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

        const typesToPrint = printAsSet 
          ? ['TaxInvoiceInvDel', 'CopyTaxInvoiceDel', 'OriginalReceipt', 'CopyReceipt']
          : [printDoc.doc_type || 'TaxInvoiceInvDel'];

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/80 flex flex-col items-center py-8 overflow-y-auto print-modal-overlay">
            <div className="print-hide w-full max-w-[210mm] bg-white p-3 rounded-2xl shadow-xl sticky top-0 z-10 mb-4 shrink-0 flex justify-between items-center">
              <span className="font-extrabold text-slate-800 text-sm">
                🖨️ ตัวอย่างก่อนพิมพ์ ({printAsSet ? 'ชุด 4 ใบ' : 'ใบเดียว'})
              </span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
                  พิมพ์ / บันทึก PDF
                </button>
                <button onClick={() => setPrintDoc(null)} className="rounded-xl bg-slate-300 px-5 py-2 text-xs font-bold text-slate-700">ปิด</button>
              </div>
            </div>

            <div className="flex flex-col gap-8 print:gap-0">
              {typesToPrint.map((currentType, pageIndex) => {
                const docInfo = getDocTitleDetails(currentType)
                return (
                  <div key={pageIndex} className="a4-container bg-white shadow-2xl w-[210mm] min-h-[297mm] flex flex-col p-[10mm] text-[12px] font-sans text-black border border-slate-200 box-border shrink-0">
                    {/* Header Section */}
                    <div className="flex-none">
                      <div className="flex justify-between items-start pb-2">
                        <div className="flex items-start gap-4">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                          ) : (
                            <div className="w-16 h-16 border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400">ไม่มีโลโก้</div>
                          )}
                          <div className="space-y-0.5">
                            <h2 className="text-xl font-extrabold text-blue-900">{company.nameTh}</h2>
                            <p className="font-bold text-blue-900 tracking-wider text-xs">{company.nameEn}</p>
                            <p className="text-[11px] text-slate-800">{company.address}</p>
                            <p className="text-[11px] text-slate-800">มือถือ &nbsp;&nbsp;&nbsp;&nbsp; {company.phone}</p>
                            <p className="text-[11px] text-slate-800">Email &nbsp;&nbsp;&nbsp;&nbsp; {company.email}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="border-2 border-black rounded-2xl p-2 text-center w-64 mb-1">
                            <div className="font-extrabold text-xs">{docInfo.titleTh}</div>
                            <div className="font-bold text-[9px] uppercase tracking-tighter">{docInfo.titleEn}</div>
                          </div>
                          <p className="text-[11px]">เอกสารออกเป็นชุด</p>
                          <p className="text-[11px]">เลขประจำตัวผู้เสียภาษี &nbsp;&nbsp; {company.taxId}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-3 mt-1">
                        <div className="col-span-7 border-2 border-black rounded-2xl p-3 space-y-1">
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-2 font-bold">ลูกค้า</span>
                            <span className="col-span-10 font-bold">{printDoc.customer_name}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-5">เลขประจำตัวผู้เสียภาษี</span>
                            <span className="col-span-7">{printDoc.customer_tax_id}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-2">ที่อยู่</span>
                            <span className="col-span-10">{printDoc.customer_address}</span>
                          </div>
                        </div>
                        <div className="col-span-5 border-2 border-black rounded-2xl p-3 space-y-1 text-[11px]">
                          <div className="flex justify-between"><span>{docInfo.docNoLabel}</span> <span className="font-bold">{printDoc.doc_no}</span></div>
                          <div className="flex justify-between"><span>วันที่:</span> <span className="font-bold">{printDoc.doc_date}</span></div>
                          <div className="flex justify-between"><span>วันวางบิล:</span> <span className="font-bold">{printDoc.billing_date || printDoc.doc_date}</span></div>
                          <div className="flex justify-between"><span>วันที่รับเงิน:</span> <span className="font-bold">{printDoc.receipt_date || printDoc.doc_date}</span></div>
                          <div className="flex justify-between"><span>ใบสั่งซื้อ</span> <span className="font-bold">{printDoc.po_number || '-'}</span></div>
                          <div className="flex justify-between"><span>เครดิต</span> <span>วันครบกำหนด</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Content Table */}
                    <div className="flex-1 mt-3 flex flex-col border-2 border-black border-b-0 rounded-t-2xl overflow-hidden relative">
                      <div className="flex bg-slate-50 border-b-2 border-black font-bold text-center">
                        <div className="w-12 border-r-2 border-black py-2">ลำดับ<br/><span className="text-[10px] font-normal">Item</span></div>
                        <div className="flex-1 border-r-2 border-black py-2">รหัสสินค้า/รายละเอียด<br/><span className="text-[10px] font-normal">Code/Description</span></div>
                        <div className="w-16 border-r-2 border-black py-2">จำนวน<br/><span className="text-[10px] font-normal">Quantity</span></div>
                        <div className="w-24 border-r-2 border-black py-2">ราคาหน่วยละ<br/><span className="text-[10px] font-normal">Unit Price</span></div>
                        <div className="w-28 py-2">จำนวนเงิน<br/><span className="text-[10px] font-normal">Amount</span></div>
                      </div>
                      <div className="flex-1 relative flex flex-col">
                        <div className="absolute inset-0 flex pointer-events-none">
                          <div className="w-12 border-r-2 border-black h-full"></div>
                          <div className="flex-1 border-r-2 border-black h-full"></div>
                          <div className="w-16 border-r-2 border-black h-full"></div>
                          <div className="w-24 border-r-2 border-black h-full"></div>
                          <div className="w-28 h-full"></div>
                        </div>
                        <div className="relative z-10 flex flex-col">
                          {docItems.map((item, idx) => {
                            const q = Number(item.qty || 0)
                            const p = Number(item.unit_price || 0)
                            const total = q * p
                            return (
                              <div key={idx} className="flex text-center align-top">
                                <div className="w-12 py-2 px-1">{idx + 1}</div>
                                <div className="flex-1 py-2 px-3 text-left whitespace-pre-line font-medium">{item.desc}</div>
                                <div className="w-16 py-2 px-1">{item.qty !== '' ? q : ''}</div>
                                <div className="w-24 py-2 px-1 text-right">{item.unit_price !== '' ? p.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</div>
                                <div className="w-28 py-2 px-2 text-right font-bold">{total > 0 ? total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="flex-none border-2 border-black rounded-b-xl overflow-hidden flex">
                      <div className="flex-1 border-r-2 border-black flex flex-col">
                        <div className="p-2 border-b-2 border-black h-full flex flex-col justify-start">
                          <span className="font-bold">หมายเหตุ/Remark</span>
                        </div>
                      </div>
                      <div className="w-[216px] flex flex-col text-xs">
                        <div className="flex justify-between p-1.5 border-b-2 border-black">
                          <span className="font-bold">รวมเงิน</span> 
                          <span className="font-bold">{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between p-1.5 border-b-2 border-black">
                          <span className="font-bold">V.A.T. 7%</span> 
                          <span>{vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between p-1.5 font-extrabold items-center">
                          <span>จำนวนเงินรวม</span> 
                          <span>{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Signatures */}
                    <div className="flex-none mt-3 space-y-2">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-7 border-2 border-black rounded-2xl p-3 text-center space-y-5">
                          <div className="text-xs font-bold">ได้รับสินค้าตามรายการถูกต้องแล้ว</div>
                          <div className="flex justify-between px-2 text-[10px]">
                            <div>..................................................<br/><span className="mt-1 block font-bold">{docInfo.isReceipt ? 'ผู้รับเงิน' : 'ผู้รับสินค้า'}</span></div>
                            <div>......../......../........<br/><span className="mt-1 block font-bold">วันที่/Date</span></div>
                          </div>
                        </div>
                        <div className="col-span-5 border-2 border-black rounded-2xl p-3 text-center flex flex-col justify-between">
                          {!docInfo.isReceipt && (
                            <div className="text-xs font-bold">ในนาม {company.nameTh}</div>
                          )}
                          <div className="mt-auto pb-2">
                            ...................................................<br/>
                            <span className="mt-2 block font-bold text-xs">ผู้มีอำนาจลงนาม</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <header className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">📄 ระบบออกเอกสารธุรกิจ</h1>
        </div>
        <button 
          onClick={() => setIsEditingCompany(!isEditingCompany)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          {isEditingCompany ? '❌ ปิดตั้งค่าบริษัท' : '⚙️ อัปโหลดโลโก้ & แก้ไขบริษัท'}
        </button>
      </header>

      {/* ตั้งค่าบริษัท */}
      {isEditingCompany && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 print:hidden mb-6">
          <h3 className="font-extrabold text-slate-800 mb-4">⚙️ ตั้งค่าข้อมูลบริษัท</h3>
          <form onSubmit={saveCompanyProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อบริษัท (ไทย)</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.nameTh} onChange={e => setCompany({...company, nameTh: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อบริษัท (Eng)</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.nameEn} onChange={e => setCompany({...company, nameEn: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">ที่อยู่</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">เบอร์โทรศัพท์</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.phone} onChange={e => setCompany({...company, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">อีเมล</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.email} onChange={e => setCompany({...company, email: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">เลขประจำตัวผู้เสียภาษี</label>
              <input type="text" className="w-full rounded-2xl border p-3 text-sm bg-slate-50" value={company.taxId} onChange={e => setCompany({...company, taxId: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">โลโก้ (อัปโหลดรูปภาพ)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-2xl border p-2 text-sm bg-slate-50" />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button type="submit" className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">💾 บันทึกข้อมูลบริษัท</button>
            </div>
          </form>
        </div>
      )}

      {/* ฟอร์มสร้างเอกสาร */}
      <div className={`p-6 rounded-3xl shadow-sm border transition ${editingId ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'} print:hidden`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-slate-800">{editingId ? '✏ กำลังแก้ไขเอกสาร' : '➕ สร้างเอกสารใหม่'}</h3>
        </div>

        <form onSubmit={addDoc} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">ประเภทเอกสารเริ่มต้น</label>
              <select className="w-full rounded-2xl border p-3 text-sm bg-white font-bold" value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="TaxInvoiceInvDel">1. ต้นฉบับใบกำกับภาษี/ใบแจ้งหนี้/ใบส่งของ</option>
                <option value="CopyTaxInvoiceDel">2. สำเนาใบกำกับภาษี/ใบส่งของ</option>
                <option value="OriginalReceipt">3. ต้นฉบับใบเสร็จรับเงิน</option>
                <option value="CopyReceipt">4. สำเนาใบเสร็จรับเงิน</option>
                <option value="Quotation">ใบเสนอราคา (Quotation)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">เลขที่เอกสาร</label>
              <input type="text" placeholder="เช่น INV-2026-001" className="w-full rounded-2xl border p-3 text-sm bg-white" value={docNo} onChange={e => setDocNo(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">📑 เลขที่ใบสั่งซื้อ (PO No.)</label>
              <input type="text" placeholder="เช่น PO-2610-005" className="w-full rounded-2xl border p-3 text-sm bg-white" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">📅 วันที่เอกสาร</label>
              <input type="date" required className="w-full rounded-2xl border p-3 text-sm bg-white" value={docDate} onChange={e => setDocDate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">🗓️ วันที่วางบิล</label>
              <input type="date" required className="w-full rounded-2xl border p-3 text-sm bg-white" value={billingDate} onChange={e => setBillingDate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">💵 วันที่รับเงิน</label>
              <input type="date" required className="w-full rounded-2xl border p-3 text-sm bg-white" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อลูกค้า / บริษัท</label>
              <input type="text" placeholder="ระบุชื่อลูกค้า..." className="w-full rounded-2xl border p-3 text-sm bg-white" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-slate-600 mb-1 block">เลขประจำตัวผู้เสียภาษีลูกค้า</label>
              <input type="text" placeholder="ระบุเลขผู้เสียภาษี 13 หลัก..." className="w-full rounded-2xl border p-3 text-sm bg-white" value={customerTaxId} onChange={e => setCustomerTaxId(e.target.value)} />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-bold text-slate-600 mb-1 block">ที่อยู่ลูกค้า</label>
              <input type="text" placeholder="ระบุที่อยู่ลูกค้า..." className="w-full rounded-2xl border p-3 text-sm bg-white" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-700 text-sm">📦 รายการสินค้า / บริการ</h4>
              <button type="button" onClick={addItemRow} className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition">
                ➕ เพิ่มแถวรายการ
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200">
                <div className="sm:col-span-6">
                  <textarea rows={2} required className="w-full rounded-xl border p-2.5 text-sm bg-slate-50 resize-none" placeholder="รายละเอียดสินค้า" value={item.desc} onChange={e => updateItem(index, 'desc', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <input type="text" placeholder="จำนวน" className="w-full rounded-xl border p-2.5 text-sm bg-slate-50 text-center" value={item.qty} onChange={e => onlyNumber(e.target.value) && updateItem(index, 'qty', e.target.value)} />
                </div>
                <div className="sm:col-span-3">
                  <input type="text" placeholder="ราคาต่อหน่วย" className="w-full rounded-xl border p-2.5 text-sm bg-slate-50 text-right" value={item.unit_price} onChange={e => onlyNumber(e.target.value) && updateItem(index, 'unit_price', e.target.value)} />
                </div>
                <div className="sm:col-span-1 text-center">
                  <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition" title="ลบรายการนี้">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex gap-3">
            <button type="submit" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
              {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึกเอกสาร'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEditDoc} className="rounded-xl bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300 transition">
                ยกเลิกการแก้ไข
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการเอกสารที่บันทึกแล้ว */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 className="font-extrabold text-slate-800">📂 ประวัติเอกสารทั้งหมด</h3>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาชื่อลูกค้า, เลขเอกสาร..." 
            className="w-full sm:w-72 rounded-2xl border p-2.5 text-sm bg-slate-50" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-tl-2xl">วันที่</th>
                <th className="p-3">เลขเอกสาร</th>
                <th className="p-3">ลูกค้า</th>
                <th className="p-3 text-right">ยอดรวม (บาท)</th>
                <th className="p-3 text-center rounded-tr-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-5 text-center text-slate-500 italic">ไม่มีข้อมูลเอกสาร</td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3">{doc.doc_date}</td>
                    <td className="p-3 font-bold text-slate-700">{doc.doc_no}</td>
                    <td className="p-3 truncate max-w-[200px]">{doc.customer_name}</td>
                    <td className="p-3 text-right font-medium text-slate-800">
                      {Number(doc.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openPrintModal(doc, false)} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">🖨️ พิมพ์ใบเดียว</button>
                        <button onClick={() => openPrintModal(doc, true)} className="px-3 py-1.5 text-xs font-bold text-white bg-purple-500 rounded-lg hover:bg-purple-600">🖨️ พิมพ์ 4 ใบ</button>
                        <button onClick={() => startEditDoc(doc)} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-200 rounded-lg hover:bg-amber-300">✏️ แก้ไข</button>
                        <button onClick={() => removeDoc(doc.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">🗑️ ลบ</button>
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
  )
}