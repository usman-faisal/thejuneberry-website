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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Collection
          </h1>
          <p className="text-xl text-gray-600">
            Discover beautiful dresses for every occasion
          </p>
        </div>

        <ArticlesClient initialArticles={articles} categories={categories} />
      </div>
    </div>
  )
}