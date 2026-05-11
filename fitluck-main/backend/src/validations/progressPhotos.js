const { z } = require('zod')

const uploadPhotoSchema = z.object({
  imageData: z.string().startsWith('data:image/').min(1, 'Image is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z.string().nullable().optional()
})

module.exports = {
  uploadPhotoSchema
}
