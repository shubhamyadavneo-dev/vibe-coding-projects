const progressRepository = require('../repository/progress')

const getWeights = async (user_id) => {
  return progressRepository.findWeights(user_id)
}

const logWeight = async (user_id, data) => {
  return progressRepository.createWeight({
    user_id,
    weight_kg: data.weight_kg,
    logged_at: data.logged_at ? new Date(data.logged_at) : undefined
  })
}

const deleteWeight = async (user_id, id) => {
  const result = await progressRepository.deleteWeight(Number(id), user_id)
  if (result.count === 0) throw new Error('Weight entry not found')
  return { message: 'Weight entry deleted successfully' }
}

const getMeasurements = async (user_id) => {
  return progressRepository.findMeasurements(user_id)
}

const logMeasurement = async (user_id, data) => {
  return progressRepository.createMeasurement({
    user_id,
    chest_cm: data.chest_cm,
    waist_cm: data.waist_cm,
    arms_cm: data.arms_cm,
    thighs_cm: data.thighs_cm,
    calves_cm: data.calves_cm,
    shoulders_cm: data.shoulders_cm,
    logged_at: data.logged_at ? new Date(data.logged_at) : undefined
  })
}

const deleteMeasurement = async (user_id, id) => {
  const result = await progressRepository.deleteMeasurement(Number(id), user_id)
  if (result.count === 0) throw new Error('Measurement entry not found')
  return { message: 'Measurement entry deleted successfully' }
}

const getRecords = async (user_id) => {
  return progressRepository.findRecords(user_id)
}

const getRecordsByExercise = async (user_id, exerciseId) => {
  const records = await progressRepository.findRecordsByExercise(user_id, Number(exerciseId))
  if (!records.length) throw new Error('Personal record not found')
  return records
}

module.exports = {
  getWeights,
  logWeight,
  deleteWeight,
  getMeasurements,
  logMeasurement,
  deleteMeasurement,
  getRecords,
  getRecordsByExercise
}
