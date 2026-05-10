const exerciseService = require('../service/exercise')

const getExercises = async (req, res) => {
  try {
    const exercises = await exerciseService.getExercises(req.query.muscle)
    res.status(200).json(exercises)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getExerciseById = async (req, res) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id)
    res.status(200).json(exercise)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getMuscles = async (req, res) => {
  try {
    const muscles = await exerciseService.getMuscles()
    res.status(200).json(muscles)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getExercises,
  getExerciseById,
  getMuscles
}
