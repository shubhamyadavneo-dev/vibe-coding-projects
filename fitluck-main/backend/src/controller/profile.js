const profileService = require('../service/profile')

const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.user.id)
    res.status(200).json(profile)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const createProfile = async (req, res) => {
  try {
    const profile = await profileService.createProfile(req.user.id, req.body)
    res.status(201).json(profile)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body)
    res.status(200).json(profile)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getProfile, createProfile, updateProfile }
