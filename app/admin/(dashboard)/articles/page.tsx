import { prisma } from '@/lib/prisma'
import { ArticlesTable } from './articles-table'
import { ArticleActions } from './article-actions'
import { revalidatePath } from 'next/cache'
import cloudinary from '@/lib/cloudinary'

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <ArticleActions lives={lives} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <ArticlesTable 
          lives={lives}
          articles={articles} 
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}