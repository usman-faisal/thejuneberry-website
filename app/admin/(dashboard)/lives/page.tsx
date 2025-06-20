import { LiveList } from './live-list'
import { getLives } from '@/app/actions/lives'
import { Play, Calendar, Users, Clock } from 'lucide-react'

export default async function AdminLivesPage() {
  const { lives = [] } = await getLives()

  // Calculate stats
  const upcomingLives = lives.filter(live => new Date(live.date) > new Date()).length
  const liveLives = lives.filter(live => {
    const now = new Date()
    const liveDate = new Date(live.date)
    const diffMs = now.getTime() - liveDate.getTime()
    return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000
  }).length
  const completedLives = lives.filter(live => {
    const now = new Date()
    const liveDate = new Date(live.date)
    const diffMs = now.getTime() - liveDate.getTime()
    return diffMs > 2 * 60 * 60 * 1000
  }).length

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lives Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Schedule and manage your live streaming sessions
          </p>
        </div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-gray-900">{lives.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-red-600">{liveLives}</div>
            <div className="text-xs text-gray-500">Live Now</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-blue-600">{upcomingLives}</div>
            <div className="text-xs text-gray-500">Upcoming</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl border text-center">
            <div className="text-lg md:text-xl font-bold text-green-600">{completedLives}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Next Live Session Card */}
      {upcomingLives > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Next Live Session</p>
              <p className="text-lg md:text-xl font-semibold">
                {lives.find(live => new Date(live.date) > new Date())?.title || 'Upcoming Session'}
              </p>
              <p className="text-purple-100 text-sm mt-1">
                {new Date(lives.find(live => new Date(live.date) > new Date())?.date || '').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      )}

      <LiveList initialLives={lives} />
    </div>
  )
}