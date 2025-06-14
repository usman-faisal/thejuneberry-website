import { LiveList } from './live-list'
import { getLives } from '@/app/actions/lives'

export default async function AdminLivesPage() {
  const { lives = [] } = await getLives()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lives Management</h1>
      </div>

      <LiveList initialLives={lives} />
    </div>
  )
}