const request = require('supertest')
const app = require('../../app')

describe('Plan routes auth protection', () => {
  test('POST /api/plan should return 401 without token', async () => {
    const res = await request(app).post('/api/plan').send({})

    expect(res.statusCode).toBe(401)
  })

  test('GET /api/plan should return 401 without token', async () => {
    const res = await request(app).get('/api/plan')

    expect(res.statusCode).toBe(401)
  })
})
