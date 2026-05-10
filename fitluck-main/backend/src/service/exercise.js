const exerciseRepository = require('../repository/exercise')

const getExercises = async (muscle) => {
  return exerciseRepository.findAllExercises(muscle)
}

const getExerciseById = async (id) => {
  const exercise = await exerciseRepository.findExerciseById(Number(id))
  if (!exercise) throw new Error('Exercise not found')
  return exercise
}

const getMuscles = async () => {
  return exerciseRepository.findAllMuscles()
}

module.exports = {
  getExercises,
  getExerciseById,
  getMuscles
}
