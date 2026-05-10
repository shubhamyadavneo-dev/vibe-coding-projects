const prisma = require('../../prisma/client')

const findByUserId = (user_id) => {
  return prisma.profile.findUnique({ where: { user_id } })
}

const createProfile = (data) => {
  return prisma.profile.create({ data })
}

const updateProfile = (user_id, data) => {
  return prisma.profile.update({
    where: { user_id },
    data
  })
}

module.exports = {
  findByUserId,
  createProfile,
  updateProfile
}