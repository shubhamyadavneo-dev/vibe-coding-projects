const prisma = require('../../prisma/client')

const findWorkoutLogs = (user_id) => {
  return prisma.workoutLog.findMany({
    where: { user_id },
    include: {
      user_plan_day: true,
      sets: {
        include: { exercise: true },
        orderBy: { set_number: 'asc' }
      }
    },
    orderBy: { logged_at: 'asc' }
  })
}

const findPlanDays = (user_id) => {
  return prisma.userPlanDay.findMany({
    where: { user_plan: { user_id } },
    include: { workoutLog: true },
    orderBy: { scheduled_date: 'asc' }
  })
}

const findStrengthSets = (user_id, exercise_id) => {
  return prisma.workoutSet.findMany({
    where: {
      exercise_id,
      workout_log: { user_id }
    },
    include: {
      workout_log: {
        include: { user_plan_day: true }
      },
      exercise: true
    },
    orderBy: { created_at: 'asc' }
  })
}

module.exports = {
  findWorkoutLogs,
  findPlanDays,
  findStrengthSets
}
