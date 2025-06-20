import { Prisma } from "@prisma/client"
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image"

export default function ArticleList({  articles
}: {
    articles: Prisma.ArticleGetPayload<{
        include: { images: true, sizes: true };
      }>[]
}) {
    return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {articles.map((article) => (
      <Link 
        key={article.id}
        href={`/articles/${article.id}`}
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-pink-200 hover:-translate-y-1 transition-all duration-300 block"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {article.images && article.images.length > 0 ? (
            <>
              <Image
                src={article.images[0].url} 
                alt={article.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Multiple Images Indicator */}
              {article.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  +{article.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="text-gray-300" size={48} />
            </div>
          )}
          
          {/* Overlay for better button visibility */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
            <Heart className="text-gray-700 hover:text-pink-500 transition-colors" size={16} />
          </button>
          
          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full shadow-sm border border-white/50">
                {article.category}
              </span>
            </div>
          )}

          {/* Stock Status */}
          {!article.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 md:p-5 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
              {article.name}
            </h3>
            
            {/* Description */}
            {article.description && (
              <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {article.description}
              </p>
            )}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg md:text-xl font-bold text-gray-900">
                Rs. {article.price.toLocaleString()}
              </p>
              {/* Mock rating - you can replace with actual rating */}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">(4.0)</span>
              </div>
            </div>
          </div>

          {/* Sizes */}
          {article.sizes && article.sizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Available Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {article.sizes.slice(0, 4).map(size => (
                  <span key={size.id} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 rounded-md border transition-colors">
                    {size.size}
                  </span>
                ))}
                {article.sizes.length > 4 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-500 rounded-md">
                    +{article.sizes.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${article.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-medium ${article.inStock ? 'text-green-700' : 'text-red-700'}`}>
                {article.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
    )
}