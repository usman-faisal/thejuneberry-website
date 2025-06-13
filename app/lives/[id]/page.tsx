'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Play, ShoppingBag } from 'lucide-react'
import { Live } from '@/lib/types'

export default function LiveDetailPage() {
  const params = useParams()
  const [live, setLive] = useState<Live | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchLive(params.id as string)
    }
  }, [params.id])

  const fetchLive = async (id: string) => {
    try {
      const response = await fetch(`/api/lives/${id}`)
      const data = await response.json()
      setLive(data)
    } catch (error) {
      console.error('Error fetching live:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!live) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Live not found</h1>
          <Link href="/lives" className="text-pink-600 hover:underline">
            Back to Lives
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Header */}
        <div className="mb-12">
          <nav className="mb-4">
            <Link href="/lives" className="text-pink-600 hover:underline">
              ← Back to Lives
            </Link>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{live.title}</h1>

          <div className="flex items-center text-gray-600 mb-6">
            <Calendar size={20} className="mr-2" />
            {new Date(live.date).toLocaleDateString()}
          </div>

          {live.description && (
            <p className="text-lg text-gray-700 mb-8">{live.description}</p>
          )}

          {/* Video Player */}
          {/* {live.videoUrl && (
            <div className="aspect-video bg-gray-900 rounded-lg mb-8 flex items-center justify-center">
              <div className="text-white text-center">
                <Play size={64} className="mx-auto mb-4" />
                <p>Video Player (Integrate with your preferred video player)</p>
                <a
                  href={live.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:underline"
                >
                  Watch on Facebook
                </a>
              </div>
            </div>
          )} */}
          {live.videoUrl && (
            <div className="aspect-video bg-gray-900 rounded-lg mb-8 overflow-hidden">
              <iframe
                src={live.videoUrl}
                className='w-full h-full'
                style={{ border: 'none', overflow: 'hidden' }}
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook video player"
              ></iframe>
            </div>
          )}
        </div>

        {/* Featured Articles */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Items Featured in This Live
          </h2>

          {live.articles && live.articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {live.articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-400" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{article.name}</h3>
                    <p className="text-2xl font-bold text-pink-600 mb-2">
                      Rs. {article.price.toLocaleString()}
                    </p>

                    <div className="flex gap-2 mb-3">
                      {article.size && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {article.size}
                        </span>
                      )}
                      {article.color && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {article.color}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/articles/${article.id}`}
                      className="block w-full text-center bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles featured in this live session yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}