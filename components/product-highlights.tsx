import { prisma } from '@/lib/prisma'
import { ArticlesClient } from '@/app/(store)/articles/client'
import ArticleList from '@/app/(store)/articles/article-list'

export default async function ProductHighlights() {
  const articles = await prisma.article.findMany({
    orderBy: [
      {featured: 'desc'}
    ],
    take: 4,
  })

  return (
    <ArticleList articles={articles}  />
  )
} 