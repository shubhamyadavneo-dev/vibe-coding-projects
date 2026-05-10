const progressService = require('../../service/progress')
const progressRepository = require('../../repository/progress')

jest.mock('../../repository/progress')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('progressService.logWeight', () => {
  test('should create a body weight entry', async () => {
    progressRepository.createWeight.mockResolvedValue({ id: 1, weight_kg: 72 })

    const result = await progressService.logWeight(1, { weight_kg: 72 })

    expect(progressRepository.createWeight).toHaveBeenCalledWith({ user_id: 1, weight_kg: 72, logged_at: undefined })
    expect(result.weight_kg).toBe(72)
  })
})

describe('progressService.deleteWeight', () => {
  test('should throw if entry is missing', async () => {
    progressRepository.deleteWeight.mockResolvedValue({ count: 0 })

    await expect(progressService.deleteWeight(1, 99)).rejects.toThrow('Weight entry not found')
  })
})

describe('progressService.getRecordsByExercise', () => {
  test('should throw if no record exists', async () => {
    progressRepository.findRecordsByExercise.mockResolvedValue([])

    await expect(progressService.getRecordsByExercise(1, 2)).rejects.toThrow('Personal record not found')
  })
})
