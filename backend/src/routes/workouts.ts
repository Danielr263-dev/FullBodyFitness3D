import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthedRequest, requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

const workoutInclude = {
  exercises: {
    include: {
      exercise: true,
      sets: { orderBy: { setNumber: 'asc' as const } },
    },
    orderBy: { order: 'asc' as const },
  },
}

// This user's workout history, most recent first.
router.get('/workouts', async (req: AuthedRequest, res) => {
  const workouts = await prisma.workout.findMany({
    where: { userId: req.userId },
    include: workoutInclude,
    orderBy: { date: 'desc' },
  })
  res.json(workouts)
})

router.get('/workouts/:id', async (req: AuthedRequest, res) => {
  const workout = await prisma.workout.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
    include: workoutInclude,
  })
  if (!workout) return res.status(404).json({ error: 'Workout not found' })
  res.json(workout)
})

const createWorkoutSchema = z.object({
  notes: z.string().optional(),
})

router.post('/workouts', async (req: AuthedRequest, res) => {
  const parsed = createWorkoutSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid workout data' })

  const workout = await prisma.workout.create({
    data: { userId: req.userId!, notes: parsed.data.notes },
    include: workoutInclude,
  })
  res.status(201).json(workout)
})

const addExerciseSchema = z.object({ exerciseId: z.number().int() })

router.post('/workouts/:id/exercises', async (req: AuthedRequest, res) => {
  const workout = await prisma.workout.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  })
  if (!workout) return res.status(404).json({ error: 'Workout not found' })

  const parsed = addExerciseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'exerciseId is required' })

  const count = await prisma.workoutExercise.count({ where: { workoutId: workout.id } })
  const workoutExercise = await prisma.workoutExercise.create({
    data: { workoutId: workout.id, exerciseId: parsed.data.exerciseId, order: count },
    include: { exercise: true, sets: true },
  })
  res.status(201).json(workoutExercise)
})

const addSetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  weightUnit: z.enum(['lb', 'kg']).default('lb'),
})

// Ownership check goes through workout -> user so you can't log sets onto
// someone else's workout by guessing a workoutExercise id.
router.post('/workout-exercises/:id/sets', async (req: AuthedRequest, res) => {
  const workoutExerciseId = Number(req.params.id)
  const workoutExercise = await prisma.workoutExercise.findFirst({
    where: { id: workoutExerciseId, workout: { userId: req.userId } },
  })
  if (!workoutExercise) return res.status(404).json({ error: 'Not found' })

  const parsed = addSetSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }

  const setCount = await prisma.workoutSet.count({ where: { workoutExerciseId } })
  const set = await prisma.workoutSet.create({
    data: { workoutExerciseId, setNumber: setCount + 1, ...parsed.data },
  })
  res.status(201).json(set)
})

router.delete('/workout-exercises/:id/sets/:setId', async (req: AuthedRequest, res) => {
  const set = await prisma.workoutSet.findFirst({
    where: {
      id: Number(req.params.setId),
      workoutExerciseId: Number(req.params.id),
      workoutExercise: { workout: { userId: req.userId } },
    },
  })
  if (!set) return res.status(404).json({ error: 'Not found' })

  await prisma.workoutSet.delete({ where: { id: set.id } })
  res.status(204).send()
})

export default router
