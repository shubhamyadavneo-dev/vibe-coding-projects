const planRepository = require('../repository/plan')

const timeframeDays = {
  THREE_MONTHS: 90,
  SIX_MONTHS: 180,
  ONE_YEAR: 365
}

const jsDayToEnum = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const allowedDays = {
  ALTERNATE: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
  DAILY: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  WEEKEND: ['SATURDAY', 'SUNDAY']
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getRangeForToday = () => {
  const start = startOfDay(new Date())
  const end = addDays(start, 1)
  return { start, end }
}

const buildPlanDays = (template, routine_type, start_date, totalDays) => {
  const start = startOfDay(start_date)
  const dayTemplates = template.dayTemplates
  const days = []

  for (let offset = 0; offset < totalDays; offset++) {
    const scheduledDate = addDays(start, offset)
    const dayOfWeek = jsDayToEnum[scheduledDate.getDay()]

    if (!allowedDays[routine_type].includes(dayOfWeek)) continue

    const templateDay = dayTemplates[days.length % dayTemplates.length]
    days.push({
      day_number: days.length + 1,
      scheduled_date: scheduledDate,
      day_of_week: dayOfWeek,
      workout_type: templateDay.workout_type,
      label: templateDay.label,
      exercises: templateDay.exercises.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        recommended_sets: exercise.recommended_sets,
        recommended_reps: exercise.recommended_reps,
        order: exercise.order
      }))
    })
  }

  return days
}

const createPlan = async (user_id, data) => {
  const workout_type = data.workout_type || 'FULL_BODY'
  const template = await planRepository.findTemplate({
    goal: data.goal,
    routine_type: data.routine_type,
    workout_type
  })
  if (!template) throw new Error('Plan template not found')
  if (!template.dayTemplates.length) throw new Error('Plan template has no days')

  const startDate = data.start_date ? new Date(data.start_date) : new Date()
  const totalDays = timeframeDays[data.timeframe]
  const days = buildPlanDays(template, data.routine_type, startDate, totalDays)
  if (!days.length) throw new Error('No plan days generated')

  return planRepository.createPlan({
    user_id,
    plan_template_id: template.id,
    goal: data.goal,
    timeframe: data.timeframe,
    routine_type: data.routine_type,
    start_date: startOfDay(startDate),
    end_date: addDays(startOfDay(startDate), totalDays)
  }, days)
}

const getActivePlan = async (user_id) => {
  const plan = await planRepository.findActivePlanByUserId(user_id)
  if (!plan) throw new Error('Active plan not found')
  return plan
}

const killActivePlan = async (user_id) => {
  const plan = await planRepository.findActivePlanByUserId(user_id)
  if (!plan) throw new Error('Active plan not found')
  await planRepository.killActivePlan(plan.id)
  return { message: 'Plan killed successfully' }
}

const getTodayPlanDay = async (user_id) => {
  const { start, end } = getRangeForToday()
  const day = await planRepository.findTodayPlanDay(user_id, start, end)
  if (!day) throw new Error('No plan day found for today')
  return day
}

const getPlanDays = async (user_id) => {
  return planRepository.findPlanDays(user_id)
}

const getPlanDayById = async (user_id, id) => {
  const day = await planRepository.findPlanDayById(Number(id), user_id)
  if (!day) throw new Error('Plan day not found')
  return day
}

module.exports = {
  createPlan,
  getActivePlan,
  killActivePlan,
  getTodayPlanDay,
  getPlanDays,
  getPlanDayById,
  startOfDay,
  addDays
}
