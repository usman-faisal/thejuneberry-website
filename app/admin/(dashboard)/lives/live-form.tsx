'use client'

import { useState, useEffect } from 'react'
import { Prisma } from '@prisma/client'
import { createLive, updateLive } from '@/app/actions/lives'

interface LiveFormProps {
  onClose: () => void
  editingLive?: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>
}

export function LiveForm({ onClose, editingLive }: LiveFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    videoUrl: '',
    thumbnail: ''
  })

  useEffect(() => {
    if (editingLive) {
      setFormData({
        title: editingLive.title,
        description: editingLive.description || '',
        date: new Date(editingLive.date).toISOString().slice(0, 16),
        videoUrl: editingLive.videoUrl || '',
        thumbnail: editingLive.thumbnail || ''
      })
    }
  }, [editingLive])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = editingLive 
        ? await updateLive(editingLive.id, formData)
        : await createLive(formData)

      if (result.success) {
        onClose()
      } else {
        alert('Failed to save live: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving live:', error)
      alert('An error occurred while saving the live')
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
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
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
            <label className="block text-sm font-medium mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video URL</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700"
            >
              {editingLive ? 'Update' : 'Create'}
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