import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Share2, Plus } from 'lucide-react';
import Image from 'next/image';
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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/articles">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{article.name}</h1>
        </div>

        <ArticleClient article={article} />
      </div>
    </div>
  );
}