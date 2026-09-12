import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import { Exercise, MuscleGroup } from '../api/types'

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [groups, setGroups] = useState<MuscleGroup[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMuscles, setSelectedMuscles] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const [exerciseList, groupList] = await Promise.all([
      api.get<Exercise[]>('/exercises'),
      api.get<MuscleGroup[]>('/muscle-groups'),
    ])
    setExercises(exerciseList)
    setGroups(groupList)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function toggleMuscle(id: number) {
    setSelectedMuscles((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/exercises', {
        name,
        description: description || undefined,
        muscleIds: Array.from(selectedMuscles),
      })
      setName('')
      setDescription('')
      setSelectedMuscles(new Set())
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create exercise')
    }
  }

  async function handleDelete(id: number) {
    await api.delete(`/exercises/${id}`)
    await load()
  }

  if (loading) return <p className="text-ink/60">Loading…</p>

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Exercises</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-ember px-4 py-2 text-sm font-medium text-white hover:bg-ember-dark"
        >
          {showForm ? 'Cancel' : 'Add exercise'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border border-ink/10 p-5">
          <div>
            <label className="block text-sm text-ink/70">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 px-3 py-2 focus:border-ember focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 px-3 py-2 focus:border-ember focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/70">
              Map to muscles
              <span className="ml-1 text-ink/40">
                (checkboxes for now — this becomes the 3D "map to" picker later)
              </span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.defaultColor }}
                    />
                    {group.name}
                  </p>
                  <div className="mt-1 space-y-1">
                    {group.muscles.map((muscle) => (
                      <label key={muscle.id} className="flex items-center gap-2 text-sm text-ink/70">
                        <input
                          type="checkbox"
                          checked={selectedMuscles.has(muscle.id)}
                          onChange={() => toggleMuscle(muscle.id)}
                        />
                        {muscle.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="rounded bg-ember px-4 py-2 text-sm font-medium text-white hover:bg-ember-dark"
          >
            Save exercise
          </button>
        </form>
      )}

      <ul className="mt-6 divide-y divide-ink/10">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">
                {exercise.name}
                {exercise.isDefault && (
                  <span className="ml-2 text-xs uppercase text-ink/40">default</span>
                )}
              </p>
              <p className="text-sm text-ink/60">
                {exercise.muscles.map((m) => m.muscle.name).join(', ')}
              </p>
            </div>
            {!exercise.isDefault && (
              <button
                onClick={() => handleDelete(exercise.id)}
                className="text-sm text-ink/40 hover:text-red-600"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
