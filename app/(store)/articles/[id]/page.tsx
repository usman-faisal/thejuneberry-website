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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    select: { 
      name: true, 
      description: true, 
      images: true, 
      price: true, 
      category: true,
      createdAt: true
    }
  });

  if (!article) {
    return {
      title: 'Dress Not Found - TheJuneBerry',
      description: 'The dress you are looking for could not be found.',
    };
  }

  return {
    title: `${article.name} - Premium Pakistani Dress`,
    description: article.description || `Beautiful ${article.category || 'Pakistani dress'} from TheJuneBerry. Premium quality, authentic designs, delivered across Pakistan. Starting from PKR ${article.price}.`,
    keywords: [article.name].filter(Boolean),
    openGraph: {
      title: `${article.name} - TheJuneBerry`,
      description: article.description || `Beautiful Pakistani dress from TheJuneBerry`,
      url: `https://thejuneberry.vercel.app/articles/${id}`,
      type: 'article',
      images: article.images.map(img => ({
        url: img,
        width: 800,
        height: 800,
        alt: article.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.name} - TheJuneBerry`,
      description: article.description || `Beautiful Pakistani dress`,
      images: article.images.map(img => img),
    },
    alternates: {
      canonical: `https://thejuneberry.vercel.app/articles/${id}`,
    },
  };
}


export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      sizes: true,
      live: true
    }
  });

  if (!article) {
    notFound()
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": article.name,
    "description": article.description,
    "image": article.images.map(img => img),
    "url": `https://thejuneberry.vercel.app/articles/${article.id}`,
    "sku": article.id,
    "category": article.category,
    "brand": {
      "@type": "Brand",
      "name": "TheJuneBerry"
    },
    "offers": {
      "@type": "Offer",
      "price": article.price,
      "priceCurrency": "PKR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "TheJuneBerry"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "50"
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
          href="/articles"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>

        <ArticleClient article={article} />
      </div>
    </div>
    </>
  );
}