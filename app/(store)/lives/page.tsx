import Link from 'next/link'
import { Calendar, Play, Users, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
            Live Fashion Sessions
          </h1>
          <p className="text-gray-600">
            Watch our previous live showcases and shop the featured collections
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Play className="text-pink-500" size={16} />
                <span className="text-gray-600">{lives.length} Sessions Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-gray-400" size={16} />
                <span className="text-gray-600">Join 10K+ Viewers</span>
              </div>
            </div>
            <div className="text-gray-500">
              Latest: {lives.length > 0 ? formatDate(new Date(lives[0].date)) : 'No sessions yet'}
            </div>
          </div>
        </div>

        {lives.length === 0 ? (
          <div className="text-center py-16">
            <Play className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions yet</h3>
            <p className="text-gray-500">Check back soon for our upcoming fashion showcases</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lives.map((live) => (
              <div 
                key={live.id} 
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {live.thumbnail ? (
                    <Image 
                      src={live.thumbnail} 
                      alt={live.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="text-gray-300" size={40} />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <Play className="text-pink-600" size={24} fill="currentColor" />
                    </div>
                  </div>

                  {/* Duration Badge (if you have duration data) */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      LIVE
                    </span>
                  </div>

                  {/* Items Count */}
                  {live.articles && live.articles.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                        {live.articles.length} Items Featured
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Live Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {live.title}
                  </h3>
                  
                  {live.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {live.description}
                    </p>
                  )}
                  
                  {/* Date and Time */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(new Date(live.date))}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTime(new Date(live.date))}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
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

        {/* Call to Action */}
        {lives.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-8 border border-pink-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Don't Miss Our Next Live Session
              </h3>
              <p className="text-gray-600 mb-4">
                Follow us on Facebook to get notified when we go live with new collections
              </p>
              <a 
                href="https://facebook.com/thejuneberry1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                Follow on Facebook
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}