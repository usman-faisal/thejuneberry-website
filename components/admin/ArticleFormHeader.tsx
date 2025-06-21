import { X, Package } from 'lucide-react'

interface ArticleFormHeaderProps {
  isEditing: boolean
  isSubmitting: boolean
  onClose: () => void
}

export function ArticleFormHeader({ isEditing, isSubmitting, onClose }: ArticleFormHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 rounded-t-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-pink-100 rounded-lg mr-3">
            <Package size={20} className="text-pink-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h2>
            <p className="text-sm text-gray-500 hidden md:block">
              {isEditing ? 'Update product information' : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
} 