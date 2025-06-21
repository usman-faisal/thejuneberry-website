'use client'

import { Edit, Trash2, ShoppingBag, AlertCircle, Search, Filter, X, Eye, Tag, Package } from 'lucide-react'
import Image from 'next/image'
import { Live, Prisma } from '@prisma/client'
import { useState, useEffect } from 'react'
import { ArticleForm } from './article-form'
import { toast } from 'sonner'

interface ArticlesTableProps {
  articles: Prisma.ArticleGetPayload<{
    include: {  sizes: true };
  }>[]
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  lives: Live[]
}

export function ArticlesTable({ articles, onDelete, lives }: ArticlesTableProps) {
  const [editingArticle, setEditingArticle] = useState<Prisma.ArticleGetPayload<{
    include: {  sizes: true };
  }> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filteredArticles, setFilteredArticles] = useState(articles)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'inStock' | 'outOfStock' | 'featured'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(articles.map(article => article.category).filter(Boolean)))

  // Filter articles
  const filterArticles = () => {
    let filtered = articles

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'inStock':
          filtered = filtered.filter(article => article.inStock)
          break
        case 'outOfStock':
          filtered = filtered.filter(article => !article.inStock)
          break
        case 'featured':
          filtered = filtered.filter(article => article.liveId)
          break
      }
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter)
    }

    setFilteredArticles(filtered)
  }

  useEffect(() => {
    filterArticles()
  }, [searchTerm, statusFilter, categoryFilter, articles])

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

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCategoryFilter('all')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || categoryFilter !== 'all'

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search articles by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="featured">Featured</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category ?? ''}>{category}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredArticles.length}</span> of <span className="font-medium">{articles.length}</span> articles
          {filteredArticles.length > 0 && (
            <>
              {' • '}
              <span className="font-medium">Rs. {filteredArticles.reduce((sum, article) => sum + article.price, 0).toLocaleString()}</span> total value
            </>
          )}
        </div>
      </div>

      {/* Articles Content */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 md:p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters ? 'No articles match your filters' : 'No articles yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first article'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredArticles.map((article) => {
              const images = article.images || []
              const primaryImage = images[0]
              const sizes = article.sizes.map(sizeObj => sizeObj.size).join(', ') || 'No sizes'
              const isDeleting = deletingId === article.id
              const associatedLive = lives.find(live => live.id === article.liveId)

              return (
                <div key={article.id} className="bg-white p-4 rounded-xl border">
                  {/* Image and Basic Info */}
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      {primaryImage ? (
                        <>
                          <Image
                            className="w-full h-full rounded-lg object-cover border border-gray-200"
                            src={primaryImage}
                            width={80}
                            height={80}
                            alt={article.name}
                          />
                          {images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {images.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ShoppingBag size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{article.name}</h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">Rs. {article.price.toLocaleString()}</p>
                      {article.category && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Tag size={10} />
                          {article.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {article.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                  )}

                  {/* Status and Sizes */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                    <div className="text-xs text-gray-500">
                      Sizes: {sizes}
                    </div>
                  </div>

                  {/* Live Association */}
                  {associatedLive && (
                    <div className="bg-purple-50 p-2 rounded-lg mb-3">
                      <p className="text-xs text-purple-800 font-medium">Featured in Live</p>
                      <p className="text-xs text-purple-600 truncate">{associatedLive.title}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Created {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingArticle(article)}
                        disabled={isDeleting}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.name)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border overflow-hidden">
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
                  {filteredArticles.map((article) => {
                    const images = article.images || []
                    const primaryImage = images[0]
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
          </div>
        </>
      )}

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