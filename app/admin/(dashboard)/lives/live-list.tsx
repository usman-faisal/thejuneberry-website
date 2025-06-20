'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Calendar, Play, Plus, Users, Clock, ExternalLink, AlertCircle, Search, X } from 'lucide-react'
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
  const [filteredLives, setFilteredLives] = useState(initialLives)
  const [showForm, setShowForm] = useState(false)
  const [editingLive, setEditingLive] = useState<Prisma.LiveGetPayload<{
    include: { articles: true };
  }> | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all')

  // Filter lives based on search and status
  const filterLives = () => {
    let filtered = lives

    if (searchTerm) {
      filtered = filtered.filter(live =>
        live.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        live.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(live => {
        const now = new Date()
        const liveDate = new Date(live.date)
        const diffMs = now.getTime() - liveDate.getTime()
        
        switch (statusFilter) {
          case 'live':
            return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000
          case 'upcoming':
            return liveDate > now
          case 'completed':
            return diffMs > 2 * 60 * 60 * 1000
          default:
            return true
        }
      })
    }

    setFilteredLives(filtered)
  }

  useEffect(() => {
    filterLives()
  }, [searchTerm, statusFilter, lives])

  const handleDelete = async (id: string, liveTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${liveTitle}"? This action cannot be undone and will unlink all associated articles.`
    )
    
    if (!confirmed) return

    try {
      setDeletingId(id)
      const result = await deleteLive(id)
      
      if (result.success) {
        const updatedLives = lives.filter(live => live.id !== id)
        setLives(updatedLives)
        setFilteredLives(updatedLives)
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
      const updatedLives = lives.map(live => 
        live.id === updatedLive.id ? updatedLive : live
      )
      setLives(updatedLives)
      setFilteredLives(updatedLives)
    } else {
      // Add new live
      const newLives = [updatedLive, ...lives]
      setLives(newLives)
      setFilteredLives(newLives)
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
    return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all'

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search live sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="live">Live Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredLives.length}</span> of <span className="font-medium">{lives.length}</span> live sessions
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Schedule Live
          </button>
        </div>
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
      {filteredLives.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 md:p-12 text-center">
          <Play className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters ? 'No live sessions match your filters' : 'No live sessions yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by scheduling your first live session'
            }
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Schedule Live
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredLives.map((live) => {
              const { date, time } = formatDate(live.date)
              const upcoming = isUpcoming(live.date)
              const currentlyLive = isLive(live.date)
              const isDeleting = deletingId === live.id

              return (
                <div key={live.id} className="bg-white p-4 rounded-xl border">
                  {/* Live Status Badge */}
                  {currentlyLive && (
                    <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mb-3">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse"></div>
                      LIVE NOW
                    </div>
                  )}

                  {/* Thumbnail and Basic Info */}
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-12 relative flex-shrink-0">
                      {live.thumbnail ? (
                        <Image
                          className="w-full h-full rounded-lg object-cover border border-gray-200"
                          src={live.thumbnail}
                          width={80}
                          height={48}
                          alt={live.title}
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border border-gray-200">
                          <Play size={16} className="text-pink-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{live.title}</h3>
                      {live.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {live.description.length > 60 
                            ? `${live.description.substring(0, 60)}...` 
                            : live.description
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date and Status */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {time}
                    </div>
                  </div>

                  {/* Articles and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users size={12} className="mr-1" />
                      {live.articles?.length || 0} items
                    </div>
                    
                    <div className="flex gap-2">
                      {live.videoUrl && (
                        <a
                          href={live.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(live)}
                        disabled={isDeleting}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(live.id, live.title)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {!currentlyLive && (
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          upcoming
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div 
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            upcoming ? 'bg-blue-400' : 'bg-gray-400'
                          }`} 
                        />
                        {upcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border overflow-hidden">
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
                  {filteredLives.map((live) => {
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
          </div>
        </>
      )}
    </>
  )
}