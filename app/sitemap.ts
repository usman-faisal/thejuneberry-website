import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thejuneberry.vercel.app'

  // Get all articles
  const articles = await prisma.article.findMany({
    select: { id: true, createdAt: true }
  })

  // Get all lives
  const lives = await prisma.live.findMany({
    select: { id: true, date: true }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lives`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.id}`,
      lastModified: article.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...lives.map((live) => ({
      url: `${baseUrl}/lives/${live.id}`,
      lastModified: live.date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}