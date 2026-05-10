const prisma = require('../../prisma/client')

const activePlanInclude = {
  planDays: {
    include: {
      exercises: {
        include: {
          exercise: { include: { muscle: true } }
        },
        orderBy: { order: 'asc' }
      },
      workoutLog: {
        include: {
          sets: {
            include: { exercise: true },
            orderBy: { set_number: 'asc' }
          }
        }
      }
    },
    orderBy: { scheduled_date: 'asc' }
  },
  plan_template: true
}

const findActivePlanByUserId = (user_id) => {
  return prisma.userPlan.findFirst({
    where: { user_id, is_active: true },
    include: activePlanInclude
  })
}

const findTemplate = ({ goal, routine_type, workout_type }) => {
  return prisma.planTemplate.findUnique({
    where: {
      goal_routine_type_workout_type: {
        goal,
        routine_type,
        workout_type
      }
    },
    include: {
      dayTemplates: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { day_number: 'asc' }
      }
    }
  })
}

const createPlan = (planData, days) => {
  return prisma.$transaction(async (tx) => {
    // Delete any existing plans for this user to avoid unique constraint violation
    // Delete in correct order due to foreign key constraints
    const existingPlans = await tx.userPlan.findMany({
      where: { user_id: planData.user_id },
      select: { id: true }
    })
    
    for (const plan of existingPlans) {
      // Get all plan days for this plan
      const planDays = await tx.userPlanDay.findMany({
        where: { user_plan_id: plan.id },
        select: { id: true }
      })
      
      for (const day of planDays) {
        // Delete workout logs and sets first
        const workoutLogs = await tx.workoutLog.findMany({
          where: { user_plan_day_id: day.id },
          select: { id: true }
        })
        
        for (const log of workoutLogs) {
          await tx.workoutSet.deleteMany({
            where: { workout_log_id: log.id }
          })
        }
        
        await tx.workoutLog.deleteMany({
          where: { user_plan_day_id: day.id }
        })
        
        // Delete exercises for this day
        await tx.userPlanDayExercise.deleteMany({
          where: { user_plan_day_id: day.id }
        })
      }
      
      // Delete plan days
      await tx.userPlanDay.deleteMany({
        where: { user_plan_id: plan.id }
      })
    }
    
    // Finally delete the UserPlan records
    await tx.userPlan.deleteMany({
      where: { user_id: planData.user_id }
    })

    const plan = await tx.userPlan.create({ data: planData })

    for (const day of days) {
      await tx.userPlanDay.create({
        data: {
          user_plan_id: plan.id,
          day_number: day.day_number,
          scheduled_date: day.scheduled_date,
          day_of_week: day.day_of_week,
          workout_type: day.workout_type,
          label: day.label,
          is_rest_day: false,
          exercises: {
            create: day.exercises.map((exercise) => ({
              exercise_id: exercise.exercise_id,
              recommended_sets: exercise.recommended_sets,
              recommended_reps: exercise.recommended_reps,
              order: exercise.order
            }))
          }
        }
      })
    }

    return tx.userPlan.findUnique({
      where: { id: plan.id },
      include: activePlanInclude
    })
  })
}

const killActivePlan = (id) => {
  return prisma.userPlan.update({
    where: { id },
    data: {
      is_active: false,
      killed_at: new Date()
    }
  })
}

const findTodayPlanDay = (user_id, start, end) => {
  return prisma.userPlanDay.findFirst({
    where: {
      scheduled_date: { gte: start, lt: end },
      user_plan: { user_id, is_active: true }
    },
    include: {
      exercises: {
        include: { exercise: { include: { muscle: true } } },
        orderBy: { order: 'asc' }
      },
      workoutLog: {
        include: {
          sets: {
            include: { exercise: true },
            orderBy: { set_number: 'asc' }
          }
        }
      }
    }
  })
}

const findPlanDays = (user_id) => {
  return prisma.userPlanDay.findMany({
    where: { user_plan: { user_id, is_active: true } },
    include: {
      exercises: {
        include: { exercise: { include: { muscle: true } } },
        orderBy: { order: 'asc' }
      },
      workoutLog: true
    },
    orderBy: { scheduled_date: 'asc' }
  })
}

const findPlanDayById = (id, user_id) => {
  return prisma.userPlanDay.findFirst({
    where: { id, user_plan: { user_id } },
    include: {
      exercises: {
        include: { exercise: { include: { muscle: true } } },
        orderBy: { order: 'asc' }
      },
      workoutLog: {
        include: {
          sets: {
            include: { exercise: true },
            orderBy: { set_number: 'asc' }
          }
        }
      }
    }
  })
}

module.exports = {
  findActivePlanByUserId,
  findTemplate,
  createPlan,
  killActivePlan,
  findTodayPlanDay,
  findPlanDays,
  findPlanDayById
}
