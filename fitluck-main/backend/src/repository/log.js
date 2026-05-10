const prisma = require('../../prisma/client')

const logInclude = {
  user_plan_day: true,
  sets: {
    include: { exercise: true },
    orderBy: { set_number: 'asc' }
  }
}

const findPlanDayForUser = (id, user_id) => {
  return prisma.userPlanDay.findFirst({
    where: { id, user_plan: { user_id, is_active: true } },
    include: {
      user_plan: true,
      workoutLog: { include: logInclude },
      exercises: true
    }
  })
}

const findLogByPlanDayId = (user_plan_day_id, user_id) => {
  return prisma.workoutLog.findFirst({
    where: { user_plan_day_id, user_id },
    include: logInclude
  })
}

const createLog = (data) => {
  return prisma.workoutLog.create({
    data,
    include: logInclude
  })
}

const updateLog = (id, data) => {
  return prisma.workoutLog.update({
    where: { id },
    data,
    include: logInclude
  })
}

const createSet = (data) => {
  return prisma.workoutSet.create({
    data,
    include: { exercise: true }
  })
}

const findSetById = (id, workout_log_id) => {
  return prisma.workoutSet.findFirst({
    where: { id, workout_log_id },
    include: { exercise: true, workout_log: { include: { user_plan_day: true } } }
  })
}

const updateSet = (id, data) => {
  return prisma.workoutSet.update({
    where: { id },
    data,
    include: { exercise: true }
  })
}

const deleteSet = (id) => {
  return prisma.workoutSet.delete({ where: { id } })
}

const findPersonalRecord = (user_id, exercise_id) => {
  return prisma.personalRecord.findFirst({
    where: { user_id, exercise_id },
    orderBy: { weight_kg: 'desc' }
  })
}

const upsertPersonalRecord = (record, data) => {
  if (record) {
    return prisma.personalRecord.update({
      where: { id: record.id },
      data
    })
  }

  return prisma.personalRecord.create({ data })
}

module.exports = {
  findPlanDayForUser,
  findLogByPlanDayId,
  createLog,
  updateLog,
  createSet,
  findSetById,
  updateSet,
  deleteSet,
  findPersonalRecord,
  upsertPersonalRecord
}
