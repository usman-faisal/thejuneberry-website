import { getLives } from '@/app/actions/lives'
import { getOrders } from '@/app/actions/orders'
import { Play, ShoppingBag, Package, TrendingUp, Users, Clock } from 'lucide-react'

async function getStats() {
  try {
    const [lives, orders] = await Promise.all([
      getLives(),
      getOrders(),
    ])

    // Check if any of the responses contain an error
    if ('error' in lives || 'error' in orders) {
      throw new Error('API request failed')
    }
    return {
      totalLives: Array.isArray(lives.lives) ? lives.lives.length : 0,
      totalOrders: Array.isArray(orders.orders) ? orders.orders.length : 0,
      recentOrders: Array.isArray(orders.orders) ? orders.orders.slice(0, 5) : []
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalLives: 0,
      totalArticles: 0,
      totalOrders: 0,
      recentOrders: []
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-pink-100 text-sm md:text-base">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <Play className="text-blue-600" size={20} />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide">Live Sessions</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalLives}</p>
              <p className="text-xs text-gray-500 mt-1">Active streams</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <ShoppingBag className="text-green-600" size={20} />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide">Articles</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
              <p className="text-xs text-gray-500 mt-1">Published items</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <Package className="text-purple-600" size={20} />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide">Total Orders</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 text-gray-400" size={20} />
              Recent Orders
            </h2>
            <span className="text-xs md:text-sm text-gray-500">Last 5 orders</span>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Package className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-sm md:text-base">No orders yet.</p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Orders will appear here once customers start purchasing.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">Rs. {order.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{order.customerName}</td>
                        <td className="py-3 px-2 text-sm text-gray-900 font-semibold">Rs. {order.total.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}