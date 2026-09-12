import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Exercise, Workout } from '../api/types'

export default function WorkoutLog() {
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | ''>('')

  useEffect(() => {
    api.get<Exercise[]>('/exercises').then(setExercises)
  }, [])

  async function startWorkout() {
    const created = await api.post<Workout>('/workouts', {})
    setWorkout(created)
  }

  async function addExercise(e: FormEvent) {
    e.preventDefault()
    if (!workout || !selectedExerciseId) return
    await api.post(`/workouts/${workout.id}/exercises`, { exerciseId: selectedExerciseId })
    const refreshed = await api.get<Workout>(`/workouts/${workout.id}`)
    setWorkout(refreshed)
    setSelectedExerciseId('')
  }

  async function addSet(workoutExerciseId: number, reps: number, weight: number) {
    if (!workout) return
    await api.post(`/workout-exercises/${workoutExerciseId}/sets`, {
      reps,
      weight,
      weightUnit: 'lb',
    })
    const refreshed = await api.get<Workout>(`/workouts/${workout.id}`)
    setWorkout(refreshed)
  }

  if (!workout) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log a workout</h1>
        <button
          onClick={startWorkout}
          className="mt-6 rounded bg-ember px-4 py-2 text-sm font-medium text-white hover:bg-ember-dark"
        >
          Start workout
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Workout — {new Date(workout.date).toLocaleDateString()}
      </h1>

      <form onSubmit={addExercise} className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm text-ink/70">Add exercise</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
            className="mt-1 w-full rounded border border-ink/20 px-3 py-2"
          >
            <option value="">Select an exercise…</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!selectedExerciseId}
          className="rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Add
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {workout.exercises.map((we) => (
          <ExerciseBlock key={we.id} workoutExercise={we} onAddSet={addSet} />
        ))}
      </div>

      <button
        onClick={() => navigate('/history')}
        className="mt-8 text-sm text-steel hover:underline"
      >
        Done for today → view history
      </button>
    </div>
  )
}

function ExerciseBlock({
  workoutExercise,
  onAddSet,
}: {
  workoutExercise: Workout['exercises'][number]
  onAddSet: (workoutExerciseId: number, reps: number, weight: number) => void
}) {
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!reps || !weight) return
    onAddSet(workoutExercise.id, Number(reps), Number(weight))
    setReps('')
    setWeight('')
  }

  return (
    <div className="rounded border border-ink/10 p-4">
      <h2 className="font-medium">{workoutExercise.exercise.name}</h2>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-ink/50">
          <tr>
            <th className="font-normal">Set</th>
            <th className="font-normal">Reps</th>
            <th className="font-normal">Weight</th>
          </tr>
        </thead>
        <tbody>
          {workoutExercise.sets.map((set) => (
            <tr key={set.id}>
              <td className="py-1">{set.setNumber}</td>
              <td className="py-1">{set.reps}</td>
              <td className="py-1">
                {set.weight} {set.weightUnit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-20 rounded border border-ink/20 px-2 py-1 text-sm"
        />
        <input
          type="number"
          placeholder="Weight (lb)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-28 rounded border border-ink/20 px-2 py-1 text-sm"
        />
        <button type="submit" className="text-sm text-steel hover:underline">
          Add set
        </button>
      </form>
    </div>
  )
}
