import Link from 'next/link'
import { Calendar, Play, Users, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Fashion Sessions - Watch & Shop Pakistani Dresses',
  description: 'Watch our exclusive live fashion showcases featuring premium Pakistani dresses. Interactive shopping experience with real-time styling tips and instant purchasing.',
  keywords: ['live fashion shows', 'Pakistani dress showcase', 'interactive shopping', 'fashion live streaming', 'dress collection Pakistan'],
  openGraph: {
    title: 'Live Fashion Sessions - TheJuneBerry',
    description: 'Watch exclusive live fashion showcases featuring premium Pakistani dresses. Interactive shopping with real-time styling tips.',
    url: 'https://thejuneberry.vercel.app/lives',
    images: [
      {
        url: '/images/lives-og.jpg', // Create this image
        width: 1200,
        height: 630,
        alt: 'TheJuneBerry Live Fashion Sessions',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Fashion Sessions - TheJuneBerry',
    description: 'Watch exclusive live fashion showcases featuring premium Pakistani dresses.',
    images: ['/images/lives-og.jpg'],
  },
  alternates: {
    canonical: 'https://thejuneberry.vercel.app/lives',
  },
}

export default async function LivesPage() {
  const lives = await prisma.live.findMany({
    include: {
      articles: true
    },
    orderBy: {
      date: 'desc'
    }
  })

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Live Fashion Sessions",
    "description": "Exclusive live fashion showcases by TheJuneBerry",
    "numberOfItems": lives.length,
    "itemListElement": lives.map((live, index) => ({
      "@type": "VideoObject",
      "position": index + 1,
      "name": live.title,
      "description": live.description,
      "thumbnailUrl": live.thumbnail,
      "uploadDate": live.date.toISOString(),
      "url": `https://thejuneberry.vercel.app/lives/${live.id}`
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Mobile-Optimized Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500 leading-tight">
              Live Fashion Sessions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Watch our previous live showcases and shop the featured collections
            </p>
          </div>

          {/* Mobile-Optimized Stats Bar */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between text-sm">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Play className="text-pink-500 flex-shrink-0" size={16} />
                  <span className="text-gray-600">{lives.length} Sessions Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-gray-400 flex-shrink-0" size={16} />
                  <span className="text-gray-600">Join 10K+ Latest: Friday, Viewers June 20, 2025</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Latest: {lives.length > 0 ? formatDate(new Date(lives[0].date)) : 'No sessions yet'}
              </div>
            </div>
          </div>

          {lives.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <Play className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions yet</h3>
              <p className="text-gray-500 text-sm sm:text-base">Check back soon for our upcoming fashion showcases</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lives.map((live) => (
                <div 
                  key={live.id} 
                  className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
                >
                  {/* Mobile-Optimized Thumbnail Container */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {live.thumbnail ? (
                      <Image 
                        src={live.thumbnail} 
                        alt={live.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="text-gray-300" size={32} />
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3">
                        <Play className="text-pink-600" size={20} fill="currentColor" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                        LIVE
                      </span>
                    </div>

                    {/* Items Count */}
                    {live.articles && live.articles.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                          {live.articles.length} Items
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile-Optimized Live Info */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors text-sm sm:text-base leading-tight">
                      {live.title}
                    </h3>
                    
                    {live.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                        {live.description}
                      </p>
                    )}
                    
                    {/* Mobile-Optimized Date and Time */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="flex-shrink-0" />
                        <span className="truncate">{formatDate(new Date(live.date))}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>{formatTime(new Date(live.date))}</span>
                      </div>
                    </div>
                    
                    {/* Mobile-Optimized Action Button */}
                    <Link 
                      href={`/lives/${live.id}`}
                      className="block w-full text-center bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                    >
                      Watch & Shop Items
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile-Optimized Call to Action */}
          {lives.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg sm:rounded-xl p-6 sm:p-8 border border-pink-100 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Don't Miss Our Next Live Session
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                  Follow us on Facebook to get notified when we go live with new collections
                </p>
                <a 
                  href="https://facebook.com/thejuneberry1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Follow on Facebook
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}