import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ตรวจสอบเฉพาะเส้นทางที่ขึ้นต้นด้วย /ERP
  if (path.startsWith('/ERP')) {
    // เช็ค คุกกี้ความปลอดภัยฝั่ง Server (เราจะเซ็ตคุกกี้ตัวนี้ตอนกด Login สำเร็จ)
    const token = request.cookies.get('erp_logged_in')?.value

    if (token !== 'true') {
      // ถ้ายังไม่ได้ล็อกอิน ให้ดีดกลับไปหน้า Login ทันที
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// กำหนดให้ Middleware ทำงานเฉพาะเส้นทาง /ERP เท่านั้น
export const config = {
  matcher: '/ERP/:path*',
}