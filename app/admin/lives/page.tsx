'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Calendar, Play } from 'lucide-react'
import { Live, Prisma } from '@prisma/client'

export default function AdminLivesPage() {
  const [lives, setLives] = useState<Prisma.LiveGetPayload<{
    include: { articles: true };
  }>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLive, setEditingLive] = useState<Prisma.LiveGetPayload<{
    include: { articles: true };
  }> | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    videoUrl: '',
    thumbnail: ''
  })

  useEffect(() => {
    fetchLives()
  }, [])

  useEffect(() => {
    if (editingLive) {
      setFormData({
        title: editingLive.title,
        description: editingLive.description || '',
        date: new Date(editingLive.date).toISOString().slice(0, 16),
        videoUrl: editingLive.videoUrl || '',
        thumbnail: editingLive.thumbnail || ''
      })
      setShowForm(true)
    }
  }, [editingLive])

  const fetchLives = async () => {
    try {
      const response = await fetch('/api/lives')
      const data = await response.json()
      setLives(data)
    } catch (error) {
      console.error('Error fetching lives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingLive ? `/api/lives/${editingLive.id}` : '/api/lives'
      const method = editingLive ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchLives()
        setShowForm(false)
        setEditingLive(null)
        setFormData({ title: '', description: '', date: '', videoUrl: '', thumbnail: '' })
      }
    } catch (error) {
      console.error('Error saving live:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this live session?')) {
      try {
        const response = await fetch(`/api/lives/${id}`, { method: 'DELETE' })
        if (response.ok) {
          fetchLives()
        }
      } catch (error) {
        console.error('Error deleting live:', error)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingLive(null)
    setFormData({ title: '', description: '', date: '', videoUrl: '', thumbnail: '' })
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lives Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus size={20} className="mr-2" />
          Add Live
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
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
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lives List */}
      <div className="bg-white rounded-lg shadow-sm">
        {lives.length === 0 ? (
          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No live sessions created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lives.map((live) => (
                  <tr key={live.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{live.title}</div>
                        {live.description && (
                          <div className="text-sm text-gray-500">{live.description.substring(0, 100)}...</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(live.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {live.articles?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingLive(live)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(live.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}