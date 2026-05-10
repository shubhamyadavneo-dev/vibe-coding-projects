const express = require('express')
const router = express.Router()
const validate = require('../middleware/validate')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validations/auth')
const {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
} = require('../controller/auth')

// Public routes
router.post('/register', validate(registerSchema), register)
router.get('/verify-email', verifyEmail)
router.post('/login', validate(loginSchema), login)
router.post('/logout', logout)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

module.exports = router
