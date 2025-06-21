import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface SizesSectionProps {
  sizes: string[]
  isSubmitting: boolean
  onSizesChange: (sizes: string[]) => void
}

export function SizesSection({ sizes, isSubmitting, onSizesChange }: SizesSectionProps) {
  const [newSize, setNewSize] = useState('')

  const addSize = () => {
    const size = newSize.trim().toUpperCase()
    if (size && !sizes.includes(size)) {
      onSizesChange([...sizes, size])
      setNewSize('')
    } else if (sizes.includes(size)) {
      toast.error('Size already exists')
    }
  }

  const removeSize = (index: number) => {
    onSizesChange(sizes.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Available Sizes
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value.toUpperCase())}
          placeholder="e.g., S, M, L, XL"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSize()
            }
          }}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={addSize}
          className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          disabled={isSubmitting}
        >
          Add
        </button>
      </div>

      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
} 