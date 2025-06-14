import Link from 'next/link'
import { Calendar, Play, ShoppingBag } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    // Add modestbranding, autohide, showinfo, and controls for a cleaner embed
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&autohide=1&showinfo=0&controls=1`;
  }
  // Extend this for other video platforms if needed
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/lives" className="text-pink-600 hover:underline mb-8 inline-block">
          ← Back to Lives
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="aspect-video bg-gray-200 relative">
            {live.thumbnail ? (
              <Image 
                src={live.thumbnail} 
                alt={live.title}
                className="w-full h-full object-cover"
                width={250}
                height={250}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="text-gray-400" size={48} />
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{live.title}</h1>
            
            <div className="flex items-center text-gray-500 mb-6">
              <Calendar size={20} className="mr-2" />
              {new Date(live.date).toLocaleDateString()}
            </div>
            
            {live.description && (
              <p className="text-gray-600 mb-6">{live.description}</p>
            )}
            
            {live.videoUrl && (
              <div className="aspect-video mb-6">
                <iframe
                  src={getEmbedUrl(live.videoUrl)}
                  title={live.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                ></iframe>
              </div>
            )}
          </div>
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
                    {article.images.length > 0 ? (
                      <Image
                        src={article.images[0].url}
                        alt={article.name}
                        className="w-full h-full object-cover"
                        width={150}
                        height={150}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-400" size={48} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{article.name}</h3>
                    {article.category && (
                      <p className="text-sm text-gray-500 mb-2">{article.category}</p>
                    )}
                    <p className="text-2xl font-bold text-pink-600 mb-3">
                      Rs. {article.price.toLocaleString()}
                    </p>
                    
                    <div className="flex gap-2 mb-3">
                      {article.sizes && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {article.sizes.map(size => {
                            return <span key={size.id} className="mr-1">{size.size}</span>
                          })}
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
              <p className="text-gray-500 text-lg">No items featured in this live session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}