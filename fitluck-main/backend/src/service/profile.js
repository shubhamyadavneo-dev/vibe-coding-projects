const profileRepository = require('../repository/profile')

const getProfile = async (user_id) => {
  const profile = await profileRepository.findByUserId(user_id)
  if (!profile) throw new Error('Profile not found')
  return profile
}

const createProfile = async (user_id, data) => {
  const existing = await profileRepository.findByUserId(user_id)
  if (existing) throw new Error('Profile already exists')

  const profile = await profileRepository.createProfile({
    ...data,
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    user_id
  })
  return profile
}

const updateProfile = async (user_id, data) => {
  const existing = await profileRepository.findByUserId(user_id)
  if (!existing) throw new Error('Profile not found')

  const profile = await profileRepository.updateProfile(user_id, {
    ...data,
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
  })
  return profile
}

module.exports = { getProfile, createProfile, updateProfile }
