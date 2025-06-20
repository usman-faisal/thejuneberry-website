import { prisma } from '@/lib/prisma'
import { ArticlesTable } from './articles-table'
import { ArticleActions } from './article-actions'
import { revalidatePath } from 'next/cache'
import cloudinary from '@/lib/cloudinary'
import { ShoppingBag, Package, DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      images: true,
      sizes: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const lives = await prisma.live.findMany({
    orderBy: {
      date: 'desc'
    }
  })

  // Calculate stats
  const totalValue = articles.reduce((sum, article) => sum + article.price, 0)
  const inStockCount = articles.filter(article => article.inStock).length
  const outOfStockCount = articles.length - inStockCount
  const featuredCount = articles.filter(article => article.liveId).length

  async function handleDelete(id: string) {
    'use server'
    try {
      // Get all images for this article
      const imagesData = await prisma.image.findMany({
        where: { articleId: id },
        select: {
          public_id: true
        }
      })
      
      // Delete from Cloudinary and database in parallel
      await Promise.all([
        // Delete images from Cloudinary
        ...imagesData
          .filter(image => image.public_id)
          .map(image => cloudinary.uploader.destroy(image.public_id).catch(err => 
            console.warn(`Failed to delete image ${image.public_id} from Cloudinary:`, err)
          )),
        // Delete related data from database
        prisma.image.deleteMany({
          where: { articleId: id }
        }),
        prisma.articleSize.deleteMany({
          where: { articleId: id }
        })
      ])
      
      // Finally delete the article
      await prisma.article.delete({
        where: { id }
      })
      
      revalidatePath('/admin/articles')
      return { success: true }
    } catch (error) {
      console.error('Error deleting article:', error)
      return { success: false, error: 'Failed to delete article' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Articles Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>
          <ArticleActions lives={lives} />
        </div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-gray-900">{articles.length}</div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-green-600">{inStockCount}</div>
            <div className="text-xs text-gray-500">In Stock</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-red-600">{outOfStockCount}</div>
            <div className="text-xs text-gray-500">Out of Stock</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-purple-600">{featuredCount}</div>
            <div className="text-xs text-gray-500">Featured</div>
          </div>
        </div>
      </div>

      {/* Total Value Card */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Total Catalog Value</p>
            <p className="text-2xl md:text-3xl font-bold">Rs. {totalValue.toLocaleString()}</p>
            <p className="text-green-100 text-sm mt-1">{articles.length} articles in catalog</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <ArticlesTable 
        lives={lives}
        articles={articles} 
        onDelete={handleDelete}
      />
    </div>
  )
}