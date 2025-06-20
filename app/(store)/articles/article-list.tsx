import { Prisma } from "@prisma/client"
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image"


export default function ArticleList({  articles
}: {
    articles: Prisma.ArticleGetPayload<{
        include: { images: true, sizes: true };
      }>[]
}) {
    return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {articles.map((article) => (
      <Link 
        key={article.id}
        href={`/articles/${article.id}`}
        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300 block"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {article.images && article.images.length > 0 ? (
            <Image
              src={article.images[0].url} 
              alt={article.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="text-gray-300" size={40} />
            </div>
          )}
          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="text-gray-600 hover:text-pink-500" size={16} />
          </button>
          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                {article.category}
              </span>
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="p-4">
          <h3 className="sm:font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {article.name}
          </h3>
          {/* Description */}
          {article.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{article.description}</p>
          )}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-900">
              Rs. {article.price.toLocaleString()}
            </p>
          </div>
          {/* Sizes */}
          {article.sizes && article.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {article.sizes.map(size => (
                <span key={size.id} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                  {size.size}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    ))}
  </div>
    )
}