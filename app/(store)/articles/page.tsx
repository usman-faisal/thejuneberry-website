import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArticlesClient } from './client'
import { Metadata } from 'next'

const ITEMS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Pakistani Dresses Collection - Premium Fashion Online',
  description: 'Browse our exclusive collection of premium Pakistani dresses. Traditional and modern styles, high-quality fabrics, delivered across Pakistan. Find your perfect dress today.',
  keywords: ['Pakistani dresses online', 'premium clothing collection', 'traditional Pakistani wear', 'modern dresses Pakistan', 'online fashion store Pakistan', 'dress collection'],
  openGraph: {
    title: 'Pakistani Dresses Collection - TheJuneBerry',
    description: 'Browse our exclusive collection of premium Pakistani dresses. Traditional and modern styles delivered across Pakistan.',
    url: 'https://thejuneberry.vercel.app/articles',
    images: [
      {
        url: '/images/collection-og.jpg', // Create this image
        width: 1200,
        height: 630,
        alt: 'TheJuneBerry Dress Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pakistani Dresses Collection - TheJuneBerry',
    description: 'Browse our exclusive collection of premium Pakistani dresses.',
    images: ['/images/collection-og.jpg'],
  },
  alternates: {
    canonical: 'https://thejuneberry.vercel.app/articles',
  },
}


export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string
    category?: string
    price?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const searchTerm = params?.q || ''
  const selectedCategory = params?.category || ''
  const priceRange = params?.price || ''
  const currentPage = Number(params?.page) || 1

  const where: any = {
    inStock: true,
  }

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  if (selectedCategory) {
    where.category = selectedCategory
  }

  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number)
    if (max) {
      where.price = { gte: min, lte: max }
    } else {
      where.price = { gte: min }
    }
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      sizes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
  })

  const totalArticles = await prisma.article.count({ where })

  const categoriesData = await prisma.article.findMany({
    select: { category: true },
    distinct: ['category'],
  })
  const categories = categoriesData.map(c => c.category).filter(Boolean) as string[]

  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Pakistani Dresses Collection",
    "description": "Exclusive collection of premium Pakistani dresses",
    "url": "https://thejuneberry.vercel.app/articles",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": articles.length,
      "itemListElement": articles.slice(0, 10).map((article, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": article.name,
        "description": article.description,
        "image": article.images[0],
        "url": `https://thejuneberry.vercel.app/articles/${article.id}`,
        "offers": {
          "@type": "Offer",
          "price": article.price,
          "priceCurrency": "PKR",
          "availability": "https://schema.org/InStock"
        }
      }))
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
              Our Collection
            </h1>
            <p className="text-gray-600">
              Discover beautiful dresses for every occasion
            </p>
          </div>

          <ArticlesClient
            articles={articles}
            categories={categories}
            totalPages={totalPages}
            totalArticles={totalArticles}
          />
        </div>
      </div>

    </>
  )
}