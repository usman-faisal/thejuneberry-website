'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { Article } from '@/lib/types'

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string)
    }
  }, [params.id])

  const fetchArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`)
      const data = await response.json()
      setArticle(data)
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = () => {
    router.push(`/checkout?article=${article?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link href="/articles" className="text-pink-600 hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-pink-600 hover:underline"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {article.image ? (
              <img 
                src={article.image} 
                alt={article.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="text-gray-400" size={64} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.name}</h1>
              {article.category && (
                <p className="text-lg text-gray-600 mb-4">{article.category}</p>
              )}
              <p className="text-4xl font-bold text-pink-600">
                Rs. {article.price.toLocaleString()}
              </p>
            </div>

            {article.description && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{article.description}</p>
              </div>
            )}

            <div className="flex gap-4">
              {article.size && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Size: </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                    {article.size}
                  </span>
                </div>
              )}
              {article.color && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Color: </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                    {article.color}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-6">
              {article.inStock ? (
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-pink-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  Buy Now
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 px-8 rounded-lg text-lg font-semibold cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>

            {article.live && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Featured in Live Session</h3>
                <Link 
                  href={`/lives/${article.live.id}`}
                  className="text-pink-600 hover:underline"
                >
                  {article.live.title}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}