const progressService = require('../service/progress')

const getWeights = async (req, res) => {
  try {
    const weights = await progressService.getWeights(req.user.id)
    res.status(200).json(weights)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const logWeight = async (req, res) => {
  try {
    const weight = await progressService.logWeight(req.user.id, req.body)
    res.status(201).json(weight)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteWeight = async (req, res) => {
  try {
    const result = await progressService.deleteWeight(req.user.id, req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getMeasurements = async (req, res) => {
  try {
    const measurements = await progressService.getMeasurements(req.user.id)
    res.status(200).json(measurements)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const logMeasurement = async (req, res) => {
  try {
    const measurement = await progressService.logMeasurement(req.user.id, req.body)
    res.status(201).json(measurement)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteMeasurement = async (req, res) => {
  try {
    const result = await progressService.deleteMeasurement(req.user.id, req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getRecords = async (req, res) => {
  try {
    const records = await progressService.getRecords(req.user.id)
    res.status(200).json(records)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getRecordsByExercise = async (req, res) => {
  try {
    const records = await progressService.getRecordsByExercise(req.user.id, req.params.exerciseId)
    res.status(200).json(records)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

module.exports = {
  getWeights,
  logWeight,
  deleteWeight,
  getMeasurements,
  logMeasurement,
  deleteMeasurement,
  getRecords,
  getRecordsByExercise
}
