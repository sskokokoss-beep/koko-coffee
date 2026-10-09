'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function formatTimeOnly(dateStr) {
  if (!dateStr) return '12:00'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '12:00'
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.'
}

export default function Home() {
  const [tab, setTab] = useState('rider') // 'rider', 'driver', 'admin'
  
  // Admin Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // App Data States
  const [locations, setLocations] = useState([])
  const [fareSettings, setFareSettings] = useState({ base_fare: 50, per_km_rate: 7 })
  
  // Rider states
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeRide, setActiveRide] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [riderCoords, setRiderCoords] = useState({ lat: 18.7756, lng: 100.7785 })
  
  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [completedRideId, setCompletedRideId] = useState(null)

  // Driver Login & Mode States
  const [selectedDriverTarget, setSelectedDriverTarget] = useState(null)
  const [driverPinInput, setDriverPinInput] = useState('')
  const [driverPinError, setDriverPinError] = useState('')
  const [selectedDriverLogin, setSelectedDriverLogin] = useState(null)
  const [incomingRides, setIncomingRides] = useState([])
  const [driverActiveRide, setDriverActiveRide] = useState(null)
  const [newRideAlert, setNewRideAlert] = useState(false)

  // Admin Forms & History
  const [editingDriverId, setEditingDriverId] = useState(null)
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', plate: '', brand: 'Toyota', model: 'Yaris', code: '1234', lat: '18.7756', lng: '100.7785', type: 'economy' })
  const [qrFile, setQrFile] = useState(null)
  const [driverAvatarFile, setDriverAvatarFile] = useState(null)
  const [vehicleImageFile, setVehicleImageFile] = useState(null)

  const [locForm, setLocForm] = useState({ name: '', lat: '', lng: '' })
  const [msg, setMsg] = useState('')
  const [allDrivers, setAllDrivers] = useState([])
  const [rideHistory, setRideHistory] = useState([])
  const [selectedDriverReport, setSelectedDriverReport] = useState(null)

  useEffect(() => {
    fetchLocationsAndSettings()
    fetchAllDrivers()
    if (isAdminLoggedIn) {
      fetchRideHistory()
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRiderCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => console.log('Geolocation error:', err),
        { enableHighAccuracy: true }
      )
    }
  }, [isAdminLoggedIn])

  useEffect(() => {
    const channel = supabase
      .channel('public-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, payload => {
        fetchRideHistory()
        if (tab === 'driver' && selectedDriverLogin) {
          fetchIncomingRides(selectedDriverLogin.id)
          if (payload.eventType === 'INSERT' && payload.new.driver_id === selectedDriverLogin.id && selectedDriverLogin.is_online) {
            setNewRideAlert(true)
            playBeepSound()
          }
        }
        if (activeRide && payload.new && payload.new.id === activeRide.id) {
          setActiveRide(prev => ({ ...prev, status: payload.new.status }))
          if (payload.new.status === 'completed') {
            setCompletedRideId(payload.new.id)
            setShowRatingModal(true)
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drivers' }, payload => {
        if (activeRide && payload.new.id === activeRide.driver_id) {
          setActiveRide(prev => ({
            ...prev,
            lat: payload.new.current_lat || prev.lat,
            lng: payload.new.current_lng || prev.lng
          }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tab, selectedDriverLogin, activeRide])

  function playBeepSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.4)
    } catch (e) {
      console.log('Audio error:', e)
    }
  }

  async function fetchLocationsAndSettings() {
    const { data: locs } = await supabase.from('locations').select('*')
    if (locs && locs.length > 0) {
      setLocations(locs)
      setPickup(locs[0])
      setDropoff(locs[1] || locs[0])
    }

    const { data: sets } = await supabase.from('settings').select('*')
    if (sets) {
      const settingsMap = {}
      sets.forEach(s => settingsMap[s.key] = Number(s.value))
      setFareSettings(prev => ({ ...prev, ...settingsMap }))
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault()
    if (username === 'admin' && password === 'nan1234') {
      setIsAdminLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (admin / nan1234)')
    }
  }

  async function searchDrivers() {
    if (!pickup) return
    setLoading(true)
    const { data, error } = await supabase.rpc('find_nearby_drivers', {
      p_lat: pickup.lat,
      p_lng: pickup.lng,
      p_radius: 50000,
      p_limit: 10,
    })
    if (error) alert('ผิดพลาด: ' + error.message)
    
    const driversWithDistance = (data || []).map(d => {
      const dLat = d.current_lat || 18.78
      const dLng = d.current_lng || 100.78
      const dist = calculateDistance(pickup.lat, pickup.lng, dLat, dLng)
      return { ...d, distanceKm: dist }
    })

    setDrivers(driversWithDistance)
    setSearched(true)
    setLoading(false)
  }

  const tripKm = (pickup && dropoff) ? calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng) : 0
  const calculatedFare = Math.round(fareSettings.base_fare + (tripKm * fareSettings.per_km_rate))

  async function bookDriver(driver) {
    const { data, error } = await supabase.from('rides').insert({
      driver_id: driver.driver_id,
      pickup_address: pickup.name,
      dropoff_address: dropoff.name,
      fare_amount: calculatedFare,
      status: 'pending'
    }).select().single()

    if (error) {
      alert('เรียกรถไม่สำเร็จ: ' + error.message)
    } else {
      setActiveRide({ 
        ...data, 
        driver_id: driver.driver_id,
        driver_name: driver.full_name, 
        plate_no: driver.plate_no, 
        phone: driver.phone || '**********',
        line_qr: driver.line_qr || '',
        avatar_url: driver.avatar_url || '',
        vehicle_image_url: driver.vehicle_image_url || '',
        lat: driver.current_lat || pickup.lat,
        lng: driver.current_lng || pickup.lng
      })
    }
  }

  async function cancelRide(rideId) {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
    setActiveRide(null)
  }

  async function submitRating() {
    await supabase.from('reviews').insert({
      ride_id: completedRideId,
      driver_id: activeRide.driver_id,
      rating: ratingScore,
      comment: ratingComment
    })
    setShowRatingModal(false)
    setActiveRide(null)
    setCompletedRideId(null)
    setRatingComment('')
    alert('⭐ ขอบคุณสำหรับรีวิวการเดินทางครับ!')
  }

  async function fetchAllDrivers() {
    const { data } = await supabase.from('drivers').select(`id, profile_id, is_online, line_qr, avatar_url, driver_code, current_lat, current_lng, profiles ( id, full_name, phone, rating ), vehicles ( id, plate_no, brand, model, vehicle_type, vehicle_image_url )`)
    if (data) {
      const formatted = data.map(d => ({
        id: d.id,
        profile_id: d.profile_id,
        is_online: d.is_online,
        line_qr: d.line_qr,
        avatar_url: d.avatar_url,
        driver_code: d.driver_code || '1234',
        current_lat: d.current_lat || 18.7756,
        current_lng: d.current_lng || 100.7785,
        full_name: d.profiles?.full_name,
        phone: d.profiles?.phone,
        rating: d.profiles?.rating || 5.0,
        plate_no: d.vehicles?.[0]?.plate_no,
        brand: d.vehicles?.[0]?.brand,
        model: d.vehicles?.[0]?.model,
        vehicle_type: d.vehicles?.[0]?.vehicle_type,
        vehicle_image_url: d.vehicles?.[0]?.vehicle_image_url
      }))
      setAllDrivers(formatted)
      
      if (selectedDriverLogin) {
        const updatedCurrent = formatted.find(x => x.id === selectedDriverLogin.id)
        if (updatedCurrent) setSelectedDriverLogin(updatedCurrent)
      }
    }
  }

  async function fetchRideHistory() {
    const { data } = await supabase.from('rides').select('*').order('created_at', { ascending: false })
    if (data) setRideHistory(data)
  }

  async function fetchIncomingRides(driverId) {
    const { data } = await supabase.from('rides').select('*').eq('driver_id', driverId).eq('status', 'pending')
    if (data) setIncomingRides(data)
  }

  function handleDriverPinLogin(e) {
    e.preventDefault()
    if (driverPinInput === selectedDriverTarget.driver_code) {
      setSelectedDriverLogin(selectedDriverTarget)
      fetchIncomingRides(selectedDriverTarget.id)
      setSelectedDriverTarget(null)
      setDriverPinInput('')
      setDriverPinError('')
    } else {
      setDriverPinError('❌ รหัสผ่าน (PIN) คนขับไม่ถูกต้อง')
    }
  }

  async function acceptRideByDriver(ride) {
    await supabase.from('rides').update({ status: 'accepted' }).eq('id', ride.id)
    setDriverActiveRide(ride)
    setIncomingRides([])
    setNewRideAlert(false)
  }

  async function rejectRideByDriver(rideId) {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
    fetchIncomingRides(selectedDriverLogin.id)
    setNewRideAlert(false)
    alert('❌ คุณได้ปฏิเสธงานนี้เรียบร้อยแล้ว')
  }

  async function completeRideByDriver(rideId) {
    await supabase.from('rides').update({ status: 'completed' }).eq('id', rideId)
    setDriverActiveRide(null)
    fetchRideHistory()
    alert('✅ ส่งผู้โดยสารเรียบร้อย บันทึกรายได้และเวลาจบงานสำเร็จ!')
  }

  async function toggleDriverStatus(driverId, currentStatus) {
    await supabase.from('drivers').update({ is_online: !currentStatus }).eq('id', driverId)
    fetchAllDrivers()
  }

  function updateDriverRealGPS() {
    if (!navigator.geolocation) {
      alert('❌ เบราว์เซอร์ของคุณไม่รองรับการใช้งาน GPS')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        await supabase.from('drivers').update({ current_lat: lat, current_lng: lng }).eq('id', selectedDriverLogin.id)
        fetchAllDrivers()
        alert(`🛰️ อัปเดตพิกัด GPS จริงสำเร็จ!\nLat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
      },
      (err) => {
        alert('❌ ไม่สามารถดึงพิกัด GPS ได้: ' + err.message)
      },
      { enableHighAccuracy: true }
    )
  }

  async function simulateDriverMove(direction) {
    if (!selectedDriverLogin) return
    let newLat = selectedDriverLogin.current_lat
    let newLng = selectedDriverLogin.current_lng

    if (direction === 'north') newLat += 0.002
    if (direction === 'south') newLat -= 0.002
    if (direction === 'east') newLng += 0.002
    if (direction === 'west') newLng -= 0.002

    await supabase.from('drivers').update({ current_lat: newLat, current_lng: newLng }).eq('id', selectedDriverLogin.id)
    fetchAllDrivers()
  }

  async function handleSaveDriver(e) {
    e.preventDefault()
    setMsg('กำลังบันทึกข้อมูลและอัปโหลดรูปภาพ...')

    let qrUrl = null
    if (qrFile) {
      const fileName = `${Date.now()}_qr_${qrFile.name}`
      const { error: uploadError } = await supabase.storage.from('driver-qrs').upload(fileName, qrFile)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('driver-qrs').getPublicUrl(fileName)
        qrUrl = publicUrlData.publicUrl
      }
    }

    let avatarUrl = null
    if (driverAvatarFile) {
      const fileName = `${Date.now()}_avatar_${driverAvatarFile.name}`
      const { error: uploadError } = await supabase.storage.from('driver-qrs').upload(fileName, driverAvatarFile)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('driver-qrs').getPublicUrl(fileName)
        avatarUrl = publicUrlData.publicUrl
      }
    }

    let vehicleUrl = null
    if (vehicleImageFile) {
      const fileName = `${Date.now()}_vehicle_${vehicleImageFile.name}`
      const { error: uploadError } = await supabase.storage.from('driver-qrs').upload(fileName, vehicleImageFile)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('driver-qrs').getPublicUrl(fileName)
        vehicleUrl = publicUrlData.publicUrl
      }
    }

    if (editingDriverId) {
      const targetDriver = allDrivers.find(d => d.id === editingDriverId)
      await supabase.from('profiles').update({ full_name: driverForm.name, phone: driverForm.phone }).eq('id', targetDriver.profile_id)
      
      const vehicleUpdate = { plate_no: driverForm.plate, brand: driverForm.brand, model: driverForm.model, vehicle_type: driverForm.type }
      if (vehicleUrl) vehicleUpdate.vehicle_image_url = vehicleUrl
      await supabase.from('vehicles').update(vehicleUpdate).eq('driver_id', editingDriverId)

      const updateData = { driver_code: driverForm.code }
      if (qrUrl) updateData.line_qr = qrUrl
      if (avatarUrl) updateData.avatar_url = avatarUrl
      await supabase.from('drivers').update(updateData).eq('id', editingDriverId)

      setMsg('✅ แก้ไขข้อมูลคนขับและรูปภาพสำเร็จ!')
      setEditingDriverId(null)
    } else {
      const profileId = crypto.randomUUID()
      const driverId = crypto.randomUUID()

      await supabase.from('profiles').insert({ id: profileId, full_name: driverForm.name, phone: driverForm.phone, role: 'driver', rating: 5.0 })
      await supabase.from('drivers').insert({
        id: driverId, profile_id: profileId, license_no: 'NAN-' + Math.floor(Math.random()*9000+1000),
        license_expiry: '2030-12-31', status: 'approved', is_online: true,
        driver_code: driverForm.code || '1234',
        line_qr: qrUrl || '',
        avatar_url: avatarUrl || '',
        current_lat: 18.7756, current_lng: 100.7785
      })
      await supabase.from('vehicles').insert({
        driver_id: driverId, plate_no: driverForm.plate, brand: driverForm.brand, model: driverForm.model, color: 'ขาว', year: 2023, vehicle_type: driverForm.type, vehicle_image_url: vehicleUrl || ''
      })

      setMsg('✅ เพิ่มคนขับสำเร็จ!')
    }

    setDriverForm({ name: '', phone: '', plate: '', brand: 'Toyota', model: 'Yaris', code: '1234', lat: '18.7756', lng: '100.7785', type: 'economy' })
    setQrFile(null)
    setDriverAvatarFile(null)
    setVehicleImageFile(null)
    fetchAllDrivers()
  }

  function startEditDriver(d) {
    setEditingDriverId(d.id)
    setDriverForm({
      name: d.full_name || '',
      phone: d.phone || '',
      plate: d.plate_no || '',
      brand: d.brand || 'Toyota',
      model: d.model || 'Yaris',
      code: d.driver_code || '1234',
      lat: '18.7756',
      lng: '100.7785',
      type: d.vehicle_type || 'economy'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingDriverId(null)
    setDriverForm({ name: '', phone: '', plate: '', brand: 'Toyota', model: 'Yaris', code: '1234', lat: '18.7756', lng: '100.7785', type: 'economy' })
    setQrFile(null)
    setDriverAvatarFile(null)
    setVehicleImageFile(null)
  }

  async function handleDeleteDriver(driverId, profileId) {
    if (!confirm('ต้องการลบคนขับนี้ออกจากระบบใช่หรือไม่?')) return
    await supabase.from('vehicles').delete().eq('driver_id', driverId)
    await supabase.from('drivers').delete().eq('id', driverId)
    await supabase.from('profiles').delete().eq('id', profileId)
    fetchAllDrivers()
    alert('🗑️ ลบคนขับเรียบร้อยแล้ว')
  }

  async function handleAddLocation(e) {
    e.preventDefault()
    const { error } = await supabase.from('locations').insert({ name: locForm.name, lat: Number(locForm.lat), lng: Number(locForm.lng) })
    if (error) { alert('เพิ่มสถานที่ล้มเหลว: ' + error.message); return; }
    alert('✅ เพิ่มสถานที่สำเร็จ!')
    setLocForm({ name: '', lat: '', lng: '' })
    fetchLocationsAndSettings()
  }

  async function handleUpdateSettings(e) {
    e.preventDefault()
    await supabase.from('settings').upsert({ key: 'base_fare', value: Number(fareSettings.base_fare) })
    await supabase.from('settings').upsert({ key: 'per_km_rate', value: Number(fareSettings.per_km_rate) })
    alert('✅ อัปเดตราคาค่าน้ำมัน/กม. เรียบร้อย!')
  }

  async function handleDeleteLocation(id) {
    if (!confirm('ต้องการลบสถานที่นี้ใช่หรือไม่?')) return
    await supabase.from('locations').delete().eq('id', id)
    fetchLocationsAndSettings()
  }

  const mapSrc = pickup ? `https://maps.google.com/maps?q=${pickup.lat},${pickup.lng}&z=14&output=embed` : ''
  const activeMapSrc = activeRide ? `https://maps.google.com/maps?q=${activeRide.lat},${activeRide.lng}&z=15&output=embed` : ''

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 p-4 sm:p-6 text-slate-800">
      <div className="mx-auto max-w-3xl">
        
        {/* Header แบรนด์ */}
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-white/80 backdrop-blur-md p-5 shadow-sm border border-emerald-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl shadow-md shadow-emerald-600/30">
              🛺
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">น่านสมาร์ทไรด์</h1>
              <p className="text-xs text-slate-500 font-medium">Nan Smart Ride - บริการเรียกรถท้องถิ่น</p>
            </div>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1.5 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => { setTab('rider'); setSelectedDriverLogin(null); setSelectedDriverTarget(null); }}
              className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-bold transition-all ${tab === 'rider' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🚗 ผู้โดยสาร
            </button>
            <button
              onClick={() => { setTab('driver'); setSelectedDriverTarget(null); }}
              className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-bold transition-all ${tab === 'driver' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🧑‍✈️ โหมดคนขับ
            </button>
            <button
              onClick={() => { setTab('admin'); setSelectedDriverLogin(null); setSelectedDriverTarget(null); }}
              className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-bold transition-all ${tab === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ⚙️ หลังบ้าน
            </button>
          </div>
        </header>

        {tab === 'rider' ? (
          <div className="space-y-4">
            {activeRide ? (
              <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-emerald-100">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">สถานะการเดินทาง (Live Tracking GPS)</div>
                    <div className="text-xl font-bold flex items-center gap-2 mt-0.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      {activeRide.status === 'pending' ? 'กำลังรอคนขับกดรับงาน...' : activeRide.status === 'accepted' ? 'คนขับกำลังขับมารับคุณ (พิกัด GPS สด)' : 'เดินทางถึงจุดหมายแล้ว'}
                    </div>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    <div className="text-xs opacity-90">ค่าโดยสารรวม</div>
                    <div className="text-2xl font-extrabold">{activeRide.fare_amount} ฿</div>
                  </div>
                </div>

                <div className="relative h-72 w-full bg-slate-100">
                  <iframe title="Active Map Live" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={activeMapSrc}></iframe>
                </div>

                <div className="p-6 space-y-5">
                  {/* แสดงรูปคนขับและทะเบียนรถฝั่งลูกค้า */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-4">
                      {activeRide.avatar_url ? (
                        <img src={activeRide.avatar_url} alt="Driver" className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl shadow-inner">🧑‍✈️</div>
                      )}
                      <div>
                        <div className="font-bold text-xl text-slate-900">{activeRide.driver_name}</div>
                        <div className="text-sm text-slate-500 mt-0.5">ทะเบียนรถ: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{activeRide.plate_no}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${activeRide.phone}`} className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm">
                        📞 โทร
                      </a>
                      {activeRide.line_qr && (
                        <button onClick={() => setShowQrModal(true)} className="flex items-center gap-1.5 rounded-2xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100 transition shadow-sm">
                          💚 QR Line
                        </button>
                      )}
                    </div>
                  </div>

                  {/* แสดงรูปรถฝั่งลูกค้า */}
                  {activeRide.vehicle_image_url && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">🚗 รูปรถรับจ้าง</div>
                      <img src={activeRide.vehicle_image_url} alt="Vehicle" className="w-full h-48 object-cover rounded-2xl border shadow-inner" />
                    </div>
                  )}

                  <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm border border-slate-100">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">รับ</span>
                      <span className="text-slate-700 font-medium pt-0.5">{activeRide.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold">ส่ง</span>
                      <span className="text-slate-700 font-medium pt-0.5">{activeRide.dropoff_address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => cancelRide(activeRide.id)}
                    className="w-full rounded-2xl bg-red-50 py-3.5 font-bold text-red-600 hover:bg-red-100 transition shadow-sm"
                  >
                    ยกเลิกการเรียกรถ
                  </button>
                </div>

                {showRatingModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl space-y-4 animate-scale-up">
                      <div className="text-4xl">🎉</div>
                      <h3 className="text-xl font-extrabold text-slate-800">ถึงจุดหมายปลายทางแล้ว!</h3>
                      <p className="text-xs text-slate-500">โปรดให้คะแนนความพึงพอใจและรีวิวการบริการ</p>
                      
                      <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingScore(star)}
                            className={`text-3xl transition ${ratingScore >= star ? 'text-amber-400 scale-110' : 'text-slate-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="w-full rounded-2xl border p-3 text-sm bg-slate-50 focus:outline-none focus:border-emerald-500"
                        rows="3"
                        placeholder="เขียนความคิดเห็นหรือข้อเสนอแนะ..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                      ></textarea>

                      <button
                        onClick={submitRating}
                        className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white shadow-md hover:bg-emerald-700 transition"
                      >
                        ⭐ ส่งรีวิวและเสร็จสิ้น
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-emerald-100 space-y-5">
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">📍 เลือกเส้นทางการเดินทาง</h2>
                  <div className="text-xs text-indigo-600 font-medium">🛰️ พิกัดปัจจุบันของคุณ: Lat {riderCoords.lat.toFixed(4)}, Lng {riderCoords.lng.toFixed(4)}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">จุดรับ (Pickup)</label>
                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition shadow-inner"
                        value={pickup?.id || ''}
                        onChange={(e) => setPickup(locations.find(l => l.id == e.target.value))}
                      >
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">ปลายทาง (Dropoff)</label>
                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition shadow-inner"
                        value={dropoff?.id || ''}
                        onChange={(e) => setDropoff(locations.find(l => l.id == e.target.value))}
                      >
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-100 text-emerald-900">
                    <div>
                      <div className="text-xs text-emerald-700 font-medium">ระยะทางประเมิน</div>
                      <div className="text-lg font-extrabold">{tripKm.toFixed(1)} กม.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-emerald-700 font-medium">ค่าโดยสารโดยประมาณ</div>
                      <div className="text-2xl font-extrabold text-emerald-600">{calculatedFare} บาท</div>
                    </div>
                  </div>

                  {mapSrc && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner h-48">
                      <iframe title="Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={mapSrc}></iframe>
                    </div>
                  )}

                  <button
                    onClick={searchDrivers}
                    disabled={loading}
                    className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50 text-base"
                  >
                    {loading ? 'กำลังค้นหารถใกล้คุณ...' : `🔍 ค้นหารถไป ${dropoff?.name || ''}`}
                  </button>
                </div>

                {searched && drivers.length === 0 && (
                  <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm border">
                    📭 ไม่พบรถว่างในพื้นที่ ลองเลือกจุดรับอื่นดูครับ
                  </div>
                )}

                <div className="space-y-3">
                  {drivers.map((d, i) => (
                    <div key={d.driver_id} className="flex items-center justify-between rounded-3xl bg-white p-4 sm:p-5 shadow-md border border-slate-100 hover:border-emerald-200 transition">
                      <div className="flex items-center gap-4">
                        {d.avatar_url ? (
                          <img src={d.avatar_url} alt="Driver" className="w-14 h-14 rounded-2xl object-cover border shadow-sm" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 font-extrabold text-emerald-700 text-lg shadow-inner">
                            {i + 1}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-base text-slate-900">{d.full_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {d.plate_no} · <span className="text-amber-500 font-bold">⭐ {d.rating}</span>
                            {d.distanceKm && <span className="ml-2 text-indigo-600 font-semibold">📍 ห่างจากคุณ {d.distanceKm.toFixed(1)} กม.</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-xs text-slate-400">ราคาประเมิน</div>
                          <div className="font-extrabold text-emerald-600 text-lg">{calculatedFare} ฿</div>
                        </div>
                        <button
                          onClick={() => bookDriver(d)}
                          className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                        >
                          เรียกรถ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : tab === 'driver' ? (
          <div className="space-y-6">
            {!selectedDriverLogin ? (
              <div>
                {selectedDriverTarget ? (
                  <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl border border-teal-100 space-y-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔐</div>
                      <h2 className="text-xl font-extrabold text-slate-800">ใส่รหัสผ่าน (PIN) ของคุณ</h2>
                      <p className="text-xs text-slate-500 mt-1">คนขับ: <span className="font-bold text-teal-600">{selectedDriverTarget.full_name}</span></p>
                    </div>
                    {driverPinError && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600 text-center font-medium">{driverPinError}</div>}
                    <form onSubmit={handleDriverPinLogin} className="space-y-4">
                      <div>
                        <input 
                          type="password" 
                          maxLength="10"
                          required 
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center text-xl tracking-widest focus:bg-white focus:border-teal-500 focus:outline-none shadow-inner" 
                          value={driverPinInput} 
                          onChange={e => setDriverPinInput(e.target.value)} 
                          placeholder="••••" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 rounded-2xl bg-teal-600 py-3.5 font-bold text-white shadow-lg hover:bg-teal-700 transition">ยืนยันรหัสผ่าน</button>
                        <button type="button" onClick={() => { setSelectedDriverTarget(null); setDriverPinInput(''); setDriverPinError(''); }} className="rounded-2xl bg-slate-200 px-5 py-3.5 font-bold text-slate-700 hover:bg-slate-300 transition">ย้อนกลับ</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white p-8 shadow-xl border border-teal-100 text-center space-y-4">
                    <div className="text-3xl">🧑‍✈️</div>
                    <h2 className="text-xl font-extrabold text-slate-800">เลือกชื่อคนขับเพื่อเข้าสู่ระบบรับงาน</h2>
                    <p className="text-xs text-slate-500">จำลองหน้าจอสำหรับคนขับรถในจังหวัดน่าน</p>
                    <div className="space-y-2 pt-2 max-w-sm mx-auto">
                      {allDrivers.length === 0 ? (
                        <div className="text-sm text-slate-400">ยังไม่มีข้อมูลคนขับในระบบ โปรดเพิ่มคนขับในหลังบ้านก่อน</div>
                      ) : (
                        allDrivers.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => { setSelectedDriverTarget(d); setDriverPinInput(''); setDriverPinError(''); }}
                            className="w-full flex items-center justify-between rounded-2xl border p-4 hover:bg-teal-50 transition text-left"
                          >
                            <div className="flex items-center gap-3">
                              {d.avatar_url && <img src={d.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />}
                              <div>
                                <div className="font-bold text-slate-900">{d.full_name}</div>
                                <div className="text-xs text-slate-500">{d.plate_no} · ⭐ {d.rating}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">PIN ➔</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {newRideAlert && selectedDriverLogin.is_online && (
                  <div className="rounded-3xl bg-amber-400 p-4 text-slate-900 font-extrabold shadow-lg flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚨</span>
                      <span>มีงานเรียกรถใหม่เข้ามาแล้ว! โปรดตรวจสอบด้านล่าง</span>
                    </div>
                    <button onClick={() => setNewRideAlert(false)} className="text-sm bg-black/10 px-3 py-1 rounded-xl">ปิด</button>
                  </div>
                )}

                <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white shadow-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {selectedDriverLogin.avatar_url && <img src={selectedDriverLogin.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40" />}
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-80">บัญชีคนขับรถ (Real GPS Tracking)</div>
                        <div className="text-xl font-bold mt-0.5">{selectedDriverLogin.full_name}</div>
                        <div className="text-xs opacity-90 mt-1">ทะเบียนรถ: {selectedDriverLogin.plate_no} · ⭐ {selectedDriverLogin.rating}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedDriverLogin(null); setDriverActiveRide(null); setNewRideAlert(false); }}
                      className="rounded-2xl bg-white/25 backdrop-blur-md px-4 py-2 text-xs font-bold hover:bg-white/40 transition"
                    >
                      ออกจากระบบ
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/15 backdrop-blur-md p-3.5 rounded-2xl">
                    <span className="text-xs font-bold">สถานะรับงานของคุณ: <span className={selectedDriverLogin.is_online ? 'text-emerald-300' : 'text-slate-300'}>{selectedDriverLogin.is_online ? '🟢 ออนไลน์ (พร้อมรับงาน)' : '🔴 ออฟไลน์ (พักผ่อน)'}</span></span>
                    <button
                      onClick={async () => {
                        await toggleDriverStatus(selectedDriverLogin.id, selectedDriverLogin.is_online)
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow transition ${selectedDriverLogin.is_online ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                      {selectedDriverLogin.is_online ? 'เปลี่ยนเป็นออฟไลน์' : 'กดออนไลน์รับงาน'}
                    </button>
                  </div>
                </div>

                {/* แผงควบคุม GPS จริง และ ตัวจำลองพิกัด */}
                <div className="rounded-3xl bg-white p-5 shadow-md border space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-500 uppercase">🛰️ ระบบติดตามพิกัด GPS</div>
                    <button
                      onClick={updateDriverRealGPS}
                      className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-700 transition"
                    >
                      📍 ดึงพิกัด GPS มือถือจริง
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">พิกัดปัจจุบัน: Lat {selectedDriverLogin.current_lat.toFixed(4)}, Lng {selectedDriverLogin.current_lng.toFixed(4)}</div>
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                    <div></div>
                    <button onClick={() => simulateDriverMove('north')} className="rounded-xl bg-teal-100 p-2 text-xs font-bold text-teal-800 hover:bg-teal-200">⬆️ ขึ้นเหนือ</button>
                    <div></div>
                    <button onClick={() => simulateDriverMove('west')} className="rounded-xl bg-teal-100 p-2 text-xs font-bold text-teal-800 hover:bg-teal-200">⬅️ เลี้ยวซ้าย</button>
                    <button onClick={() => simulateDriverMove('south')} className="rounded-xl bg-teal-100 p-2 text-xs font-bold text-teal-800 hover:bg-teal-200">⬇️ ลงใต้</button>
                    <button onClick={() => simulateDriverMove('east')} className="rounded-xl bg-teal-100 p-2 text-xs font-bold text-teal-800 hover:bg-teal-200">➡️ เลี้ยวขวา</button>
                  </div>
                </div>

                {(() => {
                  const driverRides = rideHistory.filter(r => r.driver_id === selectedDriverLogin.id && r.status === 'completed')
                  const totalEarnings = driverRides.reduce((sum, r) => sum + Number(r.fare_amount || 0), 0)
                  return (
                    <div className="rounded-3xl bg-white p-5 shadow-md border flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">รายได้รวมของคุณ</div>
                        <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{totalEarnings} บาท</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase">งานที่สำเร็จ</div>
                        <div className="text-xl font-extrabold text-slate-800 mt-0.5">{driverRides.length} เที่ยว</div>
                      </div>
                    </div>
                  )
                })()}

                {driverActiveRide ? (
                  <div className="rounded-3xl bg-white p-6 shadow-xl border space-y-4">
                    <div className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-700">
                      🚗 กำลังปฏิบัติงานรับ-ส่งผู้โดยสาร
                    </div>
                    <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-2xl border space-y-1">
                      <div>📍 <span className="font-bold">จุดรับ:</span> {driverActiveRide.pickup_address}</div>
                      <div>🏁 <span className="font-bold">ปลายทาง:</span> {driverActiveRide.dropoff_address}</div>
                      <div>💰 <span className="font-bold text-emerald-600">ค่าโดยสาร:</span> {driverActiveRide.fare_amount} บาท</div>
                      <div className="text-xs text-indigo-600 pt-1 border-t border-slate-200 mt-2">
                        ⏰ <b>เวลางานเข้า:</b> {formatTimeOnly(driverActiveRide.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => completeRideByDriver(driverActiveRide.id)}
                      className="w-full rounded-2xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg hover:bg-emerald-700 transition"
                    >
                      🏁 ถึงปลายทาง / จบงานนี้
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-md">🔔 งานเรียกรถที่รอการตอบรับ</h3>
                    {!selectedDriverLogin.is_online ? (
                      <div className="rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center text-amber-800 space-y-2">
                        <div className="text-2xl">⚠️</div>
                        <div className="text-sm font-bold">คุณกำลังอยู่ในสถานะ "ออฟไลน์"</div>
                        <div className="text-xs">กรุณากดปุ่ม "กดออนไลน์รับงาน" ด้านบน เพื่อเริ่มรับงานจากผู้โดยสาร</div>
                      </div>
                    ) : incomingRides.length === 0 ? (
                      <div className="rounded-3xl bg-white p-8 text-center text-slate-400 shadow-sm border space-y-2">
                        <div className="text-2xl">⏳</div>
                        <div className="text-sm font-medium">ยังไม่มีผู้โดยสารเรียกเข้ามาในขณะนี้...</div>
                        <div className="text-xs text-slate-400">ระบบจะส่งเสียงเตือนและอัปเดตงานให้อัตโนมัติทันที</div>
                      </div>
                    ) : (
                      incomingRides.map((ride) => (
                        <div key={ride.id} className="rounded-3xl bg-white p-6 shadow-xl border-2 border-teal-400 space-y-4 animate-bounce-short">
                          <div className="flex justify-between items-center">
                            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">งานใหม่เข้ามา!</span>
                            <span className="text-lg font-extrabold text-emerald-600">{ride.fare_amount} ฿</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>📍 <span className="font-bold">รับที่:</span> {ride.pickup_address}</div>
                            <div>🏁 <span className="font-bold">ไปส่งที่:</span> {ride.dropoff_address}</div>
                            <div className="text-xs text-indigo-600 font-bold pt-1">⏰ เวลาที่ลูกค้าเรียก: {formatTimeOnly(ride.created_at)}</div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => acceptRideByDriver(ride)}
                              className="flex-1 rounded-2xl bg-teal-600 py-3 font-bold text-white shadow-lg hover:bg-teal-700 transition"
                            >
                              ✅ รับงานนี้ทันที
                            </button>
                            <button
                              onClick={() => rejectRideByDriver(ride.id)}
                              className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 border border-red-200 hover:bg-red-100 transition"
                            >
                              ❌ ไม่รับงาน
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {!isAdminLoggedIn ? (
              <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl border border-indigo-100">
                <div className="text-center mb-6">
                  <div className="inline-block p-3 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl mb-2">🔐</div>
                  <h2 className="text-2xl font-extrabold text-indigo-900">เข้าสู่ระบบ Admin</h2>
                  <p className="text-xs text-slate-400 mt-1">จัดการระบบหลังบ้าน น่านสมาร์ทไรด์</p>
                </div>
                {loginError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600 text-center font-medium">{loginError}</div>}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                    <input type="text" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-inner" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <input type="password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-inner" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition">เข้าสู่ระบบ</button>
                  <p className="text-center text-xs text-slate-400 pt-2">ค่าเริ่มต้น: admin / nan1234</p>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* สรุปภาพรวมรายได้ */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-indigo-900">📊 ภาพรวมระบบขนส่ง</h3>
                    <p className="text-xs text-slate-500">ข้อมูลสถิติการใช้งานและรายได้รวมทั้งหมด</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none rounded-2xl bg-indigo-50 px-4 py-3 text-center border border-indigo-100">
                      <div className="text-xs text-indigo-600 font-semibold">เที่ยววิ่งทั้งหมด</div>
                      <div className="text-xl font-extrabold text-indigo-900">{rideHistory.filter(r => r.status === 'completed').length} เที่ยว</div>
                    </div>
                    <div className="flex-1 sm:flex-none rounded-2xl bg-emerald-50 px-4 py-3 text-center border border-emerald-100">
                      <div className="text-xs text-emerald-600 font-semibold">รายได้รวม</div>
                      <div className="text-xl font-extrabold text-emerald-700">{rideHistory.filter(r => r.status === 'completed').reduce((acc, r) => acc + Number(r.fare_amount || 0), 0)} ฿</div>
                    </div>
                  </div>
                </div>

                {/* ประวัติการเรียกรถล่าสุด */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border">
                  <h3 className="mb-3 text-md font-bold text-slate-800">📜 ประวัติการเรียกรถล่าสุด</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {rideHistory.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm">ยังไม่มีประวัติการเรียกรถ</div>
                    ) : (
                      rideHistory.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 text-sm border">
                          <div>
                            <div className="font-semibold text-slate-800">รับ: {r.pickup_address} ➔ ส่ง: {r.dropoff_address}</div>
                            <div className="text-xs text-slate-400 mt-0.5">เวลา: {formatTimeOnly(r.created_at)} · สถานะ: <span className="font-bold text-indigo-600">{r.status}</span></div>
                          </div>
                          <div className="font-extrabold text-emerald-600 text-base">+{r.fare_amount} ฿</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ตั้งค่าเรทราคา */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border">
                  <h3 className="mb-3 text-md font-bold text-indigo-900">⛽ ตั้งค่าเรทราคาน้ำมันประจำวัน</h3>
                  <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ค่าบริการเริ่มต้น (บาท)</label>
                      <input type="number" className="w-full rounded-2xl border bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500" value={fareSettings.base_fare} onChange={e=>setFareSettings({...fareSettings, base_fare: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ราคาต่อกิโลเมตร (บาท/กม.)</label>
                      <input type="number" step="0.5" className="w-full rounded-2xl border bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500" value={fareSettings.per_km_rate} onChange={e=>setFareSettings({...fareSettings, per_km_rate: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition">บันทึกเรทราคาใหม่</button>
                    </div>
                  </form>
                </div>

                {/* เพิ่มสถานที่ */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border">
                  <h3 className="mb-3 text-md font-bold text-indigo-900">📍 เพิ่มจุดรับ / สถานที่ท่องเที่ยวใหม่</h3>
                  <form onSubmit={handleAddLocation} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ชื่อสถานที่</label>
                      <input type="text" required className="w-full rounded-2xl border bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500" value={locForm.name} onChange={e=>setLocForm({...locForm, name: e.target.value})} placeholder="เช่น วัดภูเก็ต อ.ปัว" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lat</label>
                        <input type="text" required className="w-full rounded-2xl border bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500" value={locForm.lat} onChange={e=>setLocForm({...locForm, lat: e.target.value})} placeholder="19.1800" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lng</label>
                        <input type="text" required className="w-full rounded-2xl border bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500" value={locForm.lng} onChange={e=>setLocForm({...locForm, lng: e.target.value})} placeholder="100.9200" />
                      </div>
                    </div>
                    <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition">เพิ่มสถานที่</button>
                  </form>
                </div>

                {/* ฟอร์มเพิ่ม/แก้ไข คนขับรถ (รองรับอัปโหลดรูปคนขับและรูปรถ) */}
                <div className={`rounded-3xl bg-white p-6 shadow-xl border-2 ${editingDriverId ? 'border-amber-400 bg-amber-50/20' : 'border-indigo-100'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-indigo-900">
                      {editingDriverId ? '✏️ แก้ไขข้อมูลคนขับและรูปภาพ' : '➕ เพิ่มคนขับรถใหม่ (พร้อมอัปโหลดรูปและ PIN)'}
                    </h2>
                    <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs font-bold text-red-500 hover:underline">ออกจากระบบ</button>
                  </div>
                  {msg && <div className="mb-4 rounded-2xl bg-indigo-50 p-3 text-sm text-indigo-700 font-medium text-center">{msg}</div>}
                  <form onSubmit={handleSaveDriver} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ชื่อ-นามสกุล</label>
                        <input type="text" required className="w-full rounded-2xl border bg-white p-3 text-sm focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.name} onChange={e=>setDriverForm({...driverForm, name:e.target.value})} placeholder="พ่อเลี้ยงใจดี" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">เบอร์โทรศัพท์</label>
                        <input type="text" required className="w-full rounded-2xl border bg-white p-3 text-sm focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.phone} onChange={e=>setDriverForm({...driverForm, phone:e.target.value})} placeholder="**********" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">🔑 รหัสผ่าน PIN คนขับ</label>
                        <input type="text" required className="w-full rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.code} onChange={e=>setDriverForm({...driverForm, code:e.target.value})} placeholder="เช่น 1234" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ป้ายทะเบียน</label>
                        <input type="text" required className="w-full rounded-2xl border bg-white p-3 text-sm focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.plate} onChange={e=>setDriverForm({...driverForm, plate:e.target.value})} placeholder="กข 1234 น่าน" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ยี่ห้อ</label>
                        <input type="text" className="w-full rounded-2xl border bg-white p-3 text-sm focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.brand} onChange={e=>setDriverForm({...driverForm, brand:e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รุ่น</label>
                        <input type="text" className="w-full rounded-2xl border bg-white p-3 text-sm focus:outline-none focus:border-indigo-500 shadow-inner" value={driverForm.model} onChange={e=>setDriverForm({...driverForm, model:e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                      <div>
                        <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">🖼️ รูปถ่ายคนขับ</label>
                        <input type="file" accept="image/*" onChange={e => setDriverAvatarFile(e.target.files[0])} className="w-full rounded-xl border p-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">🚗 รูปถ่ายรถยนต์</label>
                        <input type="file" accept="image/*" onChange={e => setVehicleImageFile(e.target.files[0])} className="w-full rounded-xl border p-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">💚 QR Code LINE</label>
                        <input type="file" accept="image/*" onChange={e => setQrFile(e.target.files[0])} className="w-full rounded-xl border p-2 text-xs" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-3.5 font-bold text-white shadow-md hover:bg-indigo-700 transition">
                        {editingDriverId ? '💾 บันทึกการแก้ไข' : '✨ บันทึกข้อมูลคนขับ'}
                      </button>
                      {editingDriverId && (
                        <button type="button" onClick={cancelEdit} className="rounded-2xl bg-slate-200 px-5 py-3.5 font-bold text-slate-700 hover:bg-slate-400 transition">
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* รายการสถานที่ในระบบ */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border">
                  <h3 className="mb-3 text-md font-bold text-slate-800">📍 สถานที่ในระบบ ({locations.length} แห่ง)</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(l => (
                      <div key={l.id} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border">
                        <span>{l.name}</span>
                        {locations.length > 1 && (
                          <button onClick={() => handleDeleteLocation(l.id)} className="text-red-500 hover:font-bold">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* รายการคนขับทั้งหมด */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border">
                  <h3 className="mb-4 text-md font-bold text-slate-800">📋 รายชื่อคนขับ & ควบคุมรหัส PIN ({allDrivers.length} คน)</h3>
                  <div className="space-y-3">
                    {allDrivers.map((d) => {
                      const driverRides = rideHistory.filter(r => r.driver_id === d.id && r.status === 'completed')
                      const totalEarnings = driverRides.reduce((sum, r) => sum + Number(r.fare_amount || 0), 0)

                      return (
                        <div key={d.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 bg-slate-50/50 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            {d.avatar_url ? (
                              <img src={d.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-xl">🧑‍✈️</div>
                            )}
                            <div>
                              <div className="font-extrabold text-base text-slate-900">{d.full_name} <span className="text-xs font-normal text-slate-500">({d.phone || 'ไม่ระบุเบอร์'})</span></div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                รถ: <span className="font-medium text-slate-700">{d.brand} {d.model}</span> · ทะเบียน: <span className="font-medium text-slate-700">{d.plate_no}</span> 
                                · 🔑 PIN: <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{d.driver_code || '1234'}</span>
                              </div>
                              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold">
                                💰 รายได้รวม: {totalEarnings} บาท ({driverRides.length} เที่ยว)
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => setSelectedDriverReport({ driver: d, rides: driverRides, total: totalEarnings })}
                              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                            >
                              📊 ดูรายได้
                            </button>
                            <button
                              onClick={() => toggleDriverStatus(d.id, d.is_online)}
                              className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition ${d.is_online ? 'bg-emerald-600' : 'bg-slate-400'}`}
                            >
                              {d.is_online ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}
                            </button>
                            <button
                              onClick={() => startEditDriver(d)}
                              className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
                            >
                              ✏️ แก้ไข/PIN
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(d.id, d.profile_id)}
                              className="rounded-xl bg-red-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-600 transition"
                            >
                              🗑️ ลบ
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Modal รายงานรายได้แยกตามคนขับ */}
                {selectedDriverReport && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                      <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-extrabold text-indigo-900">📊 สรุปรายได้รายบุคคล</h3>
                        <button onClick={() => setSelectedDriverReport(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
                      </div>

                      <div className="rounded-2xl bg-indigo-50 p-4 space-y-1 border border-indigo-100">
                        <div className="text-lg font-bold text-indigo-900">{selectedDriverReport.driver.full_name}</div>
                        <div className="text-xs text-indigo-700 font-medium">เบอร์โทร: {selectedDriverReport.driver.phone} | ทะเบียน: {selectedDriverReport.driver.plate_no}</div>
                        <div className="pt-2 text-sm font-semibold text-slate-800 border-t border-indigo-200 mt-2 flex justify-between items-center">
                          <span>ยอดรวมทั้งสิ้น:</span>
                          <span className="text-xl font-extrabold text-emerald-600">{selectedDriverReport.total} บาท ({selectedDriverReport.rides.length} เที่ยว)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">ประวัติเที่ยววิ่ง:</h4>
                        {selectedDriverReport.rides.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-sm">ยังไม่มีประวัติการรับงาน</div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {selectedDriverReport.rides.map((r) => (
                              <div key={r.id} className="flex items-center justify-between rounded-2xl border p-3 text-sm bg-slate-50">
                                <div>
                                  <div className="font-semibold text-slate-800">รับ: {r.pickup_address} ➔ ส่ง: {r.dropoff_address}</div>
                                  <div className="text-xs text-slate-400">จบงานเมื่อ: {formatTimeOnly(r.updated_at || r.created_at)}</div>
                                </div>
                                <div className="font-extrabold text-emerald-600 text-base">+{r.fare_amount} ฿</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedDriverReport(null)}
                        className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white hover:bg-indigo-700 transition"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}