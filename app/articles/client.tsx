'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, ShoppingBag } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'

interface ArticlesClientProps {
  initialArticles: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>[]
  categories: (string | null)[]
}

export function ArticlesClient({ initialArticles, categories }: ArticlesClientProps) {
  const [filteredArticles, setFilteredArticles] = useState(initialArticles)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
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
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category ?? ""}>{category}</option>
            ))}
          </select>

          {/* Price Filter */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Prices</option>
            <option value="0-2000">Under Rs. 2,000</option>
            <option value="2000-5000">Rs. 2,000 - 5,000</option>
            <option value="5000-10000">Rs. 5,000 - 10,000</option>
            <option value="10000">Above Rs. 10,000</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-200">
                {article.images ? (
                  <Image 
                    src={article.images[0].url} 
                    alt={article.name}
                    className="w-full h-full object-cover"
                    width={150}
                    height={150}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="text-gray-400" size={48} />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-2">{article.name}</h3>
                {article.category && (
                  <p className="text-sm text-gray-500 mb-2">{article.category}</p>
                )}
                <p className="text-2xl font-bold text-pink-600 mb-3">
                  Rs. {article.price.toLocaleString()}
                </p>
                
                <div className="flex gap-2 mb-3">
                  {article.sizes && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {article.sizes.map(size => {
                        return <span key={size.id} className="mr-1">{size.size}</span>
                      })}
                    </span>
                  )}
                </div>
                
                <Link 
                  href={`/articles/${article.id}`}
                  className="block w-full text-center bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
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