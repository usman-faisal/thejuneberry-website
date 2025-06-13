import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        live: true
      }
    })
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.delete({
      where: { id: params.id }
    })
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const article = await prisma.article.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}