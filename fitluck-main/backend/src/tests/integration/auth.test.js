/** 
 * 
 * test.todo('POST /api/auth/register - should register a new user')
 * test.todo('POST /api/auth/login - should login a user')
 * test.todo('POST /api/auth/logout - should logout a user')
 * test.todo('POST /api/auth/forgot-password - should send reset email')
 * test.todo('POST /api/auth/reset-password - should reset password')
 * test.todo('GET /api/auth/verify-email - should verify email')
 * 
*/

const { execSync } = require('child_process')
const request = require('supertest')

jest.mock('../../nodemailer/transporter', () => ({
  sendMail: jest.fn().mockResolvedValue({})
}))

const app = require('../../app')
const prisma = require('../../../prisma/client')

// Run migrations once before all integration tests
beforeAll(() => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env })
})

// Clean DB before each test
beforeEach(async () => {
  await prisma.emailVerificationToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
})

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect()
})


// ─── REGISTER ────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    expect(response.status).toBe(201)
    expect(response.body.message).toBe('Registration successful! Please verify your email.')
  })

  test('should fail if email already in use', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    // Try to register again with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Email already in use')
  })

  test('should fail if email is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'notanemail',
        password: '123456'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0].field).toBe('email')
  })

  test('should fail if password is too short', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0].field).toBe('password')
  })

  test('should fail if name is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'john@gmail.com',
        password: '123456'
      })

    expect(response.status).toBe(400)
    expect(response.body.errors[0].field).toBe('name')
  })

})

// ─── VERIFY EMAIL ─────────────────────────────────────────
describe('GET /api/auth/verify-email', () => {

  test('should verify email with valid token', async () => {
    // Register user first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    // Get token from DB
    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { user: { email: 'john@gmail.com' } }
    })

    const response = await request(app)
      .get(`/api/auth/verify-email?token=${tokenRecord.token}`)

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Email verified successfully! You can now login.')
  })

  test('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email?token=invalidtoken')

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid verification token')
  })

})

// ─── LOGIN ────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  // Helper to register and verify user
  const registerAndVerify = async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { user: { email: 'john@gmail.com' } }
    })

    await request(app)
      .get(`/api/auth/verify-email?token=${tokenRecord.token}`)
  }

  test('should login successfully with valid credentials', async () => {
    await registerAndVerify()

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@gmail.com',
        password: '123456'
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body.user.email).toBe('john@gmail.com')
  })

  test('should fail if email not verified', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456'
      })

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@gmail.com',
        password: '123456'
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Please verify your email before logging in')
  })

  test('should fail with wrong password', async () => {
    await registerAndVerify()

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@gmail.com',
        password: 'wrongpassword'
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid email or password')
  })

})

// ─── LOGOUT ───────────────────────────────────────────────
describe('POST /api/auth/logout', () => {

  test('should logout successfully', async () => {
    // Register, verify and login
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'John Doe', email: 'john@gmail.com', password: '123456' })

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { user: { email: 'john@gmail.com' } }
    })
    await request(app).get(`/api/auth/verify-email?token=${tokenRecord.token}`)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@gmail.com', password: '123456' })

    const { refreshToken } = loginResponse.body

    // Now logout
    const response = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Logged out successfully')
  })

  test('should fail with invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: 'invalidtoken' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid refresh token')
  })

})

// ─── FORGOT PASSWORD ──────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {

  test('should always return same message', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'unknown@gmail.com' })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('If that email exists, a reset link has been sent.')
  })

})

// ─── RESET PASSWORD ───────────────────────────────────────
describe('POST /api/auth/reset-password', () => {

  test('should reset password with valid token', async () => {
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'John Doe', email: 'john@gmail.com', password: '123456' })

    // Verify email
    const verifyToken = await prisma.emailVerificationToken.findFirst({
      where: { user: { email: 'john@gmail.com' } }
    })
    await request(app).get(`/api/auth/verify-email?token=${verifyToken.token}`)

    // Request password reset
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@gmail.com' })

    // Get reset token from DB
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { user: { email: 'john@gmail.com' } }
    })

    // Reset password
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken.token,
        password: 'newpassword123'
      })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Password reset successfully! You can now login.')
  })

  test('should fail with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalidtoken',
        password: 'newpassword123'
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid reset token')
  })

})
