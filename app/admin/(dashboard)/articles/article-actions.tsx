'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ArticleForm } from './article-form'
import { Prisma } from '@prisma/client'

interface ArticleActionsProps {
  lives: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>[]
}

export function ArticleActions({ lives }: ArticleActionsProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
      >
        <Plus size={20} className="mr-2" />
        Add Article
      </button>

      {showForm && (
        <ArticleForm 
          onClose={() => setShowForm(false)} 
          lives={lives}
        />
      )}
    </>
  )
} 