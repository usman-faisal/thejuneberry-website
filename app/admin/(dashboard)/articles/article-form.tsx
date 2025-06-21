'use client'

import { useState } from 'react'
import { Article, Live, Prisma } from '@prisma/client'
import { createArticle, updateArticle } from '@/app/actions/articles'
import { toast } from 'sonner'
import { ArticleFormHeader } from '@/components/admin/ArticleFormHeader'
import { BasicInfoSection } from '@/components/admin/BasicInfoSection'
import { MediaUploadSection } from '@/components/admin/MediaUploadSection'
import { CategoryAndLiveSection } from '@/components/admin/CategoryAndLiveSection'
import { SizesSection } from '@/components/admin/SizesSection'
import { StockStatusSection } from '@/components/admin/StockStatusSection'
import { FormActions } from '@/components/admin/FormActions'
import { MediaUpload } from '@/components/admin/types'

interface ArticleFormProps {
  onClose: () => void
  editingArticle?: Article
  lives: Live[]
}

export function ArticleForm({ onClose, editingArticle, lives }: ArticleFormProps) {
  const [mediaUploads, setMediaUploads] = useState<MediaUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    price: editingArticle?.price.toString() || '',
    images: editingArticle?.images || [] as string[],
    videos: editingArticle?.videos || [] as string[],
    category: editingArticle?.category || '',
    sizes: editingArticle?.sizes || [],
    inStock: editingArticle?.inStock ?? true,
    liveId: editingArticle?.liveId || '',
    videoUrl: editingArticle?.videoUrl || ''
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Article name is required'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    // Check both existing images and uploaded images
    const totalImages = formData.images.length + mediaUploads.filter(u => u.type === 'image' && u.uploaded).length
    if (totalImages === 0) {
      newErrors.images = 'At least one image is required'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      // Get uploaded media URLs
      const uploadedImages = mediaUploads
        .filter(u => u.type === 'image' && u.uploaded && u.url)
        .map(u => u.url!)
      
      const uploadedVideos = mediaUploads
        .filter(u => u.type === 'video' && u.uploaded && u.url)
        .map(u => u.url!)

      // Combine existing and uploaded media
      const allImages = [...formData.images, ...uploadedImages]
      const allVideos = [...formData.videos, ...uploadedVideos]

      console.log('Submitting with media:', { images: allImages, videos: allVideos })

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        images: allImages,
        videos: allVideos,
        category: formData.category.trim(),
        sizes: formData.sizes,
        inStock: formData.inStock,
        liveId: formData.liveId || null,
        videoUrl: formData.videoUrl.trim() || undefined,
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

  const handleSizesChange = (sizes: string[]) => {
    setFormData(prev => ({ ...prev, sizes: sizes as any }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }))
  }

  const handleVideosChange = (videos: string[]) => {
    setFormData(prev => ({ ...prev, videos }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <ArticleFormHeader 
          isEditing={!!editingArticle}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <BasicInfoSection 
            formData={{
              name: formData.name,
              description: formData.description,
              price: formData.price,
              videoUrl: formData.videoUrl
            }}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          <MediaUploadSection
            type="image"
            existingMedia={formData.images}
            mediaUploads={mediaUploads}
            errors={errors}
            isSubmitting={isSubmitting}
            onMediaUploadsChange={setMediaUploads}
            onExistingMediaChange={handleImagesChange}
            onErrorsChange={setErrors}
          />

          <MediaUploadSection
            type="video"
            existingMedia={formData.videos}
            mediaUploads={mediaUploads}
            errors={errors}
            isSubmitting={isSubmitting}
            onMediaUploadsChange={setMediaUploads}
            onExistingMediaChange={handleVideosChange}
            onErrorsChange={setErrors}
          />

          <CategoryAndLiveSection
            formData={{
              category: formData.category,
              liveId: formData.liveId
            }}
            lives={lives}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          <SizesSection
            sizes={formData.sizes}
            isSubmitting={isSubmitting}
            onSizesChange={handleSizesChange}
          />

          <StockStatusSection
            inStock={formData.inStock}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          <FormActions
            isEditing={!!editingArticle}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  )
}