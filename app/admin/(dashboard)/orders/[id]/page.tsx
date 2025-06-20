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

  return <OrderDetails order={order} />
}