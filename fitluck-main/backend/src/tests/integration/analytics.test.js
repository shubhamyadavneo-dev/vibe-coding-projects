const request = require('supertest')
const app = require('../../app')

describe('Analytics routes auth protection', () => {
  test('GET /api/analytics/stats should return 401 without token', async () => {
    const res = await request(app).get('/api/analytics/stats')

    expect(res.statusCode).toBe(401)
  })

  test('GET /api/analytics/export should return 401 without token', async () => {
    const res = await request(app).get('/api/analytics/export')

    expect(res.statusCode).toBe(401)
  })
})
