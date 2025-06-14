'use client'

import { useState } from 'react'
import { Order, OrderStatus } from '@prisma/client'
import { updateOrderStatus } from '@/app/actions/orders'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface OrderListProps {
  initialOrders: OrderWithItems[]
}

const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

export function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders)
  const router = useRouter()

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success && result.order) {
      setOrders(orders.map(order => 
        order.id === orderId ? result.order as OrderWithItems : order
      ))
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusColors).map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge className={statusColors[status as OrderStatus]}>
                          {status}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 