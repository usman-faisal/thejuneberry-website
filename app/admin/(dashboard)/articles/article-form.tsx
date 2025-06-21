'use client'

import { useState, useRef } from 'react'
import { Plus, Upload, X, ImageIcon, Loader2, AlertCircle, Package, DollarSign, Tag, Video } from 'lucide-react'
import Image from 'next/image'
import { Live, Prisma } from '@prisma/client'
import { createArticle, updateArticle } from '@/app/actions/articles'
import { uploadToCloudinary } from '@/app/actions/upload'
import { toast } from 'sonner'

interface ImageUpload {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  public_id?: string
  error?: string
}

interface ArticleFormProps {
  onClose: () => void
  editingArticle?: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>
  lives: Live[]
}

interface ArticleImage {
  id?: string
  url: string
  public_id?: string
  articleId?: string | null
}

export function ArticleForm({ onClose, editingArticle, lives }: ArticleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSize, setNewSize] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    price: editingArticle?.price.toString() || '',
    images: editingArticle?.images || [] as ArticleImage[],
    category: editingArticle?.category || '',
    sizes: editingArticle?.sizes.map(sizeObj => sizeObj.size) || [],
    inStock: editingArticle?.inStock ?? true,
    liveId: editingArticle?.liveId || '',
    videoUrl: editingArticle?.videoUrl || '' // Added video URL field
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Article name is required'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    // Validate Facebook embed URL format if provided
    if (formData.videoUrl && !isValidFacebookEmbedUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid Facebook embed URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidFacebookEmbedUrl = (url: string): boolean => {
    const facebookEmbedPattern = /^https:\/\/www\.facebook\.com\/plugins\/video\.php\?.*href=.*$/
    return facebookEmbedPattern.test(url)
  }

  const handleImageUpload = async (file: File): Promise<{ url: string, public_id: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadToCloudinary(formData)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image')
    }

    return { url: result.url, public_id: result.public_id }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      return true
    })

    const newUploads: ImageUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setImageUploads(prev => [...prev, ...newUploads])
    
    // Clear errors if images are added
    if (newUploads.length > 0) {
      setErrors(prev => ({ ...prev, images: '' }))
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImages = async (): Promise<{ url: string, public_id: string }[]> => {
    const pendingUploads = imageUploads.filter(upload => !upload.uploaded && !upload.error)
    if (pendingUploads.length === 0) {
      return []
    }

    console.log('Starting upload for', pendingUploads.length, 'images')

    // Set uploading state
    setImageUploads(prev => prev.map(u =>
      pendingUploads.includes(u) ? { ...u, uploading: true } : u
    ))

    const uploadPromises = pendingUploads.map(async (upload) => {
      try {
        const { url, public_id } = await handleImageUpload(upload.file)
        setImageUploads(prev => prev.map(u =>
          u.id === upload.id ? { ...u, uploading: false, uploaded: true, url, public_id } : u
        ))
        console.log('Successfully uploaded image:', { url, public_id })
        return { url, public_id }
      } catch (error) {
        console.error('Error uploading image:', error)
        setImageUploads(prev => prev.map(u =>
          u.id === upload.id ? { 
            ...u, 
            uploading: false, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : u
        ))
        throw error
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      console.log('All image uploads completed successfully:', results)
      return results
    } catch (error) {
      console.error('Some images failed to upload:', error)
      toast.error('Some images failed to upload. Please try again.')
      throw error
    }
  }

  const removeImageUpload = (id: string) => {
    const upload = imageUploads.find(u => u.id === id)
    if (upload) {
      URL.revokeObjectURL(upload.preview)
    }
    setImageUploads(prev => prev.filter(u => u.id !== id))
  }

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addImageUrl = () => {
    const url = prompt('Enter image URL:')?.trim()
    if (url) {
      // Basic URL validation
      try {
        new URL(url)
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url } as ArticleImage]
        }))
        setErrors(prev => ({ ...prev, images: '' }))
      } catch {
        toast.error('Please enter a valid URL')
      }
    }
  }

  const addSize = () => {
    const size = newSize.trim().toUpperCase()
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }))
      setNewSize('')
    } else if (formData.sizes.includes(size)) {
      toast.error('Size already exists')
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload any pending images
      const newImageUrls = await uploadImages()

      // Collect all images: existing ones + newly uploaded ones
      const allImages = [
        ...formData.images,
        ...newImageUrls
      ]

      console.log('Submitting with images:', allImages)

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        images: allImages,
        category: formData.category.trim(),
        sizes: formData.sizes,
        inStock: formData.inStock,
        liveId: formData.liveId || null,
        videoUrl: formData.videoUrl.trim() || undefined, // Added video URL to payload
      }

      const result = editingArticle 
        ? await updateArticle(editingArticle.id, payload)
        : await createArticle(payload)

      if (result.success) {
        toast.success(
          editingArticle 
            ? 'Article updated successfully!' 
            : 'Article created successfully!'
        )
        onClose()
      } else {
        toast.error(result.error || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error in submission process:', error)
      toast.error('An error occurred while saving the article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Clear specific field errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg mr-3">
                <Package size={20} className="text-pink-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </h2>
                <p className="text-sm text-gray-500 hidden md:block">
                  {editingArticle ? 'Update product information' : 'Add a new product to your catalog'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Basic Information */}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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

          {/* Images Section */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
              <ImageIcon size={16} className="mr-2 text-gray-400" />
              Images *
            </label>

            {/* Upload Actions */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
              <label className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 text-sm">
                <Upload size={14} className="mr-2" />
                Upload Images
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>

              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                disabled={isSubmitting}
              >
                <ImageIcon size={14} className="mr-2" />
                Add URL
              </button>

            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Existing Images */}
              {formData.images.map((image, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-200"
                    width={150}
                    height={150}
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {/* Upload Preview */}
              {imageUploads.map((upload) => (
                <div key={upload.id} className="relative group">
                  <Image
                    src={upload.preview}
                    alt="Upload preview"
                    className={`w-full h-24 md:h-32 object-cover rounded-lg border ${
                      upload.uploading ? 'opacity-50' : 'border-gray-200'
                    }`}
                    width={150}
                    height={150}
                  />

                  {/* Upload States */}
                  {upload.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="flex items-center text-white text-xs">
                        <Loader2 size={12} className="animate-spin mr-1" />
                        Uploading...
                      </div>
                    </div>
                  )}

                  {upload.uploaded && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                        ✓ Uploaded
                      </div>
                    </div>
                  )}

                  {upload.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        Failed
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImageUpload(upload.id)}
                    className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    disabled={upload.uploading || isSubmitting}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            {errors.images && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.images}
              </p>
            )}
          </div>

          {/* Category and Live */}
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
                onChange={handleChange}
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
                onChange={handleChange}
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

          {/* Sizes */}
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

            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, index) => (
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

          {/* Stock Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Item is in stock
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {editingArticle ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingArticle ? 'Update Article' : 'Create Article'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}