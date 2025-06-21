'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X, ShoppingBag } from 'lucide-react'
import { Article, Prisma } from '@prisma/client'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import ArticleList from './article-list' // Your existing component
import Pagination from '../../../components/ui/pagination' // The new pagination component

interface ArticlesClientProps {
  articles: Article[]
  categories: string[]
  totalPages: number
  totalArticles: number
}

export function ArticlesClient({ articles, categories, totalPages, totalArticles }: ArticlesClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State is now derived from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // A debounced function to update search term without firing on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange('q', searchTerm)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  const handleFilterChange = useCallback((key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // When a filter changes, always go back to page 1
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )
  
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    router.push(pathname) // Navigate to the base path to clear all params
  }

  const hasActiveFilters = !!searchParams.get('q') || !!searchParams.get('category')

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
        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative flex-1 w-full">
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
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => {
              setSelectedCategory(value)
              handleFilterChange('category', value)
            }}
          >
            <SelectTrigger className="flex-1 max-w-xs h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
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
                {[searchTerm, selectedCategory].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="text-sm text-gray-600">
            {articles.length} of {totalArticles} {totalArticles === 1 ? 'dress' : 'dresses'}
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value)
                  handleFilterChange('category', value)
                }}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
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
            Showing {articles.length} of {totalArticles} {totalArticles === 1 ? 'dress' : 'dresses'}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dresses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <ArticleList articles={articles} />
          <div className="mt-8">
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}
    </>
  )
}