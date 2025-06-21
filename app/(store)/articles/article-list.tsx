'use client'

import { useState } from "react";
import { Article, Prisma } from "@prisma/client"
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image"

export default function ArticleList({  articles
}: {
    articles: Article[]
}) {
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

    const handleImageLoad = (articleId: string) => {
        setLoadingImages(prev => ({ ...prev, [articleId]: false }));
    };

    const handleImageError = (articleId: string) => {
        setLoadingImages(prev => ({ ...prev, [articleId]: false }));
    };

    return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 ">
    {articles.map((article) => (
      <Link 
        key={article.id}
        href={`/articles/${article.id}`}
        className="group transition-all duration-300 block"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          {article.images && article.images.length > 0 ? (
            <>
              {/* Loading Indicator */}
              {loadingImages[article.id] !== false && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-6 h-6 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-500 font-medium">Loading...</p>
                  </div>
                </div>
              )}
              
              <Image
                src={article.images[0]} 
                alt={article.name}
                fill
                className={`object-cover group-hover:scale-105 transition-all duration-300 ${
                  loadingImages[article.id] !== false ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => handleImageLoad(article.id)}
                onError={() => handleImageError(article.id)}
                onLoadStart={() => setLoadingImages(prev => ({ ...prev, [article.id]: true }))}
              />
              
              {/* Multiple Images Indicator */}
              {article.images.length > 1 && loadingImages[article.id] === false && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{article.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="text-gray-300" size={32} />
            </div>
          )}
          
          {/* Wishlist Button - Only show when image is loaded */}
          {loadingImages[article.id] === false && (
            <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
              <Heart className="text-gray-600 hover:text-red-500 transition-colors" size={14} />
            </button>
          )}
          
          {/* Stock Status Overlay */}
          {!article.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-md font-medium text-xs">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 mt-2">
          {/* Brand/Category */}
          {article.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {article.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 leading-tight">
            {article.name}
          </h3>

          {/* Price */}
          <div className="space-y-1">
            <p className="text-lg md:text-xl font-bold text-gray-900">
              PKR {article.price.toLocaleString()}.00
            </p>
            
          </div>

          {/* Sizes - Compact Display */}
          {article.sizes && article.sizes.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-1">
                {article.sizes.slice(0, 3).map(size => (
                  <span key={size} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {size}
                  </span>
                ))}
                {article.sizes.length > 3 && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    +{article.sizes.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rating - Simplified */}
          <div className="flex items-center gap-1 pt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.0)</span>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className={`w-2 h-2 rounded-full ${article.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-xs font-medium ${article.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {article.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
    )
}