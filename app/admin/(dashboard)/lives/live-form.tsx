'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Prisma } from '@prisma/client'
import { createLive, updateLive } from '@/app/actions/lives'
import { uploadToCloudinary } from '@/app/actions/upload' // Import the upload action
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface LiveFormProps {
  onClose: () => void
  editingLive?: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>
}

export function LiveForm({ onClose, editingLive }: LiveFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    videoUrl: '',
    thumbnail: '',
    thumbnail_public_id: null as string | null, // Add this
  })

  useEffect(() => {
    if (editingLive) {
      setFormData({
        title: editingLive.title,
        description: editingLive.description || '',
        date: new Date(editingLive.date).toISOString().slice(0, 16),
        videoUrl: editingLive.videoUrl || '',
        thumbnail: editingLive.thumbnail || '',
        thumbnail_public_id: editingLive.thumbnail_public_id || null, // Add this
      })
      if (editingLive.thumbnail) {
        setThumbnailPreview(editingLive.thumbnail)
      }
    }
  }, [editingLive])

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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
      
      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file)
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview) // Clean up old preview
      }
      setThumbnailPreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let submissionData = { ...formData }

      // If a new thumbnail file was selected, upload it first
      if (thumbnailFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', thumbnailFile)
        
        const uploadResult = await uploadToCloudinary(uploadFormData)

        if (!uploadResult.success) {
          toast.error('Failed to upload thumbnail: ' + (uploadResult.error || 'Unknown error'))
          setIsSubmitting(false)
          return
        }
        
        // Update data with the new thumbnail URL and public_id
        submissionData.thumbnail = uploadResult.url!
        submissionData.thumbnail_public_id = uploadResult.public_id!
      }

      const result = editingLive 
        ? await updateLive(editingLive.id, submissionData)
        : await createLive(submissionData)

      if (result.success) {
        toast.success(`Live session ${editingLive ? 'updated' : 'created'} successfully!`);
        onClose()
      } else {
        toast.error('Failed to save live: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving live:', error)
      toast.error('An error occurred while saving the live')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {editingLive ? 'Edit Live Session' : 'Add New Live Session'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... other form fields (title, description, date, videoUrl) ... */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date & Time *</label>
            <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Video URL</label>
            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
          </div>

          {/* Thumbnail Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center border">
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail preview" width={128} height={80} className="object-cover w-full h-full rounded-lg" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleThumbnailSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload size={16} className="inline-block mr-2" />
                  Change
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:bg-pink-300 flex items-center justify-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLive ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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