const prisma = require('../../prisma/client')

const findAllExercises = (muscle) => {
  return prisma.exercise.findMany({
    where: muscle ? { muscle: { group: muscle } } : undefined,
    include: { muscle: true },
    orderBy: { name: 'asc' }
  })
}

const findExerciseById = (id) => {
  return prisma.exercise.findUnique({
    where: { id },
    include: { muscle: true }
  })
}

const findAllMuscles = () => {
  return prisma.muscle.findMany({
    include: { exercises: true },
    orderBy: { id: 'asc' }
  })
}

module.exports = {
  findAllExercises,
  findExerciseById,
  findAllMuscles
}
