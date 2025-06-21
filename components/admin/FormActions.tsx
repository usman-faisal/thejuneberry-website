import { Loader2 } from 'lucide-react'

interface FormActionsProps {
  isEditing: boolean
  isSubmitting: boolean
  onCancel: () => void
}

export function FormActions({ isEditing, isSubmitting, onCancel }: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <Loader2 size={16} className="animate-spin mr-2" />
            {isEditing ? 'Updating...' : 'Creating...'}
          </div>
        ) : (
          isEditing ? 'Update Article' : 'Create Article'
        )}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        disabled={isSubmitting}
      >
        Cancel
      </button>
    </div>
  )
} 