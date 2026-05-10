const request = require('supertest')

jest.mock('../../nodemailer/transporter', () => ({
  sendMail: jest.fn().mockResolvedValue({})
}))

const app = require('../../app')
const prisma = require('../../../prisma/client')

let accessToken

// Helper — register, verify and login to get token
const setupUser = async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'John Doe', email: 'john@gmail.com', password: '123456' })

  const tokenRecord = await prisma.emailVerificationToken.findFirst({
    where: { user: { email: 'john@gmail.com' } }
  })
  await request(app).get(`/api/auth/verify-email?token=${tokenRecord.token}`)

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'john@gmail.com', password: '123456' })

  accessToken = loginRes.body.accessToken
}

beforeEach(async () => {
  await prisma.profile.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await setupUser()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ─── GET PROFILE ──────────────────────────────────────────
describe('GET /api/profile', () => {

  test('should return profile if exists', async () => {
    // Create profile first
    await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ height_cm: 175, weight_kg: 70 })

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('height_cm', 175)
  })

  test('should return 404 if profile not found', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Profile not found')
  })

  test('should return 401 if no token', async () => {
    const response = await request(app)
      .get('/api/profile')

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('No token provided')
  })

})

// ─── CREATE PROFILE ───────────────────────────────────────
describe('POST /api/profile', () => {

  test('should create profile successfully', async () => {
    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        gender: 'MALE',
        height_cm: 175,
        weight_kg: 70,
        date_of_birth: '1995-01-15'
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('height_cm', 175)
    expect(response.body).toHaveProperty('gender', 'MALE')
  })

  test('should fail if profile already exists', async () => {
    await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ height_cm: 175, weight_kg: 70 })

    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ height_cm: 175, weight_kg: 70 })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Profile already exists')
  })

  test('should fail with invalid gender', async () => {
    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gender: 'INVALID' })

    expect(response.status).toBe(400)
  })

  test('should fail if no token', async () => {
    const response = await request(app)
      .post('/api/profile')
      .send({ height_cm: 175 })

    expect(response.status).toBe(401)
  })

})

// ─── UPDATE PROFILE ───────────────────────────────────────
describe('PATCH /api/profile', () => {

  test('should update profile successfully', async () => {
    await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ height_cm: 175, weight_kg: 70 })

    const response = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ weight_kg: 75 })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('weight_kg', 75)
  })

  test('should fail if profile does not exist', async () => {
    const response = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ weight_kg: 75 })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Profile not found')
  })

})
