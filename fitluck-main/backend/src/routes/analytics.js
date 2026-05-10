const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getStats,
  getConsistency,
  getStrength,
  getCalendar,
  exportCsv
} = require('../controller/analytics')

router.get('/stats', protect, getStats)
router.get('/consistency', protect, getConsistency)
router.get('/strength/:exerciseId', protect, getStrength)
router.get('/calendar', protect, getCalendar)
router.get('/export', protect, exportCsv)

module.exports = router
