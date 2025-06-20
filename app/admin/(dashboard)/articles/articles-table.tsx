'use client'

import { Edit, Trash2, ShoppingBag, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Live, Prisma } from '@prisma/client'
import { useState } from 'react'
import { ArticleForm } from './article-form'
import { toast } from 'sonner'

interface ArticlesTableProps {
  articles: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>[]
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  lives: Live[]
}

export function ArticlesTable({ articles, onDelete, lives }: ArticlesTableProps) {
  const [editingArticle, setEditingArticle] = useState<Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, articleName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${articleName}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeletingId(id)
      const result = await onDelete(id)
      
      if (result.success) {
        toast.success('Article deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete article')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
    } finally {
      setDeletingId(null)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first article.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Article
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Live
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {articles.map((article) => {
              const images = article.images || []
              const primaryImage = images[0]?.url
              const sizes = article.sizes.map(sizeObj => sizeObj.size).join(', ') || 'No sizes'
              const isDeleting = deletingId === article.id
              const associatedLive = lives.find(live => live.id === article.liveId)

              return (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 flex-shrink-0 relative">
                        {primaryImage ? (
                          <>
                            <Image
                              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              src={primaryImage}
                              width={64}
                              height={64}
                              alt={article.name}
                            />
                            {images.length > 1 && (
                              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                                {images.length}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                            <ShoppingBag size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {article.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Sizes: {sizes}
                        </div>
                        {article.description && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                            {article.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      Rs. {article.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {article.category || (
                        <span className="text-gray-400 italic">Uncategorized</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div 
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          article.inStock ? 'bg-green-400' : 'bg-red-400'
                        }`} 
                      />
                      {article.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {associatedLive ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 truncate max-w-32">
                          {associatedLive.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(associatedLive.date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not featured</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingArticle(article)}
                        disabled={isDeleting}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit article"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.name)}
                        disabled={isDeleting}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete article"
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingArticle && (
        <ArticleForm
          onClose={() => setEditingArticle(null)}
          editingArticle={editingArticle}
          lives={lives}
        />
      )}
    </>
  )
}