const bcrypt = require('bcryptjs')
const authRepository = require('../repository/auth')
const transporter = require('../nodemailer/transporter')
const {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken
} = require('../utils/tokens')

// ─── REGISTER ────────────────────────────────────────────
const register = async ({ name, email, password }) => {
  // 1. Check if email already exists
  const existing = await authRepository.findUserByEmail(email)
  if (existing) {
    throw new Error('Email already in use')
  }

  // 2. Hash password
  const password_hash = await bcrypt.hash(password, 10)

  // 3. Create user
  const user = await authRepository.createUser({
    name,
    email,
    password_hash
  })

  // 4. Generate verification token
  const token = generateRandomToken()
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await authRepository.createEmailVerificationToken({
    token,
    user_id: user.id,
    expires_at
  })

  // 5. Send verification email
  const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`

  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Verify your email - Fitness Tracker',
  //   html: `
  //     <h2>Welcome to Fitness Tracker, ${name}!</h2>
  //     <p>Click the link below to verify your email:</p>
  //     <a href="${verificationUrl}">Verify Email</a>
  //     <p>This link expires in 24 hours.</p>
  //   `
  // })

  return { message: 'Registration successful! Please verify your email.', verificationUrl }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────
const verifyEmail = async (token) => {
  // 1. Find token
  const record = await authRepository.findEmailVerificationToken(token)
  if (!record) {
    throw new Error('Invalid verification token')
  }

  // 2. Check expiry
  if (record.expires_at < new Date()) {
    throw new Error('Verification token has expired')
  }

  // 3. Mark user as verified
  await authRepository.markUserVerified(record.user_id)

  // 4. Delete token
  await authRepository.deleteEmailVerificationToken(record.id)

  return { message: 'Email verified successfully! You can now login.' }
}

// ─── LOGIN ────────────────────────────────────────────────
const login = async ({ email, password }) => {
  // 1. Find user
  const user = await authRepository.findUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // 2. Check if verified
  if (!user.is_verified) {
    throw new Error('Please verify your email before logging in')
  }

  // 3. Check password
  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw new Error('Invalid email or password')
  }

  // 4. Generate tokens
  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // 5. Store refresh token in DB
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await authRepository.createRefreshToken({
    token: refreshToken,
    user_id: user.id,
    expires_at
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}

// ─── LOGOUT ───────────────────────────────────────────────
const logout = async (token) => {
  // Find and revoke refresh token
  const record = await authRepository.findRefreshToken(token)
  if (!record) {
    throw new Error('Invalid refresh token')
  }

  await authRepository.revokeRefreshToken(record.id)

  return { message: 'Logged out successfully' }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────
const forgotPassword = async (email) => {
  // 1. Find user (don't reveal if email exists or not)
  const user = await authRepository.findUserByEmail(email)

  if (user) {
    // 2. Generate reset token
    const token = generateRandomToken()
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await authRepository.createPasswordResetToken({
      token,
      user_id: user.id,
      expires_at
    })

    // 3. Send reset email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password - Fitness Tracker',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `
    })
  }

  // Always return same message (security - don't reveal if email exists)
  return { message: 'If that email exists, a reset link has been sent.' }
}

// ─── RESET PASSWORD ───────────────────────────────────────
const resetPassword = async ({ token, password }) => {
  // 1. Find token
  const record = await authRepository.findPasswordResetToken(token)
  if (!record) {
    throw new Error('Invalid reset token')
  }

  // 2. Check expiry
  if (record.expires_at < new Date()) {
    throw new Error('Reset token has expired')
  }

  // 3. Check if already used
  if (record.used_at) {
    throw new Error('Reset token has already been used')
  }

  // 4. Hash new password
  const password_hash = await bcrypt.hash(password, 10)

  // 5. Update password
  await authRepository.updateUserPassword(record.user_id, password_hash)

  // 6. Mark token as used
  await authRepository.markPasswordResetTokenUsed(record.id)

  return { message: 'Password reset successfully! You can now login.' }
}

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
}