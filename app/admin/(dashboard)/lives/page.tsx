import { LiveList } from './live-list'
import { getLives } from '@/app/actions/lives'

export default async function AdminLivesPage() {
  const { lives = [] } = await getLives()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lives Management</h1>
          <p className="text-gray-600 mt-1">Manage your live streaming sessions</p>
        </div>
      </div>

      <LiveList initialLives={lives} />
    </div>
  )
}