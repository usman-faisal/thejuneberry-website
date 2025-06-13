import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/navigation'
// import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TheJuneBerry - Beautiful Dresses Across Pakistan',
  description: 'Discover beautiful dresses through our live showcases. Shop the latest fashion trends delivered across Pakistan.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        {/* <Toaster /> */}
      </body>
    </html>
  )
}