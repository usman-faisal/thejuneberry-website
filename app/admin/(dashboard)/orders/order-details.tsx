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
  Download,
  MessageCircle,
  Clock,
  User,
  CreditCard,
  Truck
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
    size: string | null
    article: {
      id: string
      name: string
      images: string[]
    }
  }>
}

interface OrderDetailsProps {
  order: OrderWithItems
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">Order Details</h1>
            <p className="text-sm text-gray-500 font-mono">#{order.id.slice(-8)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={loading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicateOrder}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Status Card */}
        <div className="bg-white p-4 rounded-xl border mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Current Status</span>
            <Badge className={`${statusColors[order.status]} border`}>
              {order.status}
            </Badge>
          </div>
          {availableStatusChanges.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {availableStatusChanges.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={loading}
                  className="text-xs"
                >
                  Mark {status}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between">
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
            <p className="text-sm text-gray-500 font-mono">ID: {order.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[order.status]} border`} variant="secondary">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 md:p-4 border rounded-lg">
                    <div className="w-12 h-12 md:w-16 md:h-16 relative flex-shrink-0">
                      {item.article.images[0] ? (
                        <Image
                          src={item.article.images[0]}
                          alt={item.article.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <Package className="text-gray-400" size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{item.article.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                        {item.size && (
                          <span className="ml-2">| <span className="font-semibold">Size:</span> {item.size}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm md:text-base">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Rs. {order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>Rs. {(order.total + order.shippingCost).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Name
                    </label>
                    <p className="text-sm md:text-base">{order.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </label>
                    <p className="text-sm md:text-base">{order.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </label>
                  <p className="text-sm md:text-base">{order.phone}</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Shipping Address
                  </label>
                  <div className="text-sm md:text-base text-gray-700">
                    <p>{order.address}</p>
                    <p>{order.city}{order.postalCode && `, ${order.postalCode}`}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Desktop Order Status */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${statusColors[order.status]} border`} variant="secondary">
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
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Created: {format(new Date(order.createdAt), 'PPP p')}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated: {format(new Date(order.updatedAt), 'PPP p')}
                </p>
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

          {/* Order Timeline - Mobile */}
          <Card className="lg:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Created: {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Updated: {format(new Date(order.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
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
  )
}