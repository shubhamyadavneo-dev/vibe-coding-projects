const progressPhotosService = require('../service/progressPhotos')

const getPhotos = async (req, res) => {
  try {
    const photos = await progressPhotosService.getPhotos(req.user.id)
    res.status(200).json(photos)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const uploadPhoto = async (req, res) => {
  try {
    const photo = await progressPhotosService.uploadPhoto(req.user.id, req.body)
    res.status(201).json(photo)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deletePhoto = async (req, res) => {
  try {
    const result = await progressPhotosService.deletePhoto(req.user.id, Number(req.params.id))
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getPhotos,
  uploadPhoto,
  deletePhoto
}
