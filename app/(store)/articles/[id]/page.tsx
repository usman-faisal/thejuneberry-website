import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArticleClient } from './client';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    select: { name: true, description: true, images: true }
  });

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.name,
    description: article.description,
    openGraph: {
      images: article.images.map(img => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: article.name,
      })),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      images: true,
      sizes: true,
      live: true
    }
  });

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link 
          href="/articles"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>

        <ArticleClient article={article} />
      </div>
    </div>
  );
}