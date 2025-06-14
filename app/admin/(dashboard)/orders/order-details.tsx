'use client'

import { Order, OrderStatus } from '@prisma/client'
import { updateOrderStatus } from '@/app/actions/orders'
import { format } from 'date-fns'
import { ArrowLeft, Package, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface OrderDetailsProps {
  order: OrderWithItems
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const router = useRouter()

  const handleStatusChange = async (newStatus: OrderStatus) => {
    const result = await updateOrderStatus(order.id, newStatus)
    if (result.success) {
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <div className="text-sm text-gray-500">
              Order ID: {order.id}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-24">Name:</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span className="font-medium w-24">Email:</span>
                  <span>{order.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span className="font-medium w-24">Phone:</span>
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1" />
                  <span className="font-medium w-24">Address:</span>
                  <div>
                    <div>{order.address}</div>
                    <div>{order.city}{order.postalCode && `, PKR{order.postalCode}`}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(statusColors).map((status) => (
                    <Button
                      key={status}
                      variant={order.status === status ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(status as OrderStatus)}
                      className={order.status === status ? statusColors[status as OrderStatus] : ''}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div>Created: {format(new Date(order.createdAt), 'PPP')}</div>
                  <div>Updated: {format(new Date(order.updatedAt), 'PPP')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    {item.article.images[0] ? (
                      <Image
                        src={item.article.images[0].url}
                        alt={item.article.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <Package className="text-gray-400" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.article.name}</h3>
                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                    <div className="text-sm text-gray-500">Price: PKR{item.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      PKR{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Shipping Cost:</span>
                <span>PKR{order.shippingCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>PKR{(order.shippingCost + order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 