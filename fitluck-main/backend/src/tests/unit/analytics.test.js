const analyticsService = require('../../service/analytics')
const analyticsRepository = require('../../repository/analytics')

jest.mock('../../repository/analytics')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('analyticsService.getStats', () => {
  test('should calculate workout stats', async () => {
    analyticsRepository.findWorkoutLogs.mockResolvedValue([
      {
        completed: true,
        sets: [
          { exercise_id: 1, reps: 10, weight_kg: 50 },
          { exercise_id: 1, reps: 8, weight_kg: 60 }
        ]
      }
    ])

    const result = await analyticsService.getStats(1)

    expect(result.totalWorkouts).toBe(1)
    expect(result.totalVolume).toBe(980)
  })
})

describe('analyticsService.getConsistency', () => {
  test('should calculate completion rate', async () => {
    analyticsRepository.findPlanDays.mockResolvedValue([
      { workoutLog: { completed: true } },
      { workoutLog: null }
    ])

    const result = await analyticsService.getConsistency(1)

    expect(result.completionRate).toBe(50)
  })
})

describe('analyticsService.exportCsv', () => {
  test('should export workout history as csv', async () => {
    analyticsRepository.findWorkoutLogs.mockResolvedValue([
      {
        user_plan_day: { scheduled_date: new Date('2026-05-01') },
        sets: [{ exercise: { name: 'Bench Press' }, set_number: 1, reps: 10, weight_kg: 50 }]
      }
    ])

    const csv = await analyticsService.exportCsv(1)

    expect(csv).toContain('date,exercise name,sets,reps,weight_kg')
    expect(csv).toContain('Bench Press')
  })
})
