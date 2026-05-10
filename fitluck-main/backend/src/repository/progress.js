const prisma = require('../../prisma/client')

const findWeights = (user_id) => {
  return prisma.bodyWeight.findMany({
    where: { user_id },
    orderBy: { logged_at: 'asc' }
  })
}

const createWeight = (data) => {
  return prisma.bodyWeight.create({ data })
}

const deleteWeight = (id, user_id) => {
  return prisma.bodyWeight.deleteMany({
    where: { id, user_id }
  })
}

const findMeasurements = (user_id) => {
  return prisma.bodyMeasurement.findMany({
    where: { user_id },
    orderBy: { logged_at: 'asc' }
  })
}

const createMeasurement = (data) => {
  return prisma.bodyMeasurement.create({ data })
}

const deleteMeasurement = (id, user_id) => {
  return prisma.bodyMeasurement.deleteMany({
    where: { id, user_id }
  })
}

const findRecords = (user_id) => {
  return prisma.personalRecord.findMany({
    where: { user_id },
    include: { exercise: { include: { muscle: true } } },
    orderBy: [{ exercise_id: 'asc' }, { weight_kg: 'desc' }]
  })
}

const findRecordsByExercise = (user_id, exercise_id) => {
  return prisma.personalRecord.findMany({
    where: { user_id, exercise_id },
    include: { exercise: { include: { muscle: true } } },
    orderBy: { weight_kg: 'desc' }
  })
}

module.exports = {
  findWeights,
  createWeight,
  deleteWeight,
  findMeasurements,
  createMeasurement,
  deleteMeasurement,
  findRecords,
  findRecordsByExercise
}
