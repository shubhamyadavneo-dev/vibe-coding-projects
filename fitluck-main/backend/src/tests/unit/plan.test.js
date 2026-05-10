const planService = require('../../service/plan')
const planRepository = require('../../repository/plan')

jest.mock('../../repository/plan')

beforeEach(() => {
  jest.clearAllMocks()
})

const template = {
  id: 1,
  dayTemplates: [
    {
      workout_type: 'FULL_BODY',
      label: 'Day 1',
      exercises: [{ exercise_id: 1, recommended_sets: 3, recommended_reps: 12, order: 1 }]
    }
  ]
}

describe('planService.createPlan', () => {
  test('should block creation when active plan exists', async () => {
    planRepository.findActivePlanByUserId.mockResolvedValue({ id: 1 })

    await expect(planService.createPlan(1, {
      goal: 'WEIGHT_LOSS',
      timeframe: 'THREE_MONTHS',
      routine_type: 'ALTERNATE'
    })).rejects.toThrow('Active plan already exists')
  })

  test('should throw if template is missing', async () => {
    planRepository.findActivePlanByUserId.mockResolvedValue(null)
    planRepository.findTemplate.mockResolvedValue(null)

    await expect(planService.createPlan(1, {
      goal: 'WEIGHT_LOSS',
      timeframe: 'THREE_MONTHS',
      routine_type: 'ALTERNATE'
    })).rejects.toThrow('Plan template not found')
  })

  test('should create plan with generated days', async () => {
    planRepository.findActivePlanByUserId.mockResolvedValue(null)
    planRepository.findTemplate.mockResolvedValue(template)
    planRepository.createPlan.mockResolvedValue({ id: 1, planDays: [{ id: 1 }] })

    const result = await planService.createPlan(1, {
      goal: 'WEIGHT_LOSS',
      timeframe: 'THREE_MONTHS',
      routine_type: 'ALTERNATE',
      start_date: '2026-05-04'
    })

    expect(planRepository.createPlan).toHaveBeenCalled()
    expect(result.planDays).toHaveLength(1)
  })
})

describe('planService.killActivePlan', () => {
  test('should throw when no active plan exists', async () => {
    planRepository.findActivePlanByUserId.mockResolvedValue(null)

    await expect(planService.killActivePlan(1)).rejects.toThrow('Active plan not found')
  })
})
