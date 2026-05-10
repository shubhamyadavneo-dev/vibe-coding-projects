const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { createProfileSchema, updateProfileSchema } = require('../validations/profile')
const { getProfile, createProfile, updateProfile } = require('../controller/profile')

router.get('/',    protect, getProfile)
router.post('/',   protect, validate(createProfileSchema), createProfile)
router.patch('/',  protect, validate(updateProfileSchema), updateProfile)

module.exports = router