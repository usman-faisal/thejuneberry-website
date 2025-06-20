'use client'

import { Order, OrderStatus } from '@prisma/client'
import { updateOrderStatus, deleteOrder, duplicateOrder } from '@/app/actions/orders'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Download,
  MessageCircle
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { toast } from 'sonner'

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

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: []
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true)
    const result = await updateOrderStatus(order.id, newStatus)
    if (result.success) {
      toast.success('Order status updated successfully')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update order status')
    }
    setLoading(false)
  }

  const handleDeleteOrder = async () => {
    setLoading(true)
    const result = await deleteOrder(order.id)
    
    if (result.success) {
      toast.success('Order deleted successfully')
      router.push('/admin/orders')
    } else {
      toast.error(result.error || 'Failed to delete order')
    }
    setLoading(false)
  }

  const handleDuplicateOrder = async () => {
    setLoading(true)
    const result = await duplicateOrder(order.id)
    
    if (result.success && result.order) {
      toast.success('Order duplicated successfully')
      router.push(`/admin/orders/${result.order.id}`)
    } else {
      toast.error(result.error || 'Failed to duplicate order')
    }
    setLoading(false)
  }

  const availableStatusChanges = statusFlow[order.status] || []

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-500 font-mono">
                ID: {order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[order.status]} variant="secondary">
              {order.status}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicateOrder}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Print Order
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        {item.article.images[0] ? (
                          <Image
                            src={item.article.images[0].url}
                            alt={item.article.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <Package className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.article.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × PKR{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          PKR{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>PKR{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>PKR{order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>PKR{(order.total + order.shippingCost).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1">{order.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{order.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1">{order.phone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <div className="mt-1 text-sm">
                    <p>{order.address}</p>
                    <p>{order.city}{order.postalCode && `, ${order.postalCode}`}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={statusColors[order.status]} variant="secondary">
                    {order.status}
                  </Badge>
                </div>
                
                {availableStatusChanges.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Quick Actions:</p>
                    {availableStatusChanges.map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleStatusChange(status)}
                        disabled={loading}
                      >
                        Mark as {status}
                      </Button>
                    ))}
                  </div>
                )}

                <Separator />
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Created: {format(new Date(order.createdAt), 'PPP p')}</p>
                  <p>Updated: {format(new Date(order.updatedAt), 'PPP p')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleDuplicateOrder}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Order
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Print Order
                </Button>
                {order.email && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`mailto:${order.email}?subject=Order ${order.id}`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Email Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this order? This action cannot be undone
                and will permanently remove all order data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}