'use client'

import { Edit, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { Prisma } from '@prisma/client'
import { useState } from 'react'
import { ArticleForm } from './article-form'

interface ArticlesTableProps {
  articles: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>[]
  onEdit: (article: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>) => void
  onDelete: (id: string) => void
}

export function ArticlesTable({ articles, onEdit, onDelete }: ArticlesTableProps) {
  const [editingArticle, setEditingArticle] = useState<Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }> | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        setIsDeleting(true)
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting article:', error)
        alert('Failed to delete article')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No articles created yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Article
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => {
            const images = article.images || []
            const primaryImage = images[0]?.url
            const sizes = article.sizes.map(sizeObj => sizeObj.size).join(', ') || ''

            return (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 relative">
                      {primaryImage ? (
                        <>
                          <Image
                            className="h-10 w-10 rounded object-cover"
                            src={primaryImage}
                            width={150}
                            height={150}
                            alt="Article Image"
                          />
                          {images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {images.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <ShoppingBag size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{article.name}</div>
                      <div className="text-sm text-gray-500">
                        {sizes && `Sizes: ${sizes}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Rs. {article.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {article.category || 'Uncategorized'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {article.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="text-indigo-600 hover:text-indigo-900"
                      disabled={isDeleting}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {editingArticle && (
        <ArticleForm
          onClose={() => setEditingArticle(null)}
          editingArticle={editingArticle}
          lives={[]}
        />
      )}
    </div>
  )
} 