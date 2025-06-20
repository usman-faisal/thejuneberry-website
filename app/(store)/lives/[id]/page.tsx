import Link from 'next/link'
import { Calendar, Play, ShoppingBag, ArrowLeft, Clock, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&autohide=1&showinfo=0&controls=1`;
  }
  return url;
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LiveDetailPage({ params }: PageProps) {
  const { id } = await params
  const live = await prisma.live.findUnique({
    where: { id },
    include: {
      articles: {
        include: {
          images: true,
          sizes: true
        }
      }
    }
  });

  if (!live) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link 
          href="/lives" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Live Sessions
        </Link>

        {/* Live Session Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          {/* Video Section */}
          <div className="relative">
            {live.videoUrl ? (
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(live.videoUrl)}
                  title={live.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 relative">
                {live.thumbnail ? (
                  <Image 
                    src={live.thumbnail} 
                    alt={live.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="text-gray-300" size={64} />
                  </div>
                )}
                
                {/* No Video Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="mx-auto mb-2" size={48} />
                    <p className="text-sm">Video not available</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Live Info */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {live.title}
                </h1>
                
                {live.description && (
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {live.description}
                  </p>
                )}
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(new Date(live.date))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatTime(new Date(live.date))}</span>
                  </div>
                  {live.articles && live.articles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} />
                      <span>{live.articles.length} Items Featured</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Live Badge */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  LIVE SESSION
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Items ({live.articles?.length || 0})
            </h2>
            <Link 
              href="/articles" 
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              View All Products →
            </Link>
          </div>

          {live.articles && live.articles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {live.articles.map((article) => (
                <div 
                  key={article.id} 
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {article.images.length > 0 ? (
                      <Image
                        src={article.images[0].url}
                        alt={article.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-300" size={40} />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-pink-500 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>

                    {/* Category Badge */}
                    {article.category && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                          {article.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {article.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-semibold text-gray-900">
                        Rs. {article.price.toLocaleString()}
                      </p>
                      
                      {/* Sizes */}
                      {article.sizes && article.sizes.length > 0 && (
                        <div className="flex gap-1">
                          {article.sizes.slice(0, 3).map(size => (
                            <span key={size.id} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              {size.size}
                            </span>
                          ))}
                          {article.sizes.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              +{article.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* View Details Button */}
                    <Link 
                      href={`/articles/${article.id}`}
                      className="block w-full text-center bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items featured</h3>
              <p className="text-gray-500 mb-4">This live session doesn't have any featured products yet.</p>
              <Link 
                href="/articles"
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-8 border border-pink-100 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loved this live session?
            </h3>
            <p className="text-gray-600 mb-6">
              Don't miss our upcoming live fashion showcases. Follow us for the latest updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://facebook.com/thejuneberry" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                Follow on Facebook
              </a>
              <Link 
                href="/lives"
                className="inline-flex items-center px-6 py-3 border border-pink-600 text-pink-600 bg-white rounded-lg hover:bg-pink-50 transition-colors font-medium"
              >
                View More Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}