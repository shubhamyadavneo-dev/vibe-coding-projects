const request = require('supertest')
const app = require('../../app')

describe('Log routes auth protection', () => {
  test('POST /api/logs/:planDayId should return 401 without token', async () => {
    const res = await request(app).post('/api/logs/1').send({})

    expect(res.statusCode).toBe(401)
  })

  test('POST /api/logs/:planDayId/sets should return 401 without token', async () => {
    const res = await request(app).post('/api/logs/1/sets').send({})

    expect(res.statusCode).toBe(401)
  })
})
