import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        images: true,
        live: true,
        sizes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { images, ...articleData } = data
    
    const article = await prisma.article.create({
      data: {
        name: articleData.name,
        description: articleData.description,
        price: parseFloat(articleData.price),
        category: articleData.category,
        sizes: {
          create: (articleData.sizes || []).map((size: any) => ({
            size: size,
          }))
        },
        inStock: articleData.inStock ?? true,
        liveId: articleData.liveId || null,
        images: {
          create: (images || []).map((image: any) => ({ url: image.url, public_id: image.public_id }))
        }
      },
      include: {
        images: true,
        live: true
      }
    })
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}