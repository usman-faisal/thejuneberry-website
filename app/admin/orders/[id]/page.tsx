'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, Eye, Phone, Mail, MapPin } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Prisma.OrderGetPayload<{
    include: { 
      items: {
        include: {
          article: {
            include: {
              images: true
            }
          }
        }
      }
    }
  }> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchOrder(params.id as string)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  if (!order) {
    return <div className="flex justify-center py-12">Order not found</div>
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </button>

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
                    <div>{order.city}{order.postalCode && `, ${order.postalCode}`}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-2 flex-wrap">
                  {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(status)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === status
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
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
                    <div className="text-sm text-gray-500">Price: Rs. {item.price.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 