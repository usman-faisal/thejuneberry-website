import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface OrderExportData {
  orderId: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  country: string
  postalCode: string
  orderDate: string
  status: string
  itemTitles: string
  itemQuantities: string
  subtotal: number
  shippingCost: number
  total: number
}

export function prepareOrdersForExport(orders: any[]): OrderExportData[] {
  return orders.map(order => {
    const itemTitles = order.items.map((item: any) => item.article.name).join('; ')
    const itemQuantities = order.items.map((item: any) => `${item.article.name}: ${item.quantity}`).join('; ')
    
    return {
      orderId: order.id,
      customerName: order.customerName,
      email: order.email || '',
      phone: order.phone,
      address: order.address,
      city: order.city,
      province: order.province || '',
      country: order.country || 'Pakistan',
      postalCode: order.postalCode || '',
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      status: order.status,
      itemTitles,
      itemQuantities,
      subtotal: order.total,
      shippingCost: order.shippingCost,
      total: order.total + order.shippingCost
    }
  })
}

export function exportToCSV(data: OrderExportData[], filename: string = 'orders') {
  const headers = [
    'Order ID',
    'Customer Name',
    'Email',
    'Phone',
    'Address',
    'City',
    'Province',
    'Country',
    'Postal Code',
    'Order Date',
    'Status',
    'Items',
    'Item Quantities',
    'Subtotal (PKR)',
    'Shipping Cost (PKR)',
    'Total (PKR)'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.orderId}"`,
      `"${row.customerName}"`,
      `"${row.email}"`,
      `"${row.phone}"`,
      `"${row.address}"`,
      `"${row.city}"`,
      `"${row.province}"`,
      `"${row.country}"`,
      `"${row.postalCode}"`,
      `"${row.orderDate}"`,
      `"${row.status}"`,
      `"${row.itemTitles}"`,
      `"${row.itemQuantities}"`,
      row.subtotal,
      row.shippingCost,
      row.total
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportToExcel(data: OrderExportData[], filename: string = 'orders') {
  const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
    'Order ID': row.orderId,
    'Customer Name': row.customerName,
    'Email': row.email,
    'Phone': row.phone,
    'Address': row.address,
    'City': row.city,
    'Province': row.province,
    'Country': row.country,
    'Postal Code': row.postalCode,
    'Order Date': row.orderDate,
    'Status': row.status,
    'Items': row.itemTitles,
    'Item Quantities': row.itemQuantities,
    'Subtotal (PKR)': row.subtotal,
    'Shipping Cost (PKR)': row.shippingCost,
    'Total (PKR)': row.total
  })))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
  
  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, r.customerName.length, r.itemTitles.length), 10)
  worksheet['!cols'] = [
    { wch: 15 }, // Order ID
    { wch: 20 }, // Customer Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // Province
    { wch: 10 }, // Country
    { wch: 12 }, // Postal Code
    { wch: 12 }, // Order Date
    { wch: 10 }, // Status
    { wch: 40 }, // Items
    { wch: 40 }, // Item Quantities
    { wch: 15 }, // Subtotal
    { wch: 15 }, // Shipping Cost
    { wch: 15 }  // Total
  ]

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}