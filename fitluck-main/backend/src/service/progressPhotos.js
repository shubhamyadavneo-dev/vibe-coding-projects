const progressPhotosRepository = require('../repository/progressPhotos')

const getPhotos = async (user_id) => {
    console.log("Backend called ::", user_id);
    
  return progressPhotosRepository.findByUserId(user_id)
}

const uploadPhoto = async (user_id, data) => {
  if (!data.imageData) throw new Error('Image is required')
  if (!data.date) throw new Error('Date is required')
    console.log({data});
    
  // Validate image size (max 5MB)
  const imageSizeInBytes = Buffer.byteLength(data.imageData, 'utf8')
  const maxSizeInBytes = 5 * 1024 * 1024
  if (imageSizeInBytes > maxSizeInBytes) throw new Error('Image size must be less than 5MB')

  // Validate base64 format
  if (!data.imageData.startsWith('data:image/')) throw new Error('Invalid image format')

  return progressPhotosRepository.create({
    user_id,
    imageData: data.imageData,
    note: data.note || null,
    date: new Date(data.date)
  })
}

const deletePhoto = async (user_id, photoId) => {
  const photo = await progressPhotosRepository.findById(photoId, user_id)
  if (!photo) throw new Error('Photo not found')

  await progressPhotosRepository.deleteById(photoId, user_id)
  return { message: 'Photo deleted successfully' }
}

module.exports = {
  getPhotos,
  uploadPhoto,
  deletePhoto
}
