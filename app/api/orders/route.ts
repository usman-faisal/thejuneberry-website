import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        total: data.total,
        items: {
          create: data.items.map((item: any) => ({
            articleId: item.articleId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    })
    
    return NextResponse.json(order)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}