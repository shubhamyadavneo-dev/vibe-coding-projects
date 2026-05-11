const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { uploadPhotoSchema } = require('../validations/progressPhotos')
const {
  getPhotos,
  uploadPhoto,
  deletePhoto
} = require('../controller/progressPhotos')

router.get('/', protect, getPhotos)
router.post('/', protect, validate(uploadPhotoSchema), uploadPhoto)
router.delete('/:id', protect, deletePhoto)

module.exports = router
