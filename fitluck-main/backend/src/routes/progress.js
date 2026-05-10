const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { weightSchema, measurementSchema } = require('../validations/progress')
const {
  getWeights,
  logWeight,
  deleteWeight,
  getMeasurements,
  logMeasurement,
  deleteMeasurement,
  getRecords,
  getRecordsByExercise
} = require('../controller/progress')

router.get('/weight', protect, getWeights)
router.post('/weight', protect, validate(weightSchema), logWeight)
router.delete('/weight/:id', protect, deleteWeight)
router.get('/measurements', protect, getMeasurements)
router.post('/measurements', protect, validate(measurementSchema), logMeasurement)
router.delete('/measurements/:id', protect, deleteMeasurement)
router.get('/records', protect, getRecords)
router.get('/records/:exerciseId', protect, getRecordsByExercise)

module.exports = router
