import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navigation'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TheJuneBerry - Premium Dresses',
  description: 'Premium dresses for women across Pakistan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>
    </html>
  )
}