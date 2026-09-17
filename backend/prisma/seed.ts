import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Starter data. meshId is left null everywhere — fill it in once the
// Blender export exists and you know the real mesh names.
const groups = [
  {
    name: 'Chest',
    defaultColor: '#e11d48',
    muscles: [
      'Clavicular Head (Upper)', 
      'Sternal Head (Middle)', 
      'Abdominal Head (Lower)',
    ],
  },
  //For Chest, workouts target Pectoralis Major, not really Pectoralis Minor
  {
    name: 'Back',
    defaultColor: '#2563eb',
    muscles: [
      'Latissimus Dorsi', 
      'Upper Trapezius', 
      'Middle Trapezius', 
      'Lower Trapezius',
      'Rhomboids', 
      'Erector Spinae', 
      'Teres minor', 
      'Teres major', 
      'Infraspinatus',
    ],
  },
  /*For Back, some of these are only trained indirectly, not directly, 
  but still good to add for the users to know their back anatomy, and myself */
  {
    name: 'Shoulders',
    defaultColor: '#d97706',
    muscles: [
      'Anterior Deltoid (Front)', 
      'Lateral Deltoid (Middle)', 
      'Posterior Deltoid (Rear)',
    ],
  },
  {
    name: 'Arms',
    defaultColor: '#7c3aed',
    muscles: [
      'Biceps Brachii (Long Head)',
      'Biceps Brachii (Short Head)',
      'Brachialis',
      'Triceps Brachii (Long Head)',
      'Triceps Brachii (Lateral Head)',
      'Tricep Brachii (Medial Head)',
    ],
  },
  //Seperated arms from forearms for better color coordination
  {
    name: 'Forearms',
    defaultColor: '#96056a',
    muscles: [
      'Brachioradialis',
      'Forearm Extensors',
      'Forearm Flexors',
    ]
  },
  {
    name: 'Legs',
    defaultColor: '#059669',
    muscles: [
      'Quadriceps', 
      'Hamstrings', 
      'Gluteus Maximus',
      'Gluteus Medius',
      'Gluteus Minimus', 
      'Calves (Lateral & Medial Head)',
      'Adductors',
    ],
  },
  /*For glutes, the medius and minimus are usually activated together, and those 2 
  can be activated seperatly from maximus and vice versa.
  Hip abductors hit glutes, hip adductors hit 3-4 adductor muscles on inner thigh */
  {
    name: 'Core',
    defaultColor: '#0891b2',
    muscles: [
      'Rectus Abdominis', 
      'External Obliques (Outer)', 
      'Internal Obliques (Inner)', 
      'Transversus Abdominis (TVA)',
    ],
  },
  /*TVA is deepest layer of the stomach, requires bracing and hollowing out 
  the stomach, so exercises like planks, deadbugs, stomach vacuums*/
]

// exercise name -> muscle names it maps to
const defaultExercises: Record<string, string[]> = {
  'Bench Press': [
    'Clavicular Head (Upper)',
    'Triceps Brachii (Long Head)',
    'Triceps Brachii (Lateral Head)',
    'Tricep Brachii (Medial Head)',
    'Anterior Deltoid (Front)',
  ],
  'Pull-Up': ['Latissimus Dorsi', 'Biceps Brachii (Long Head)'],
  'Barbell Squat': ['Quadriceps', 'Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus', 'Hamstrings'],
  'Deadlift': [
    'Hamstrings',
    'Gluteus Maximus',
    'Gluteus Medius',
    'Gluteus Minimus',
    'Upper Trapezius',
    'Middle Trapezius',
    'Lower Trapezius',
  ],
  'Overhead Press': [
    'Anterior Deltoid (Front)',
    'Lateral Deltoid (Middle)',
    'Triceps Brachii (Long Head)',
    'Triceps Brachii (Lateral Head)',
    'Tricep Brachii (Medial Head)',
  ],
  'Bicep Curl': ['Biceps Brachii (Long Head)', 'Biceps Brachii (Short Head)'],
  'Tricep Pushdown': ['Triceps Brachii (Long Head)', 'Triceps Brachii (Lateral Head)', 'Tricep Brachii (Medial Head)'],
  'Plank': ['Rectus Abdominis', 'External Obliques (Outer)', 'Internal Obliques (Inner)'],
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
