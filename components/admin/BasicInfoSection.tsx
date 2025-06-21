import { Package, DollarSign, AlertCircle, Video } from 'lucide-react'

interface BasicInfoSectionProps {
  formData: {
    name: string
    description: string
    price: string
    videoUrl: string
  }
  errors: Record<string, string>
  isSubmitting: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function BasicInfoSection({ formData, errors, isSubmitting, onChange }: BasicInfoSectionProps) {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Package size={16} className="mr-2 text-gray-400" />
            Article Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter article name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <DollarSign size={16} className="mr-2 text-gray-400" />
            Price (Rs.) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.price}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
          placeholder="Describe your article..."
          disabled={isSubmitting}
        />
      </div>

      {/* Facebook Video URL */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Video size={16} className="mr-2 text-gray-400" />
          Facebook Video Embed URL
        </label>
        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
            errors.videoUrl ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="https://www.facebook.com/plugins/video.php?height=476&href=..."
          disabled={isSubmitting}
        />
        {errors.videoUrl && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {errors.videoUrl}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Paste the Facebook embed URL to show a video in the product gallery
        </p>
      </div>
    </div>
  )
} 