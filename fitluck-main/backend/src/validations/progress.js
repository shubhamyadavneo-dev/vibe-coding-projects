const { z } = require('zod')

const weightSchema = z.object({
  weight_kg: z.number().positive(),
  logged_at: z.string().optional()
})

const measurementSchema = z.object({
  chest_cm: z.number().positive().optional(),
  waist_cm: z.number().positive().optional(),
  arms_cm: z.number().positive().optional(),
  thighs_cm: z.number().positive().optional(),
  calves_cm: z.number().positive().optional(),
  shoulders_cm: z.number().positive().optional(),
  logged_at: z.string().optional()
})

module.exports = {
  weightSchema,
  measurementSchema
}
