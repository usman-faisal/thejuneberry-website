'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar, Play, Plus } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { LiveForm } from './live-form'
import { deleteLive } from '@/app/actions/lives'

interface LiveListProps {
  initialLives: Prisma.LiveGetPayload<{
    include: { articles: true };
  }>[]
}

export function LiveList({ initialLives }: LiveListProps) {
  const [lives, setLives] = useState(initialLives)
  const [showForm, setShowForm] = useState(false)
  const [editingLive, setEditingLive] = useState<Prisma.LiveGetPayload<{
    include: { articles: true };
  }> | undefined>(undefined)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this live session?')) {
      try {
        const result = await deleteLive(id)
        if (result.success) {
          setLives(lives.filter(live => live.id !== id))
        } else {
          alert('Failed to delete live: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting live:', error)
        alert('An error occurred while deleting the live')
      }
    }
  }

  return (
    <>
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus size={20} className="mr-2" />
          Add Live
        </button>
      </div>

      {showForm && (
        <LiveForm
          onClose={() => {
            setShowForm(false)
            setEditingLive(undefined)
          }}
          editingLive={editingLive}
        />
      )}

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
                          onClick={() => {
                            setEditingLive(live)
                            setShowForm(true)
                          }}
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
    </>
  )
} 