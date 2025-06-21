// app/articles/pagination.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center space-x-4">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md ${
          currentPage === 1 ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <ChevronLeft size={16} />
        Previous
      </Link>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md ${
          currentPage >= totalPages ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
        }`}
      >
        Next
        <ChevronRight size={16} />
      </Link>
    </div>
  )
}