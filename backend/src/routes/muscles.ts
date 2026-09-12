import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/muscle-groups', async (_req, res) => {
  const groups = await prisma.muscleGroup.findMany({
    include: { muscles: true },
    orderBy: { name: 'asc' },
  })
  res.json(groups)
})

router.get('/muscles', async (_req, res) => {
  const muscles = await prisma.muscle.findMany({
    include: { muscleGroup: true },
    orderBy: { name: 'asc' },
  })
  res.json(muscles)
})

export default router
