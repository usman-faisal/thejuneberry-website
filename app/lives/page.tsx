'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Play } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'

export default function LivesPage() {
  const [lives, setLives] = useState<Prisma.LiveGetPayload<
    {include: { articles: true } }
  >[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLives()
  }, [])

  const fetchLives = async () => {
    try {
      const response = await fetch('/api/lives')
      const data = await response.json()
      setLives(data)
    } catch (error) {
      console.error('Error fetching lives:', error)
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Live Sessions
          </h1>
          <p className="text-xl text-gray-600">
            Watch our previous live showcases and shop the featured items
          </p>
        </div>

        {lives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No live sessions available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lives.map((live) => (
              <div key={live.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {live.thumbnail ? (
                    <Image 
                      src={live.thumbnail} 
                      alt={live.title}
                      className="w-full h-full object-cover"
                      width={150}
                      height={150}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{live.title}</h3>
                  {live.description && (
                    <p className="text-gray-600 mb-4">{live.description}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar size={16} className="mr-2" />
                    {new Date(live.date).toLocaleDateString()}
                  </div>
                  
                  <Link 
                    href={`/lives/${live.id}`}
                    className="inline-block w-full text-center bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    View Live & Shop Items
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}