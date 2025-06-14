import Link from 'next/link'
import { LayoutDashboard, Play, ShoppingBag, Package } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LogoutButton } from './logout-button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Lives', href: '/admin/lives', icon: Play },
    { name: 'Articles', href: '/admin/articles', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-pink-600">Admin Panel</h2>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <item.icon className="mr-3" size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <LogoutButton />
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}