const prisma = require('../../prisma/client')

const findByUserId = (user_id) => {
  return prisma.workoutTemplate.findMany({
    where: { user_id },
    orderBy: { created_at: 'desc' },
  })
}

const findById = (id, user_id) => {
  return prisma.workoutTemplate.findFirst({
    where: { id, user_id },
  })
}

const create = (data) => {
  return prisma.workoutTemplate.create({
    data,
  })
}

const deleteById = (id, user_id) => {
  return prisma.workoutTemplate.deleteMany({
    where: { id, user_id },
  })
}

module.exports = {
  findByUserId,
  findById,
  create,
  deleteById,
}
