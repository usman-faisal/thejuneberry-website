'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              TheJuneBerry
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">
              Home
            </Link>
            <Link href="/lives" className="text-gray-700 hover:text-pink-600 transition-colors">
              Lives
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-pink-600 transition-colors">
              Shop
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-pink-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/lives" 
                className="block px-3 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsOpen(false)}
              >
                Lives
              </Link>
              <Link 
                href="/articles" 
                className="block px-3 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}