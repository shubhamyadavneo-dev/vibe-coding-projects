const { z } = require('zod')

const createWorkoutTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  exercises: z.array(
    z.object({
      name: z.string().min(1, 'Exercise name is required'),
      sets: z.number().int().positive('Sets must be greater than 0'),
      reps: z.number().int().positive('Reps must be greater than 0'),
    })
  ).min(1, 'At least one exercise is required'),
})

module.exports = {
  createWorkoutTemplateSchema,
}
