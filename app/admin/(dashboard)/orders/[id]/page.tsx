import { getOrder } from '@/app/actions/orders'
import { OrderDetails } from '../order-details'
import { notFound } from 'next/navigation'

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const { order } = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
      </div>

      <OrderDetails order={order} />
    </div>
  )
}