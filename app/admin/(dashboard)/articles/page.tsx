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

  const lives = await prisma.live.findMany()

  async function handleEdit(article: any) {
    'use server'
    revalidatePath('/admin/articles')
  }

  async function handleDelete(id: string) {
    'use server'
    try {
      const imagesData = await prisma.image.findMany({
        where: { articleId: id },
        select: {
          public_id: true
        }
      })
      
      await Promise.all([
        ...imagesData
          .filter(image => image.public_id)
          .map(image => cloudinary.uploader.destroy(image.public_id)),
        prisma.image.deleteMany({
          where: { articleId: id }
        }),
        prisma.articleSize.deleteMany({
          where: { articleId: id }
        })
      ])
      
      await prisma.article.delete({
        where: { id }
      })
      
      revalidatePath('/admin/articles')
    } catch (error) {
      console.error('Error deleting article:', error)
      throw new Error('Failed to delete article')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Articles Management</h1>
        <ArticleActions lives={lives} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <ArticlesTable 
          lives={lives}
          articles={articles} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}