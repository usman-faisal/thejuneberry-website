'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface ArticleImage {
  id?: string
  url: string
  public_id?: string
  articleId?: string | null
}

interface ArticleFormData {
  name: string
  description: string
  price: number
  images: ArticleImage[]
  category: string
  sizes: string[]
  inStock: boolean
  liveId: string | null
}

export async function createArticle(data: ArticleFormData) {
  try {
    const article = await prisma.article.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        inStock: data.inStock,
        liveId: data.liveId,
        images: {
          create: data.images.map(img => ({
            url: img.url,
            public_id: img.public_id || ''
          }))
        },
        sizes: {
          create: data.sizes.map(size => ({
            size
          }))
        }
      },
      include: {
        images: true,
        sizes: true,
      }
    })

    revalidatePath('/admin/articles')
    return { success: true, article }
  } catch (error) {
    console.error('Error creating article:', error)
    return { success: false, error: 'Failed to create article' }
  }
}

export async function updateArticle(id: string, data: ArticleFormData) {
  try {
    // First delete existing images and sizes
    await prisma.image.deleteMany({
      where: { articleId: id }
    })
    await prisma.articleSize.deleteMany({
      where: { articleId: id }
    })

    const article = await prisma.article.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        inStock: data.inStock,
        liveId: data.liveId,
        images: {
          create: data.images.map(img => ({
            url: img.url,
            public_id: img.public_id || ''
          }))
        },
        sizes: {
          create: data.sizes.map(size => ({
            size
          }))
        }
      },
      include: {
        images: true,
        sizes: true,
      }
    })

    revalidatePath('/admin/articles')
    return { success: true, article }
  } catch (error) {
    console.error('Error updating article:', error)
    return { success: false, error: 'Failed to update article' }
  }
} 