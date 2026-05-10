const analyticsRepository = require('../repository/analytics')

const formatDate = (date) => new Date(date).toISOString().slice(0, 10)

const csvValue = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

const getStats = async (user_id) => {
  const logs = await analyticsRepository.findWorkoutLogs(user_id)
  const sets = logs.flatMap((log) => log.sets)
  const totalVolume = sets.reduce((sum, set) => sum + ((set.weight_kg || 0) * set.reps), 0)
  const exerciseIds = new Set(sets.map((set) => set.exercise_id))

  return {
    totalWorkouts: logs.filter((log) => log.completed).length,
    totalLogs: logs.length,
    totalSets: sets.length,
    totalExercises: exerciseIds.size,
    totalVolume
  }
}

const getConsistency = async (user_id) => {
  const days = await analyticsRepository.findPlanDays(user_id)
  const completedDays = days.filter((day) => day.workoutLog && day.workoutLog.completed)
  let currentStreak = 0
  let bestStreak = 0

  for (const day of days) {
    if (day.workoutLog && day.workoutLog.completed) {
      currentStreak += 1
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return {
    totalPlanDays: days.length,
    completedDays: completedDays.length,
    completionRate: days.length ? Math.round((completedDays.length / days.length) * 100) : 0,
    currentStreak,
    bestStreak
  }
}

const getStrength = async (user_id, exerciseId) => {
  const sets = await analyticsRepository.findStrengthSets(user_id, Number(exerciseId))
  return sets.map((set) => ({
    date: formatDate(set.workout_log.user_plan_day.scheduled_date),
    exercise_id: set.exercise_id,
    exercise_name: set.exercise.name,
    weight_kg: set.weight_kg,
    reps: set.reps
  }))
}

const getCalendar = async (user_id) => {
  const days = await analyticsRepository.findPlanDays(user_id)
  return days.map((day) => ({
    id: day.id,
    date: formatDate(day.scheduled_date),
    day_of_week: day.day_of_week,
    label: day.label,
    completed: Boolean(day.workoutLog && day.workoutLog.completed),
    log_id: day.workoutLog ? day.workoutLog.id : null
  }))
}

const exportCsv = async (user_id) => {
  const logs = await analyticsRepository.findWorkoutLogs(user_id)
  const rows = [['date', 'exercise name', 'sets', 'reps', 'weight_kg']]

  for (const log of logs) {
    for (const set of log.sets) {
      rows.push([
        formatDate(log.user_plan_day.scheduled_date),
        set.exercise.name,
        set.set_number,
        set.reps,
        set.weight_kg
      ])
    }
  }

  return rows.map((row) => row.map(csvValue).join(',')).join('\n')
}

module.exports = {
  getStats,
  getConsistency,
  getStrength,
  getCalendar,
  exportCsv
}
