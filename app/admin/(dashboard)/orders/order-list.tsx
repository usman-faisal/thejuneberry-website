'use client'

import { useEffect, useState } from 'react'
import { Order, OrderStatus } from '@prisma/client'
import { updateOrderStatus, deleteOrder, duplicateOrder } from '@/app/actions/orders'
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
import { Input } from '@/components/ui/input'
import { 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  Copy, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Package,
  User,
  Clock,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { exportToCSV, exportToExcel, prepareOrdersForExport } from '@/lib/export-utils'

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
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders)
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()

  // Filter orders based on search and status
  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm)
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  // Apply filters when search term or status filter changes
  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setLoading(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    
    if (result.success && result.order) {
      const updatedOrders = orders.map(order => 
        order.id === orderId ? result.order as OrderWithItems : order
      )
      setOrders(updatedOrders)
      toast.success('Order status updated successfully')
    } else {
      toast.error(result.error || 'Failed to update order status')
    }
    setLoading(null)
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    
    setLoading(orderToDelete)
    const result = await deleteOrder(orderToDelete)
    
    if (result.success) {
      const updatedOrders = orders.filter(order => order.id !== orderToDelete)
      setOrders(updatedOrders)
      toast.success('Order deleted successfully')
    } else {
      toast.error(result.error || 'Failed to delete order')
    }
    
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
    setLoading(null)
  }

  const handleDuplicateOrder = async (orderId: string) => {
    setLoading(orderId)
    const result = await duplicateOrder(orderId)
    
    if (result.success && result.order) {
      setOrders([result.order as OrderWithItems, ...orders])
      toast.success('Order duplicated successfully')
      router.push(`/admin/orders/${result.order.id}`)
    } else {
      toast.error(result.error || 'Failed to duplicate order')
    }
    setLoading(null)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const exportData = prepareOrdersForExport(filteredOrders)
      exportToCSV(exportData, 'orders_export')
      toast.success(`Exported ${filteredOrders.length} orders to CSV`)
    } catch (error) {
      toast.error('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const exportData = prepareOrdersForExport(filteredOrders)
      exportToExcel(exportData, 'orders_export')
      toast.success(`Exported ${filteredOrders.length} orders to Excel`)
    } catch (error) {
      toast.error('Failed to export Excel')
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL'

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Export Controls */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: OrderStatus | 'ALL') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {Object.keys(statusColors).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Export and Summary Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
            {filteredOrders.length > 0 && (
              <>
                {' • '}
                <span className="font-medium">Rs. {filteredOrders.reduce((sum, order) => sum + order.total + order.shippingCost, 0).toLocaleString()}</span> total value
              </>
            )}
          </div>

          {filteredOrders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Export ({filteredOrders.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV} disabled={exporting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} disabled={exporting}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Orders Content */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 md:p-12 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters ? 'No orders match your filters' : 'No orders yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {hasActiveFilters 
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here once customers start purchasing'
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{order.id.slice(-8)}</span>
                      <Badge className={`${statusColors[order.status]} text-xs border`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading === order.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateOrder(order.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setOrderToDelete(order.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {(order.total + order.shippingCost).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      View
                    </Button>
                    <Select
                      disabled={loading === order.id}
                      defaultValue={order.status}
                      onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-medium">Order ID</TableHead>
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Items</TableHead>
                  <TableHead className="font-medium">Total</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium font-mono text-xs">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">Rs. {(order.total + order.shippingCost).toLocaleString()}</TableCell>
                    <TableCell>
                      <Select
                        disabled={loading === order.id}
                        defaultValue={order.status}
                        onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>
                            <Badge className={`${statusColors[order.status]} text-xs border`}>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading === order.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateOrder(order.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setOrderToDelete(order.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and remove all associated data.
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