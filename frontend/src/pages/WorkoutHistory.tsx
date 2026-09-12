import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Workout } from '../api/types'

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null)

  useEffect(() => {
    api.get<Workout[]>('/workouts').then(setWorkouts)
  }, [])

  if (!workouts) return <p className="text-ink/60">Loading…</p>

  if (workouts.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-4 text-ink/60">No workouts logged yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      <div className="mt-6 space-y-6">
        {workouts.map((workout) => (
          <div key={workout.id} className="rounded border border-ink/10 p-4">
            <p className="font-medium">{new Date(workout.date).toLocaleDateString()}</p>
            <ul className="mt-2 space-y-1 text-sm text-ink/70">
              {workout.exercises.map((we) => (
                <li key={we.id}>
                  {we.exercise.name} — {we.sets.length} set{we.sets.length === 1 ? '' : 's'}
                  {we.sets.length > 0 && (
                    <span className="text-ink/50">
                      {' '}
                      ({we.sets.map((s) => `${s.reps}×${s.weight}${s.weightUnit}`).join(', ')})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
