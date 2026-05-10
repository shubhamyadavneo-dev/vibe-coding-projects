const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Access token - expires in 15 minutes
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

// Refresh token - expires in 7 days
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

// Random token for email verification and password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
}