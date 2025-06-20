'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Heart } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

interface ArticlesClientProps {
  initialArticles: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>[]
  categories: (string | null)[]
}

export function ArticlesClient({ initialArticles, categories }: ArticlesClientProps) {
  const [filteredArticles, setFilteredArticles] = useState(initialArticles)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState('')

  useEffect(() => {
    filterArticles()
  }, [initialArticles, searchTerm, selectedCategory, priceRange])

  const filterArticles = () => {
    let filtered = initialArticles

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(article => {
        if (max) {
          return article.price >= min && article.price <= max
        } else {
          return article.price >= min
        }
      })
    }

    filtered = filtered.filter(article => article.inStock)
    setFilteredArticles(filtered)
  }

  return (
    <>
      {/* Clean Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search dresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-12 px-4 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category ?? ""}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Filter */}
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full h-12 px-4 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-2000">Under Rs. 2,000</SelectItem>
              <SelectItem value="2000-5000">Rs. 2,000 - 5,000</SelectItem>
              <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
              <SelectItem value="10000">Above Rs. 10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'dress' : 'dresses'} found
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dresses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <div 
              key={article.id} 
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
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
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {article.name}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {article.price.toLocaleString()}
                  </p>
                  
                  {/* Sizes */}
                  {article.sizes && article.sizes.length > 0 && (
                    <div className="flex gap-1">
                      {article.sizes.slice(0, 3).map(size => (
                        <span key={size.id} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                          {size.size}
                        </span>
                      ))}
                      {article.sizes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                          +{article.sizes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* View Details Button */}
                <Link 
                  href={`/articles/${article.id}`}
                  className="block w-full text-center bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}