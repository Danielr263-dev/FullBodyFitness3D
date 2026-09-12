export interface MuscleGroup {
  id: number
  name: string
  defaultColor: string
  muscles: Muscle[]
}

export interface Muscle {
  id: number
  name: string
  meshId: string | null
  muscleGroupId: number
  muscleGroup?: MuscleGroup
}

export interface Exercise {
  id: number
  name: string
  description?: string | null
  isDefault: boolean
  createdById?: number | null
  muscles: { muscle: Muscle }[]
}

export interface WorkoutSet {
  id: number
  setNumber: number
  reps: number
  weight: number
  weightUnit: 'lb' | 'kg'
}

export interface WorkoutExercise {
  id: number
  exerciseId: number
  exercise: Exercise
  order: number
  sets: WorkoutSet[]
}

export interface Workout {
  id: number
  date: string
  notes?: string | null
  exercises: WorkoutExercise[]
}
