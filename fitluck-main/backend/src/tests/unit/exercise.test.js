const exerciseService = require('../../service/exercise')
const exerciseRepository = require('../../repository/exercise')

jest.mock('../../repository/exercise')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('exerciseService.getExercises', () => {
  test('should return exercises', async () => {
    exerciseRepository.findAllExercises.mockResolvedValue([{ id: 1, name: 'Bench Press' }])

    const result = await exerciseService.getExercises('CHEST')

    expect(exerciseRepository.findAllExercises).toHaveBeenCalledWith('CHEST')
    expect(result).toHaveLength(1)
  })
})

describe('exerciseService.getExerciseById', () => {
  test('should throw if exercise is not found', async () => {
    exerciseRepository.findExerciseById.mockResolvedValue(null)

    await expect(exerciseService.getExerciseById(99)).rejects.toThrow('Exercise not found')
  })
})

describe('exerciseService.getMuscles', () => {
  test('should return muscles', async () => {
    exerciseRepository.findAllMuscles.mockResolvedValue([{ id: 1, group: 'CHEST' }])

    const result = await exerciseService.getMuscles()

    expect(result[0].group).toBe('CHEST')
  })
})
