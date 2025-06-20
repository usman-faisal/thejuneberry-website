'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Prisma } from '@prisma/client'
import { createLive, updateLive } from '@/app/actions/lives'
import { uploadToCloudinary } from '@/app/actions/upload'
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon, Calendar, Link, FileText, Type, AlertCircle, Play } from 'lucide-react'

interface LiveFormProps {
  onClose: () => void
  editingLive?: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>
  onSuccess: (live: Prisma.LiveGetPayload<{ include: { articles: true } }>) => void
}

export function LiveForm({ onClose, editingLive, onSuccess }: LiveFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    videoUrl: '',
    thumbnail: '',
    thumbnail_public_id: null as string | null,
  })

  useEffect(() => {
    if (editingLive) {
      const date = new Date(editingLive.date)
      // Format date for datetime-local input
      const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      setFormData({
        title: editingLive.title,
        description: editingLive.description || '',
        date: formattedDate,
        videoUrl: editingLive.videoUrl || '',
        thumbnail: editingLive.thumbnail || '',
        thumbnail_public_id: editingLive.thumbnail_public_id || null,
      })
      
      if (editingLive.thumbnail) {
        setThumbnailPreview(editingLive.thumbnail)
      }
    } else {
      // Set default date to now for new lives
      const now = new Date()
      const formattedNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setFormData(prev => ({ ...prev, date: formattedNow }))
    }
  }, [editingLive])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Live session title is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date and time is required'
    } else {
      const selectedDate = new Date(formData.date)
      const now = new Date()
      if (selectedDate < now && !editingLive) {
        newErrors.date = 'Cannot schedule a live session in the past'
      }
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image is too large. Maximum size is 5MB.')
      return
    }

    setThumbnailFile(file)
    
    // Clean up previous preview
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    
    // Create new preview
    const previewUrl = URL.createObjectURL(file)
    setThumbnailPreview(previewUrl)

    // Clear thumbnail errors
    setErrors(prev => ({ ...prev, thumbnail: '' }))

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(null)
    setThumbnailFile(null)
    setFormData(prev => ({
      ...prev,
      thumbnail: '',
      thumbnail_public_id: null
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
      let submissionData = { ...formData }

      // Upload thumbnail if a new file was selected
      if (thumbnailFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', thumbnailFile)
        
        const uploadResult = await uploadToCloudinary(uploadFormData)

        if (!uploadResult.success) {
          toast.error(uploadResult.error || 'Failed to upload thumbnail')
          return
        }
        
        submissionData.thumbnail = uploadResult.url!
        submissionData.thumbnail_public_id = uploadResult.public_id!
      }

      const result = editingLive 
        ? await updateLive(editingLive.id, submissionData)
        : await createLive(submissionData)

      if (result.success) {
        toast.success(
          `Live session ${editingLive ? 'updated' : 'scheduled'} successfully!`
        )
        onSuccess(result.live as any)
      } else {
        toast.error(result.error || 'Failed to save live session')
      }
    } catch (error) {
      console.error('Error saving live:', error)
      toast.error('An error occurred while saving the live session')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg mr-3">
                <Play size={20} className="text-pink-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {editingLive ? 'Edit Live Session' : 'Schedule Live Session'}
                </h2>
                <p className="text-sm text-gray-500 hidden md:block">
                  {editingLive ? 'Update your live session details' : 'Create a new live streaming session'}
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
          {/* Title */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Type size={16} className="mr-2 text-gray-400" />
              Live Session Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter an engaging title for your live session"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="mr-2 text-gray-400" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what you'll be showcasing in this live session..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="mr-2 text-gray-400" />
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Link size={16} className="mr-2 text-gray-400" />
              Video URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/live/... or https://youtube.com/watch?v=..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                errors.videoUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.videoUrl}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Add the streaming URL where viewers can watch your live session
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <ImageIcon size={16} className="mr-2 text-gray-400" />
              Thumbnail Image
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 hover:border-gray-400 transition-colors">
              {thumbnailPreview ? (
                <div className="relative">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    width={400}
                    height={225}
                    className="w-full h-32 md:h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 md:p-2 hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    Upload a thumbnail for your live session
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={14} className="mr-2" />
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleThumbnailSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 16:9 aspect ratio, max 5MB
                  </p>
                </div>
              )}
            </div>
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
                  {editingLive ? 'Updating...' : 'Scheduling...'}
                </div>
              ) : (
                editingLive ? 'Update Live Session' : 'Schedule Live Session'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}