const prisma = require('../../prisma/client')

const findByUserId = (user_id) => {
  return prisma.progressPhoto.findMany({
    where: { user_id },
    orderBy: { date: 'desc' }
  })
}

const findById = (id, user_id) => {
  return prisma.progressPhoto.findFirst({
    where: { id, user_id }
  })
}

const create = (data) => {
  return prisma.progressPhoto.create({
    data
  })
}

const deleteById = (id, user_id) => {
  return prisma.progressPhoto.deleteMany({
    where: { id, user_id }
  })
}

module.exports = {
  findByUserId,
  findById,
  create,
  deleteById
}
