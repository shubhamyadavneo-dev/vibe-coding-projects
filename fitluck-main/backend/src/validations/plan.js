const { z } = require('zod')

const createPlanSchema = z.object({
  goal: z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STAY_HEALTHY']),
  timeframe: z.enum(['THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR']),
  routine_type: z.enum(['ALTERNATE', 'DAILY', 'WEEKEND']),
  workout_type: z.enum(['UNI', 'DOUBLE', 'FULL_BODY']).optional(),
  start_date: z.string().optional()
})

module.exports = { createPlanSchema }
