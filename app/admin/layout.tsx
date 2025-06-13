'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Play, ShoppingBag, Package } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Lives', href: '/admin/lives', icon: Play },
    { name: 'Articles', href: '/admin/articles', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-pink-600">Admin Panel</h2>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3" size={20} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 ">
          {children}
        </div>
      </div>
    </div>
  )
}