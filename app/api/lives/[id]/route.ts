import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const live = await prisma.live.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            images: true,
            sizes: true
          }
        }
      }
    })
    
    if (!live) {
      return NextResponse.json({ error: 'Live not found' }, { status: 404 })
    }
    
    return NextResponse.json(live)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch live' }, { status: 500 })
  }
}

// delete and update functions
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const live = await prisma.live.delete({
      where: { id }
    })
    return NextResponse.json(live)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete live' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { id } = await context.params
    const live = await prisma.live.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnail
      }
    })
    return NextResponse.json(live)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update live' }, { status: 500 })
  }
}