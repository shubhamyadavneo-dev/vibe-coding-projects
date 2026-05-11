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

const update = (id, user_id, data) => {
  return prisma.workoutTemplate.update({
    where: { id },
    data,
  })
}

const deleteById = (id, user_id) => {
  return prisma.workoutTemplate.deleteMany({
    where: { id, user_id },
  })
}

const findPublicById = (id) => {
  return prisma.workoutTemplate.findFirst({
    where: { id, is_public: true },
    include: {
      user: {
        select: { name: true }
      }
    }
  })
}

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  deleteById,
  findPublicById
}
