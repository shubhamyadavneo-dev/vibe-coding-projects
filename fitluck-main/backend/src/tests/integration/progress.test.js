const request = require('supertest')
const app = require('../../app')

describe('Progress routes auth protection', () => {
  test('GET /api/progress/weight should return 401 without token', async () => {
    const res = await request(app).get('/api/progress/weight')

    expect(res.statusCode).toBe(401)
  })

  test('GET /api/progress/records should return 401 without token', async () => {
    const res = await request(app).get('/api/progress/records')

    expect(res.statusCode).toBe(401)
  })
})
