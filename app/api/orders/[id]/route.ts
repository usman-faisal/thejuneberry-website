import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: context.params.id },
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
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const order = await prisma.order.update({
      where: { id: context.params.id },
      data: { status: data.status },
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
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
} 