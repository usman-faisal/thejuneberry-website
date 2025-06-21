import { Tag } from 'lucide-react'
import { Live } from '@prisma/client'

interface CategoryAndLiveSectionProps {
  formData: {
    category: string
    liveId: string
  }
  lives: Live[]
  isSubmitting: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function CategoryAndLiveSection({ formData, lives, isSubmitting, onChange }: CategoryAndLiveSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Tag size={16} className="mr-2 text-gray-400" />
          Category
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={onChange}
          placeholder="e.g., Casual, Formal, Party"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured in Live
        </label>
        <select
          name="liveId"
          value={formData.liveId}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          disabled={isSubmitting}
        >
          <option value="">Not featured in any live</option>
          {lives.map((live) => (
            <option key={live.id} value={live.id}>
              {live.title} - {new Date(live.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 