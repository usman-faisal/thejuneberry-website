'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Heart, Filter, X } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import ArticleList from './article-list'

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
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    if (priceRange && priceRange !== 'all') {
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

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange('')
  }

  const hasActiveFilters = searchTerm || selectedCategory || priceRange

  return (
    <>
      {/* Mobile Search Bar */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search dresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="mb-6">
      <div className="hidden md:flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search dresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-9 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-sm"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className= " flex-1 w-full h-9 text-sm" >

              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category ?? ""}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Filter */}
          <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="flex-1 w-full h-9 text-sm" >
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-2000">Under Rs. 2,000</SelectItem>
              <SelectItem value="2000-5000">Rs. 2,000 - 5,000</SelectItem>
              <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
              <SelectItem value="10000">Above Rs. 10,000</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {[selectedCategory, priceRange].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="text-sm text-gray-600">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'dress' : 'dresses'}
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category ?? ""}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-2000">Under Rs. 2,000</SelectItem>
                  <SelectItem value="2000-5000">Rs. 2,000 - 5,000</SelectItem>
                  <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
                  <SelectItem value="10000">Above Rs. 10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors"
              >
                <X size={14} />
                Clear All Filters
              </button>
            )}
          </div>
        )}
        
        {/* Desktop Results Count */}
        <div className="hidden md:block mt-4">
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
        <ArticleList articles={filteredArticles} />
      )}
    </>
  )
}