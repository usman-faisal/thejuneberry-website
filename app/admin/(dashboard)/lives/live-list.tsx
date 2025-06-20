'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar, Play, Plus, Users, Clock, ExternalLink, AlertCircle } from 'lucide-react'
import { Prisma } from '@prisma/client'
import { LiveForm } from './live-form'
import { deleteLive } from '@/app/actions/lives'
import { toast } from 'sonner'
import Image from 'next/image'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, liveTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${liveTitle}"? This action cannot be undone and will unlink all associated articles.`
    )
    
    if (!confirmed) return

    try {
      setDeletingId(id)
      const result = await deleteLive(id)
      
      if (result.success) {
        setLives(prev => prev.filter(live => live.id !== id))
        toast.success('Live session deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete live session')
      }
    } catch (error) {
      console.error('Error deleting live:', error)
      toast.error('An error occurred while deleting the live session')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (live: Prisma.LiveGetPayload<{ include: { articles: true } }>) => {
    setEditingLive(live)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingLive(undefined)
  }

  const handleFormSuccess = (updatedLive: Prisma.LiveGetPayload<{ include: { articles: true } }>) => {
    if (editingLive) {
      // Update existing live
      setLives(prev => prev.map(live => 
        live.id === updatedLive.id ? updatedLive : live
      ))
    } else {
      // Add new live
      setLives(prev => [updatedLive, ...prev])
    }
    handleCloseForm()
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const isUpcoming = (date: Date | string) => {
    return new Date(date) > new Date()
  }

  const isLive = (date: Date | string) => {
    const now = new Date()
    const liveDate = new Date(date)
    const diffMs = now.getTime() - liveDate.getTime()
    // Consider "live" if within 2 hours of scheduled time
    return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000
  }

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          {lives.length} live session{lives.length !== 1 ? 's' : ''} total
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Schedule Live
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LiveForm
          onClose={handleCloseForm}
          editingLive={editingLive}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Lives Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {lives.length === 0 ? (
          <div className="text-center py-16">
            <Play className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions yet</h3>
            <p className="text-gray-500 mb-6">Get started by scheduling your first live session.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Schedule Live
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Live Session
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {lives.map((live) => {
                  const { date, time } = formatDate(live.date)
                  const upcoming = isUpcoming(live.date)
                  const currentlyLive = isLive(live.date)
                  const isDeleting = deletingId === live.id

                  return (
                    <tr key={live.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {/* Thumbnail */}
                          <div className="h-16 w-24 flex-shrink-0 relative">
                            {live.thumbnail ? (
                              <Image
                                className="h-16 w-24 rounded-lg object-cover border border-gray-200"
                                src={live.thumbnail}
                                width={96}
                                height={64}
                                alt={live.title}
                              />
                            ) : (
                              <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border border-gray-200">
                                <Play size={24} className="text-pink-500" />
                              </div>
                            )}
                            {currentlyLive && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                                LIVE
                              </div>
                            )}
                          </div>

                          {/* Live Info */}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {live.title}
                            </div>
                            {live.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {live.description.length > 80 
                                  ? `${live.description.substring(0, 80)}...` 
                                  : live.description
                                }
                              </div>
                            )}
                            {live.videoUrl && (
                              <a
                                href={live.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                <ExternalLink size={12} className="mr-1" />
                                View Stream
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900 font-medium">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            {date}
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            {time}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentlyLive
                              ? 'bg-red-100 text-red-800'
                              : upcoming
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div 
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              currentlyLive
                                ? 'bg-red-400 animate-pulse'
                                : upcoming
                                ? 'bg-blue-400'
                                : 'bg-gray-400'
                            }`} 
                          />
                          {currentlyLive ? 'Live Now' : upcoming ? 'Upcoming' : 'Completed'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users size={16} className="mr-2 text-gray-400" />
                          <span className="font-medium">
                            {live.articles?.length || 0}
                          </span>
                          <span className="text-gray-500 ml-1">
                            item{(live.articles?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(live)}
                            disabled={isDeleting}
                            className="inline-flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit live session"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(live.id, live.title)}
                            disabled={isDeleting}
                            className="inline-flex items-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete live session"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}