const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { createWorkoutTemplateSchema } = require('../validations/workoutTemplates')
const {
  getWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
} = require('../controller/workoutTemplates')

router.get('/', protect, getWorkoutTemplates)
router.post('/', protect, validate(createWorkoutTemplateSchema), createWorkoutTemplate)
router.delete('/:id', protect, deleteWorkoutTemplate)

module.exports = router
