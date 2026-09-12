import { Prisma } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthedRequest, requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

const exerciseInclude = {
  muscles: { include: { muscle: { include: { muscleGroup: true } } } },
}

// Default exercises + this user's own custom ones.
router.get('/', async (req: AuthedRequest, res) => {
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ isDefault: true }, { createdById: req.userId }] },
    include: exerciseInclude,
    orderBy: { name: 'asc' },
  })
  res.json(exercises)
})

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  muscleIds: z.array(z.number().int()).min(1, 'Map at least one muscle'),
})

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { name, description, muscleIds } = parsed.data

  const exercise = await prisma.exercise.create({
    data: {
      name,
      description,
      isDefault: false,
      createdById: req.userId,
      muscles: { create: muscleIds.map((muscleId) => ({ muscleId })) },
    },
    include: exerciseInclude,
  })
  res.status(201).json(exercise)
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  muscleIds: z.array(z.number().int()).optional(),
})

router.put('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id)
  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' })
  if (exercise.isDefault || exercise.createdById !== req.userId) {
    return res.status(403).json({ error: 'You can only edit exercises you created' })
  }

  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message })
  }
  const { name, description, muscleIds } = parsed.data

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (muscleIds) {
      await tx.exerciseMuscle.deleteMany({ where: { exerciseId: id } })
      await tx.exerciseMuscle.createMany({
        data: muscleIds.map((muscleId) => ({ exerciseId: id, muscleId })),
      })
    }
    return tx.exercise.update({
      where: { id },
      data: { name, description },
      include: exerciseInclude,
    })
  })

  res.json(updated)
})

router.delete('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id)
  const exercise = await prisma.exercise.findUnique({ where: { id } })
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' })
  if (exercise.isDefault || exercise.createdById !== req.userId) {
    return res.status(403).json({ error: 'You can only delete exercises you created' })
  }

  await prisma.exercise.delete({ where: { id } })
  res.status(204).send()
})

export default router
