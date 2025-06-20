import Link from 'next/link'
import { Calendar, Play, ShoppingBag, ArrowLeft, Clock, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ArticleList from '../../articles/article-list'
import { Metadata } from 'next'

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const live = await prisma.live.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      thumbnail: true,
      date: true,
      articles: {
        select: { id: true }
      }
    }
  });

  if (!live) {
    return {
      title: 'Live Session Not Found',
    };
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return {
    title: `${live.title} - Live Fashion Session`,
    description: live.description || `Watch this exclusive live fashion session featuring ${live.articles?.length || 0} beautiful dresses. Interactive shopping experience with styling tips.`,
    keywords: ['live fashion show', 'Pakistani dress showcase', live.title, 'interactive shopping', 'fashion styling'],
    openGraph: {
      title: `${live.title} - TheJuneBerry Live Session`,
      description: live.description || `Exclusive live fashion session featuring beautiful Pakistani dresses`,
      url: `https://thejuneberry.vercel.app/lives/${id}`,
      type: 'video.other',
      images: live.thumbnail ? [
        {
          url: live.thumbnail,
          width: 1200,
          height: 630,
          alt: live.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${live.title} - TheJuneBerry`,
      description: live.description || `Exclusive live fashion session`,
      images: live.thumbnail ? [live.thumbnail] : [],
    },
    alternates: {
      canonical: `https://thejuneberry.vercel.app/lives/${id}`,
    },
  };
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": live.title,
    "description": live.description,
    "thumbnailUrl": live.thumbnail,
    "uploadDate": live.date.toISOString(),
    "url": live.videoUrl,
    "embedUrl": live.videoUrl ? getEmbedUrl(live.videoUrl) : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "TheJuneBerry",
      "logo": "https://thejuneberry.vercel.app/images/favicon.jpg"
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": `https://thejuneberry.vercel.app/lives/${live.id}`
    }
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
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
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
              <ArticleList articles={live.articles} />
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
                  href="https://facebook.com/thejuneberry1"
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
    </>
  )
}