const request = require('supertest')
const app = require('../../app')
const exerciseRepository = require('../../repository/exercise')

jest.mock('../../repository/exercise')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/exercises', () => {
  test('should return exercises', async () => {
    exerciseRepository.findAllExercises.mockResolvedValue([{ id: 1, name: 'Bench Press' }])

    const res = await request(app).get('/api/exercises')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('GET /api/muscles', () => {
  test('should return muscles', async () => {
    exerciseRepository.findAllMuscles.mockResolvedValue([{ id: 1, group: 'CHEST' }])

    const res = await request(app).get('/api/muscles')

    expect(res.statusCode).toBe(200)
    expect(res.body[0].group).toBe('CHEST')
  })
})
