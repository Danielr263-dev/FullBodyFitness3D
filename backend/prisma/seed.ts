import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Starter data. meshId is left null everywhere — fill it in once the
// Blender export exists and you know the real mesh names.
const groups = [
  {
    name: 'Chest',
    defaultColor: '#e11d48',
    muscles: ['Pectoralis Major (Upper)', 'Pectoralis Major (Lower)'],
  },
  {
    name: 'Back',
    defaultColor: '#2563eb',
    muscles: ['Latissimus Dorsi', 'Trapezius', 'Rhomboids'],
  },
  {
    name: 'Shoulders',
    defaultColor: '#d97706',
    muscles: ['Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid'],
  },
  {
    name: 'Arms',
    defaultColor: '#7c3aed',
    muscles: [
      'Biceps Brachii (Long Head)',
      'Biceps Brachii (Short Head)',
      'Triceps Brachii',
    ],
  },
  {
    name: 'Legs',
    defaultColor: '#059669',
    muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
  },
  {
    name: 'Core',
    defaultColor: '#0891b2',
    muscles: ['Rectus Abdominis', 'Obliques'],
  },
]

// exercise name -> muscle names it maps to
const defaultExercises: Record<string, string[]> = {
  'Bench Press': ['Pectoralis Major (Upper)', 'Triceps Brachii', 'Anterior Deltoid'],
  'Pull-Up': ['Latissimus Dorsi', 'Biceps Brachii (Long Head)'],
  'Barbell Squat': ['Quadriceps', 'Glutes', 'Hamstrings'],
  'Deadlift': ['Hamstrings', 'Glutes', 'Trapezius'],
  'Overhead Press': ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps Brachii'],
  'Bicep Curl': ['Biceps Brachii (Long Head)', 'Biceps Brachii (Short Head)'],
  'Tricep Pushdown': ['Triceps Brachii'],
  'Plank': ['Rectus Abdominis', 'Obliques'],
}

async function main() {
  const muscleByName = new Map<string, number>()

  for (const group of groups) {
    const createdGroup = await prisma.muscleGroup.upsert({
      where: { name: group.name },
      update: { defaultColor: group.defaultColor },
      create: { name: group.name, defaultColor: group.defaultColor },
    })

    for (const muscleName of group.muscles) {
      const existing = await prisma.muscle.findFirst({
        where: { name: muscleName, muscleGroupId: createdGroup.id },
      })
      const muscle =
        existing ??
        (await prisma.muscle.create({
          data: { name: muscleName, muscleGroupId: createdGroup.id },
        }))
      muscleByName.set(muscleName, muscle.id)
    }
  }

  for (const [exerciseName, muscleNames] of Object.entries(defaultExercises)) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exerciseName, isDefault: true },
    })
    const exercise =
      existing ??
      (await prisma.exercise.create({
        data: { name: exerciseName, isDefault: true },
      }))

    for (const muscleName of muscleNames) {
      const muscleId = muscleByName.get(muscleName)
      if (!muscleId) continue
      await prisma.exerciseMuscle.upsert({
        where: { exerciseId_muscleId: { exerciseId: exercise.id, muscleId } },
        update: {},
        create: { exerciseId: exercise.id, muscleId },
      })
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
