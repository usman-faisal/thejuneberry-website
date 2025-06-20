import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticlesClient } from './client'

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      images: true,
      sizes: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const categories = [...new Set(articles.map(article => article.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
            Our Collection
          </h1>
          <p className="text-gray-600">
            Discover beautiful dresses for every occasion
          </p>
        </div>

        <ArticlesClient initialArticles={articles} categories={categories} />
      </div>
    </div>
  )
}