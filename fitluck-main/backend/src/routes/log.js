const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const {
  createLogSchema,
  updateLogSchema,
  createSetSchema,
  updateSetSchema
} = require('../validations/log')
const {
  createLog,
  updateLog,
  getLog,
  addSet,
  updateSet,
  deleteSet
} = require('../controller/log')

router.post('/:planDayId', protect, validate(createLogSchema), createLog)
router.patch('/:planDayId', protect, validate(updateLogSchema), updateLog)
router.get('/:planDayId', protect, getLog)
router.post('/:planDayId/sets', protect, validate(createSetSchema), addSet)
router.patch('/:planDayId/sets/:setId', protect, validate(updateSetSchema), updateSet)
router.delete('/:planDayId/sets/:setId', protect, deleteSet)

module.exports = router
