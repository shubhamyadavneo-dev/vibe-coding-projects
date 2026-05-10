const logRepository = require('../repository/log')
const { startOfDay, addDays } = require('./plan')

const isToday = (date) => {
  const start = startOfDay(new Date())
  const end = addDays(start, 1)
  const value = new Date(date)
  return value >= start && value < end
}

const ensureTodayPlanDay = async (planDayId, user_id) => {
  const planDay = await logRepository.findPlanDayForUser(Number(planDayId), user_id)
  if (!planDay) throw new Error('Plan day not found')
  if (!isToday(planDay.scheduled_date)) throw new Error('Workout can only be logged for today')
  return planDay
}

const ensureLogForToday = async (planDayId, user_id) => {
  await ensureTodayPlanDay(planDayId, user_id)
  const log = await logRepository.findLogByPlanDayId(Number(planDayId), user_id)
  if (!log) throw new Error('Workout log not found')
  return log
}

const updatePersonalRecord = async (user_id, set) => {
  if (set.weight_kg === undefined || set.weight_kg === null) return

  const existing = await logRepository.findPersonalRecord(user_id, set.exercise_id)
  if (!existing || set.weight_kg > existing.weight_kg) {
    await logRepository.upsertPersonalRecord(existing, {
      user_id,
      exercise_id: set.exercise_id,
      weight_kg: set.weight_kg,
      reps: set.reps,
      achieved_at: new Date()
    })
  }
}

const createLog = async (user_id, planDayId, data) => {
  await ensureTodayPlanDay(planDayId, user_id)
  const existing = await logRepository.findLogByPlanDayId(Number(planDayId), user_id)
  if (existing) throw new Error('Workout log already exists')

  return logRepository.createLog({
    user_id,
    user_plan_day_id: Number(planDayId),
    completed: data.completed || false,
    duration_minutes: data.duration_minutes,
    notes: data.notes
  })
}

const updateLog = async (user_id, planDayId, data) => {
  const log = await ensureLogForToday(planDayId, user_id)
  return logRepository.updateLog(log.id, data)
}

const getLog = async (user_id, planDayId) => {
  const log = await logRepository.findLogByPlanDayId(Number(planDayId), user_id)
  if (!log) throw new Error('Workout log not found')
  return log
}

const addSet = async (user_id, planDayId, data) => {
  const log = await ensureLogForToday(planDayId, user_id)
  const set = await logRepository.createSet({
    workout_log_id: log.id,
    exercise_id: data.exercise_id,
    set_number: data.set_number,
    reps: data.reps,
    weight_kg: data.weight_kg
  })
  await updatePersonalRecord(user_id, set)
  return set
}

const updateSet = async (user_id, planDayId, setId, data) => {
  const log = await ensureLogForToday(planDayId, user_id)
  const existing = await logRepository.findSetById(Number(setId), log.id)
  if (!existing) throw new Error('Workout set not found')

  const set = await logRepository.updateSet(Number(setId), data)
  await updatePersonalRecord(user_id, set)
  return set
}

const deleteSet = async (user_id, planDayId, setId) => {
  const log = await ensureLogForToday(planDayId, user_id)
  const existing = await logRepository.findSetById(Number(setId), log.id)
  if (!existing) throw new Error('Workout set not found')

  await logRepository.deleteSet(Number(setId))
  return { message: 'Workout set deleted successfully' }
}

module.exports = {
  createLog,
  updateLog,
  getLog,
  addSet,
  updateSet,
  deleteSet,
  isToday
}
