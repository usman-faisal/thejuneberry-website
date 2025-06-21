'use server'

import cloudinary from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

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
  videoUrl?: string
}

export interface ArticleFilters {
  search?: string
  category?: string
  priceMin?: number
  priceMax?: number
  page?: number
  limit?: number
}

export async function getFilteredArticles(filters: ArticleFilters = {}) {
  const {
    search,
    category,
    priceMin,
    priceMax,
    page = 1,
    limit = 12
  } = filters

  // Build where clause
  const where: Prisma.ArticleWhereInput = {
    inStock: true, // Only show in-stock items
    AND: [
      // Search filter
      search ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      } : {},
      
      // Category filter
      category && category !== 'all' ? {
        category: category
      } : {},
      
      // Price range filter
      (priceMin !== undefined || priceMax !== undefined) ? {
        price: {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax })
        }
      } : {}
    ].filter(condition => Object.keys(condition).length > 0)
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit

  // Get articles and total count
  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        images: true,
        sizes: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.article.count({ where })
  ])

  return {
    articles,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1
  }
}

export async function getArticleCategories() {
  const categories = await prisma.article.findMany({
    select: { category: true },
    where: { category: { not: null } },
    distinct: ['category']
  })
  
  return categories.map(item => item.category).filter(Boolean)
}

export async function createArticle(data: ArticleFormData) {
  try {
    // Validate required fields
    if (!data.name?.trim()) {
      return { success: false, error: 'Article name is required' }
    }

    if (!data.price || data.price <= 0) {
      return { success: false, error: 'Valid price is required' }
    }

    if (!data.images || data.images.length === 0) {
      return { success: false, error: 'At least one image is required' }
    }

    const article = await prisma.article.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        category: data.category?.trim() || null,
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
            size: size.trim()
          }))
        }
      },
      include: {
        images: true,
        sizes: true,
      }
    })

    revalidatePath('/admin/articles')
    revalidatePath('/articles')
    return { success: true, article }
  } catch (error) {
    console.error('Error creating article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create article' 
    }
  }
}

async function deleteCloudinaryImages(images: Pick<ArticleImage, 'public_id'>[]) {
  const deletePromises = images
    .filter(image => image.public_id)
    .map(async (image) => {
      try {
        await cloudinary.uploader.destroy(image.public_id!)
      } catch (error) {
        console.warn(`Failed to delete image ${image.public_id} from Cloudinary:`, error)
        // Don't throw here, continue with other deletions
      }
    })

  await Promise.all(deletePromises)
}

export async function updateArticle(id: string, data: ArticleFormData) {
  try {
    console.log('Updating article with data:', { id, images: data.images })
    
    // Validate required fields
    if (!data.name?.trim()) {
      return { success: false, error: 'Article name is required' }
    }

    if (!data.price || data.price <= 0) {
      return { success: false, error: 'Valid price is required' }
    }

    if (!data.images || data.images.length === 0) {
      return { success: false, error: 'At least one image is required' }
    }

    // Get existing images for cleanup
    const existingImages = await prisma.image.findMany({
      where: { articleId: id },
      select: { id: true, public_id: true }
    })

    console.log('Existing images to be deleted:', existingImages)

    // Start a transaction to ensure data consistency
    const article = await prisma.$transaction(async (tx) => {
      // Delete existing images from Cloudinary (don't wait for this)
      deleteCloudinaryImages(existingImages).catch(console.error)

      // Delete existing images and sizes from database
      await Promise.all([
        tx.image.deleteMany({
          where: { articleId: id }
        }),
        tx.articleSize.deleteMany({
          where: { articleId: id }
        })
      ])

      console.log('Creating new images:', data.images)

      // Update article with new data
      return tx.article.update({
        where: { id },
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: data.price,
          category: data.category?.trim() || null,
          inStock: data.inStock,
          liveId: data.liveId,
          videoUrl: data.videoUrl,
          images: {
            create: data.images.map(img => ({
              url: img.url,
              public_id: img.public_id || ''
            }))
          },
          sizes: {
            create: data.sizes.map(size => ({
              size: size.trim()
            }))
          }
        },
        include: {
          images: true,
          sizes: true,
        }
      })
    })

    console.log('Article updated successfully with images:', article.images)

    revalidatePath('/admin/articles')
    revalidatePath('/articles')
    return { success: true, article }
  } catch (error) {
    console.error('Error updating article:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update article' 
    }
  }
}