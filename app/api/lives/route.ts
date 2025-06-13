import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const lives = await prisma.live.findMany({
      include: {
        articles: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(lives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lives' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const live = await prisma.live.create({
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
    return NextResponse.json({ error: 'Failed to create live' }, { status: 500 })
  }
}