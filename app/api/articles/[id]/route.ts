import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        live: true,
        images: true,
        sizes: true
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
) {
  try {
    const { articleId } = await request.json()
    // get article images
    const articleImages = await prisma.image.findMany({
      where: { articleId: articleId }
    })
    // delete images from cloudinary
    const deletePromises = articleImages
      .map(image => {
        cloudinary.uploader.destroy(image.public_id)
      })
    await Promise.all(deletePromises)
    // delete article
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const article = await prisma.article.delete({
      where: { id: articleId },
      include: {
        images: true,
        live: true,
        sizes: true
      }
    })
    return NextResponse.json(article)
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const oldSizes = await prisma.articleSize.findMany({
      where: { articleId: id }
    })

    const incomingSizes = data.sizes || []

    // Extract size values for easy comparison
    const oldSizeValues = oldSizes.map(s => s.size)
    const newSizeValues = incomingSizes

    // Find sizes to add (in incoming but not in DB)
    const sizesToAdd = newSizeValues.filter((size: any) => !oldSizeValues.includes(size))

    // Find sizes to delete (in DB but not in incoming)
    const sizesToDelete = oldSizes.filter(oldSize => !newSizeValues.includes(oldSize.size))

    // Delete removed sizes
    await prisma.articleSize.deleteMany({
      where: {
        articleId: id,
        size: { in: sizesToDelete.map(s => s.size) }
      }
    })

    // Update article and add new sizes
    const article = await prisma.article.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        sizes: {
          create: sizesToAdd.map((size: any) => ({ size }))
        },
        inStock: data.inStock ?? true,
        liveId: data.liveId
      }
    })
    return NextResponse.json(article)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}