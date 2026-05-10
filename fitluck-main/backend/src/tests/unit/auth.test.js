const authService = require('../../service/auth')
const authRepository = require('../../repository/auth')
const transporter = require('../../nodemailer/transporter')
const bcrypt = require('bcryptjs')

// Mock all external dependencies
jest.mock('../../repository/auth')
jest.mock('../../nodemailer/transporter')
jest.mock('bcryptjs')

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// ─── REGISTER ────────────────────────────────────────────
describe('authService.register', () => {

  const validUser = {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: '123456'
  }

  test('should throw error if email already in use', async () => {
    authRepository.findUserByEmail.mockResolvedValue({ id: 1, email: 'john@gmail.com' })

    await expect(authService.register(validUser))
      .rejects
      .toThrow('Email already in use')
  })

  test('should create user if email is not taken', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null)
    authRepository.createUser.mockResolvedValue({ id: 1, ...validUser })
    authRepository.createEmailVerificationToken.mockResolvedValue({})
    bcrypt.hash.mockResolvedValue('hashed_password')
    transporter.sendMail.mockResolvedValue({})

    const result = await authService.register(validUser)

    expect(authRepository.createUser).toHaveBeenCalledTimes(1)
    expect(result.message).toBe('Registration successful! Please verify your email.')
  })

  test('should hash password before saving', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null)
    authRepository.createUser.mockResolvedValue({ id: 1, ...validUser })
    authRepository.createEmailVerificationToken.mockResolvedValue({})
    bcrypt.hash.mockResolvedValue('hashed_password')
    transporter.sendMail.mockResolvedValue({})

    await authService.register(validUser)

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
  })

  test('should send verification email after registration', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null)
    authRepository.createUser.mockResolvedValue({ id: 1, ...validUser })
    authRepository.createEmailVerificationToken.mockResolvedValue({})
    bcrypt.hash.mockResolvedValue('hashed_password')
    transporter.sendMail.mockResolvedValue({})

    await authService.register(validUser)

    expect(transporter.sendMail).toHaveBeenCalledTimes(1)
  })

})

// ─── LOGIN ────────────────────────────────────────────────
describe('authService.login', () => {

  const validLogin = {
    email: 'john@gmail.com',
    password: '123456'
  }

  test('should throw error if user not found', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null)

    await expect(authService.login(validLogin))
      .rejects
      .toThrow('Invalid email or password')
  })

  test('should throw error if user is not verified', async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'john@gmail.com',
      is_verified: false
    })

    await expect(authService.login(validLogin))
      .rejects
      .toThrow('Please verify your email before logging in')
  })

  test('should throw error if password is wrong', async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'john@gmail.com',
      is_verified: true,
      password_hash: 'hashed_password'
    })
    bcrypt.compare.mockResolvedValue(false)

    await expect(authService.login(validLogin))
      .rejects
      .toThrow('Invalid email or password')
  })

  test('should return tokens on successful login', async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@gmail.com',
      is_verified: true,
      password_hash: 'hashed_password'
    })
    bcrypt.compare.mockResolvedValue(true)
    authRepository.createRefreshToken.mockResolvedValue({})

    const result = await authService.login(validLogin)

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(result).toHaveProperty('user')
  })

})

// ─── LOGOUT ───────────────────────────────────────────────
describe('authService.logout', () => {

  test('should throw error if refresh token not found', async () => {
    authRepository.findRefreshToken.mockResolvedValue(null)

    await expect(authService.logout('invalid_token'))
      .rejects
      .toThrow('Invalid refresh token')
  })

  test('should revoke refresh token on logout', async () => {
    authRepository.findRefreshToken.mockResolvedValue({ id: 1, token: 'valid_token' })
    authRepository.revokeRefreshToken.mockResolvedValue({})

    const result = await authService.logout('valid_token')

    expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith(1)
    expect(result.message).toBe('Logged out successfully')
  })

})

// ─── FORGOT PASSWORD ──────────────────────────────────────
describe('authService.forgotPassword', () => {

  test('should always return same message whether email exists or not', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null)

    const result = await authService.forgotPassword('unknown@gmail.com')

    expect(result.message).toBe('If that email exists, a reset link has been sent.')
  })

  test('should send reset email if user exists', async () => {
    authRepository.findUserByEmail.mockResolvedValue({ id: 1, email: 'john@gmail.com' })
    authRepository.createPasswordResetToken.mockResolvedValue({})
    transporter.sendMail.mockResolvedValue({})

    await authService.forgotPassword('john@gmail.com')

    expect(transporter.sendMail).toHaveBeenCalledTimes(1)
  })

})

// ─── RESET PASSWORD ───────────────────────────────────────
describe('authService.resetPassword', () => {

  test('should throw error if token is invalid', async () => {
    authRepository.findPasswordResetToken.mockResolvedValue(null)

    await expect(authService.resetPassword({
      token: 'invalid_token',
      password: 'newpassword'
    })).rejects.toThrow('Invalid reset token')
  })

  test('should throw error if token is expired', async () => {
    authRepository.findPasswordResetToken.mockResolvedValue({
      id: 1,
      token: 'valid_token',
      expires_at: new Date(Date.now() - 1000), // expired
      used_at: null
    })

    await expect(authService.resetPassword({
      token: 'valid_token',
      password: 'newpassword'
    })).rejects.toThrow('Reset token has expired')
  })

  test('should throw error if token already used', async () => {
    authRepository.findPasswordResetToken.mockResolvedValue({
      id: 1,
      token: 'valid_token',
      expires_at: new Date(Date.now() + 1000),
      used_at: new Date() // already used
    })

    await expect(authService.resetPassword({
      token: 'valid_token',
      password: 'newpassword'
    })).rejects.toThrow('Reset token has already been used')
  })

  test('should update password if token is valid', async () => {
    authRepository.findPasswordResetToken.mockResolvedValue({
      id: 1,
      user_id: 1,
      token: 'valid_token',
      expires_at: new Date(Date.now() + 1000),
      used_at: null
    })
    bcrypt.hash.mockResolvedValue('new_hashed_password')
    authRepository.updateUserPassword.mockResolvedValue({})
    authRepository.markPasswordResetTokenUsed.mockResolvedValue({})

    const result = await authService.resetPassword({
      token: 'valid_token',
      password: 'newpassword'
    })

    expect(authRepository.updateUserPassword).toHaveBeenCalledWith(1, 'new_hashed_password')
    expect(result.message).toBe('Password reset successfully! You can now login.')
  })

})