'use client'

import { useState } from 'react'
import { Plus, Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Prisma } from '@prisma/client'
import { createArticle, updateArticle } from '@/app/actions/articles'

interface ImageUpload {
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
  lives: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>[]
}

interface ArticleImage {
  id?: string
  url: string
  public_id?: string
  articleId?: string | null
}

export function ArticleForm({ onClose, editingArticle, lives }: ArticleFormProps) {
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [newSize, setNewSize] = useState('')

  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    price: editingArticle?.price.toString() || '',
    images: editingArticle?.images || [] as ArticleImage[],
    category: editingArticle?.category || '',
    sizes: editingArticle?.sizes.map(sizeObj => sizeObj.size) || [],
    inStock: editingArticle?.inStock ?? true,
    liveId: editingArticle?.liveId || ''
  })

  const uploadToCloudinary = async (file: File): Promise<{ url: string, public_id: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }

    const data = await response.json()
    return { url: data.url, public_id: data.public_id }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newUploads: ImageUpload[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setImageUploads(prev => [...prev, ...newUploads])
  }

  const uploadImages = async (): Promise<{ url: string, public_id: string }[]> => {
    const pendingUploads = imageUploads.filter(upload => !upload.uploaded && !upload.uploading)
    if (pendingUploads.length === 0) {
      return []
    }

    setUploadingImages(true)

    setImageUploads(prev => prev.map(u =>
      pendingUploads.includes(u) ? { ...u, uploading: true } : u
    ))

    const uploadPromises = pendingUploads.map(async (upload) => {
      try {
        const { url, public_id } = await uploadToCloudinary(upload.file)
        setImageUploads(prev => prev.map(u =>
          u.preview === upload.preview ? { ...u, uploading: false, uploaded: true, url, public_id } : u
        ))
        return { status: 'fulfilled', value: url, public_id, preview: upload.preview }
      } catch (error) {
        console.error('Error uploading image:', error)
        setImageUploads(prev => prev.map(u =>
          u.preview === upload.preview ? { ...u, uploading: false, error: 'Upload failed' } : u
        ))
        return { status: 'rejected', reason: error, preview: upload.preview }
      }
    })

    const results = await Promise.all(uploadPromises)

    const successfulUploads = results
      .filter(result => result.status === 'fulfilled')
      .map(result => ({ url: result.value, public_id: result.public_id }))

    const hasFailures = results.some(result => result.status === 'rejected')
    if (hasFailures) {
      alert('Some images failed to upload. Please review and try again.')
      setUploadingImages(false)
      throw new Error('Image upload failed')
    }

    return successfulUploads as { url: string, public_id: string }[]
  }

  const removeImageUpload = (index: number) => {
    const upload = imageUploads[index]
    URL.revokeObjectURL(upload.preview)
    setImageUploads(prev => prev.filter((_, i) => i !== index))
  }

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: url.trim() } as ArticleImage]
      }))
    }
  }

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }))
      setNewSize('')
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

    try {
      const hasPendingUploads = imageUploads.some(upload => !upload.uploaded && !upload.uploading)

      if (hasPendingUploads) {
        setUploadingImages(true)
      }

      const newImageUrls = await uploadImages()

      const allImages = [
        ...formData.images,
        ...newImageUrls.map(img => ({ url: img.url, public_id: img.public_id }))
      ]

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images: allImages,
        category: formData.category,
        sizes: formData.sizes,
        inStock: formData.inStock,
        liveId: formData.liveId || null,
      }

      const result = editingArticle 
        ? await updateArticle(editingArticle.id, payload)
        : await createArticle(payload)

      if (result.success) {
        onClose()
      } else {
        console.error('Error saving article:', result.error)
        alert('Failed to save article: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error in submission process:', error)
      alert('An error occurred while saving the article')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {editingArticle ? 'Edit Article' : 'Add New Article'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (Rs.) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">Images</label>

            <div className="flex gap-2 mb-4">
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={addImageUrl}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <ImageIcon size={16} className="mr-2" />
                Add URL
              </button>

              {imageUploads.some(upload => !upload.uploaded && !upload.uploading) && (
                <button
                  type="button"
                  onClick={uploadImages}
                  disabled={uploadingImages}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {uploadingImages ? 'Uploading...' : 'Upload All'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={`uploaded-${index}`} className="relative group">
                  <Image
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                    width={150}
                    height={150}
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {imageUploads.map((upload, index) => (
                <div key={`upload-${index}`} className="relative group">
                  <Image
                    src={upload.preview}
                    alt={`Upload ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg border ${upload.uploading ? 'opacity-50' : ''}`}
                    width={150}
                    height={150}
                  />

                  {upload.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-sm">Uploading...</div>
                    </div>
                  )}

                  {upload.uploaded && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">✓ Uploaded</div>
                    </div>
                  )}

                  {upload.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Failed</div>
                    </div>
                  )}

                  {!upload.uploaded && (
                    <button
                      type="button"
                      onClick={() => removeImageUpload(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Casual, Formal, Party"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sizes</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g., S, M, L, XL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Add Size
              </button>
            </div>

            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured in Live</label>
            <select
              name="liveId"
              value={formData.liveId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Not featured in any live</option>
              {lives.map((live) => (
                <option key={live.id} value={live.id}>
                  {live.title} - {new Date(live.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium">In Stock</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={uploadingImages}
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {uploadingImages ? 'Uploading Images...' : editingArticle ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 