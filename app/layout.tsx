import './globals.css'

export const metadata = {
  title: 'Cafe & Restaurant POS System',
  description: 'ระบบจัดการร้านขายกาแฟและอาหาร หน้าร้าน ห้องครัว และแคชเชียร์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-slate-100 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}