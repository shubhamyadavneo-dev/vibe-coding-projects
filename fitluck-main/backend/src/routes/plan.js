const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { createPlanSchema } = require('../validations/plan')
const {
  createPlan,
  getActivePlan,
  killActivePlan,
  getTodayPlanDay,
  getPlanDays,
  getPlanDayById
} = require('../controller/plan')

router.post('/', protect, validate(createPlanSchema), createPlan)
router.get('/', protect, getActivePlan)
router.delete('/', protect, killActivePlan)
router.get('/today', protect, getTodayPlanDay)
router.get('/days', protect, getPlanDays)
router.get('/days/:id', protect, getPlanDayById)

module.exports = router
