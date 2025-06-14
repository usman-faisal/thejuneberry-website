import { OrderList } from './order-list'
import { getOrders } from '@/app/actions/orders'
import { Order } from '@prisma/client'

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
      </div>

      <OrderList initialOrders={orders as OrderWithItems[]} />
    </div>
  )
}