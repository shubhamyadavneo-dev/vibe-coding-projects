const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { createWorkoutTemplateSchema } = require('../validations/workoutTemplates')
const {
  getWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  shareWorkoutTemplate,
  getSharedWorkoutTemplate
} = require('../controller/workoutTemplates')

// Public route first to avoid /:id conflicting
router.get('/shared/:id', getSharedWorkoutTemplate)

router.get('/', protect, getWorkoutTemplates)
router.post('/', protect, validate(createWorkoutTemplateSchema), createWorkoutTemplate)
router.post('/:id/share', protect, shareWorkoutTemplate)
router.delete('/:id', protect, deleteWorkoutTemplate)

module.exports = router
