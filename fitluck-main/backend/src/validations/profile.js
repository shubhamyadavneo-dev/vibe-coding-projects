const { z } = require('zod')

const createProfileSchema = z.object({
  avatar_url:    z.string().url().optional(),
  date_of_birth: z.string().optional(),
  gender:        z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  height_cm:     z.number().positive().optional(),
  weight_kg:     z.number().positive().optional(),
})

const updateProfileSchema = createProfileSchema.partial()

module.exports = { createProfileSchema, updateProfileSchema }