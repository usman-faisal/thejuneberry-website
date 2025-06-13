import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        live: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const article = await prisma.article.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image,
        category: data.category,
        size: data.size,
        color: data.color,
        inStock: data.inStock ?? true,
        liveId: data.liveId
      }
    })
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}