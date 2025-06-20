'use server'

import cloudinary from '@/lib/cloudinary'
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
    revalidatePath(`/articles`)
    return { success: true, article }
  } catch (error) {
    console.error('Error creating article:', error)
    return { success: false, error: 'Failed to create article' }
  }
}

async function deleteImages(images: ArticleImage[]) {
  try {
    await Promise.all(
      images.map(async (image) => {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        await prisma.image.delete({
          where: { id: image.id }
        });
      })
    );
  } catch (error) {
    console.error('Error deleting images:', error);
  }
}

export async function updateArticle(id: string, data: ArticleFormData) {
  try {
    const images = await prisma.image.findMany({
      where: { articleId: id }
    })
    await deleteImages(images)
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
    revalidatePath(`/articles`)
    return { success: true, article }
  } catch (error) {
    console.error('Error updating article:', error)
    return { success: false, error: 'Failed to update article' }
  }
} 