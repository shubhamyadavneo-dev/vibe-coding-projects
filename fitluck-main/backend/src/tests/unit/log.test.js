const logService = require('../../service/log')
const logRepository = require('../../repository/log')

jest.mock('../../repository/log')

beforeEach(() => {
  jest.clearAllMocks()
})

const today = new Date()
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

describe('logService.createLog', () => {
  test('should block logging non-today plan days', async () => {
    logRepository.findPlanDayForUser.mockResolvedValue({ id: 1, scheduled_date: yesterday })

    await expect(logService.createLog(1, 1, {})).rejects.toThrow('Workout can only be logged for today')
  })

  test('should block duplicate logs', async () => {
    logRepository.findPlanDayForUser.mockResolvedValue({ id: 1, scheduled_date: today })
    logRepository.findLogByPlanDayId.mockResolvedValue({ id: 1 })

    await expect(logService.createLog(1, 1, {})).rejects.toThrow('Workout log already exists')
  })

  test('should create log for today', async () => {
    logRepository.findPlanDayForUser.mockResolvedValue({ id: 1, scheduled_date: today })
    logRepository.findLogByPlanDayId.mockResolvedValue(null)
    logRepository.createLog.mockResolvedValue({ id: 1, completed: false })

    const result = await logService.createLog(1, 1, {})

    expect(result.id).toBe(1)
  })
})

describe('logService.addSet', () => {
  test('should update personal record when set is heavier', async () => {
    logRepository.findPlanDayForUser.mockResolvedValue({ id: 1, scheduled_date: today })
    logRepository.findLogByPlanDayId.mockResolvedValue({ id: 1 })
    logRepository.createSet.mockResolvedValue({ id: 1, exercise_id: 2, reps: 5, weight_kg: 100 })
    logRepository.findPersonalRecord.mockResolvedValue({ id: 1, weight_kg: 90 })
    logRepository.upsertPersonalRecord.mockResolvedValue({})

    await logService.addSet(1, 1, { exercise_id: 2, set_number: 1, reps: 5, weight_kg: 100 })

    expect(logRepository.upsertPersonalRecord).toHaveBeenCalled()
  })
})
