const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getBadges } = require('../controller/badges')

router.get('/', protect, getBadges)

module.exports = router
