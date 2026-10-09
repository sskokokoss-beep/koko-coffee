import './globals.css'

export const metadata = {
  title: 'Enterprise ERP System',
  description: 'ระบบบริหารจัดการทรัพยากรองค์กรอัจฉริยะ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}