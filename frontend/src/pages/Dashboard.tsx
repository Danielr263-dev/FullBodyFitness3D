import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="mt-2 text-ink/70">
        Log a workout, browse exercises, or check your history.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/log"
          className="rounded border border-ink/10 p-5 hover:border-ember"
        >
          <h2 className="font-medium">Log a workout</h2>
          <p className="mt-1 text-sm text-ink/60">Start tracking today's sets</p>
        </Link>
        <Link
          to="/exercises"
          className="rounded border border-ink/10 p-5 hover:border-ember"
        >
          <h2 className="font-medium">Exercises</h2>
          <p className="mt-1 text-sm text-ink/60">Browse or add exercises</p>
        </Link>
        <Link
          to="/history"
          className="rounded border border-ink/10 p-5 hover:border-ember"
        >
          <h2 className="font-medium">History</h2>
          <p className="mt-1 text-sm text-ink/60">Review past workouts</p>
        </Link>
      </div>
    </div>
  )
}
