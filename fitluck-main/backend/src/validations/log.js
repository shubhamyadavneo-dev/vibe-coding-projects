const { z } = require('zod')

const createLogSchema = z.object({
  completed: z.boolean().optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().optional()
})

const updateLogSchema = createLogSchema.partial()

const createSetSchema = z.object({
  exercise_id: z.number().int().positive(),
  set_number: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight_kg: z.number().nonnegative().optional()
})

const updateSetSchema = createSetSchema.partial()

module.exports = {
  createLogSchema,
  updateLogSchema,
  createSetSchema,
  updateSetSchema
}
