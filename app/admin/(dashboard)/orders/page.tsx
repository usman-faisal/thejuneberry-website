import { OrderList } from './order-list'
import { getOrders } from '@/app/actions/orders'
import { Order } from '@prisma/client'
import { Package, Plus, TrendingUp } from 'lucide-react'

interface OrderWithItems extends Order {
  items: Array<{
    id: string
    quantity: number
    price: number
    article: {
      id: string
      name: string
      images: Array<{
        url: string
      }>
    }
  }>
}

export default async function AdminOrdersPage() {
  const { orders } = await getOrders()

  // Calculate quick stats
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total + order.shippingCost, 0) || 0
  const pendingOrders = orders?.filter((order: any) => order.status === 'PENDING').length || 0
  const deliveredOrders = orders?.filter((order: any) => order.status === 'DELIVERED').length || 0

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        
        {/* Quick Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg md:text-xl font-bold text-gray-900">{orders?.length || 0}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg md:text-xl font-bold text-yellow-600">{pendingOrders}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-lg md:text-xl font-bold text-green-600">{deliveredOrders}</div>
            <div className="text-xs text-gray-500">Delivered</div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-2xl md:text-3xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <OrderList initialOrders={orders as OrderWithItems[]} />
    </div>
  )
}