const { z } = require('zod')

const muscleQuerySchema = z.object({
  muscle: z.enum([
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'FOREARMS',
    'QUADS',
    'HAMSTRINGS',
    'GLUTES',
    'CALVES',
    'ABS',
    'CARDIO'
  ]).optional()
})

module.exports = { muscleQuerySchema }
